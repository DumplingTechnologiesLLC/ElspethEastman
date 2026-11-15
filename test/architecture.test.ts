import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectArchitecture } from '../tooling/architecture';
import { checkDirectory } from '../tooling/check-architecture';
it('allows a single own state hook at a wired boundary', () => {
  expect(
    inspectArchitecture(
      'Foo/Foo.wired.tsx',
      `import {useFooState} from './useFooState';export function FooWired(props){const state=useFooState(props);return <Foo {...state}/>}`,
    ),
  ).toEqual([]);
  for (const source of [
    `useState();`,
    `useFooState();fetch('/api');`,
    `const x=1;`,
  ])
    expect(inspectArchitecture('Foo/Foo.wired.tsx', source)).toHaveLength(1);
});
it('rejects wired imports from presentations and stories and accepts ordinary imports', () => {
  for (const file of ['Foo.presentational.tsx', 'Foo.stories.tsx'])
    expect(
      inspectArchitecture(file, `import {Foo} from './Foo.wired';`)[0]!.message,
    ).toContain('cannot import wired');
  expect(
    inspectArchitecture(
      'Foo.presentational.tsx',
      `import type {Data} from '../../domain/models/Data';import {Category} from '../../domain/models/Category';import {Button} from './Button.presentational';`,
    ),
  ).toEqual([]);
});
it('rejects service imports, hooks, contexts and business IO from presentations', () => {
  const source = `import {session} from '../../application/services/SessionService';import {useFooState} from './useFooState';createContext();React.useContext(x);fetch('/api');useFooService();useSyncExternalStore();window.sessionStorage.getItem('token');`;
  expect(inspectArchitecture('Foo.presentational.tsx', source)).toHaveLength(8);
  expect(
    inspectArchitecture(
      'Foo.presentational.tsx',
      'useState(false);useRef(null);useEffect(effect);',
    ),
  ).toEqual([]);
});
it('rejects unsupported StyleX shorthands', () => {
  expect(
    inspectArchitecture(
      'styles.ts',
      `const css={border:'1px solid red','background':'blue',font:'serif'};`,
    ),
  ).toHaveLength(3);
  expect(
    inspectArchitecture('styles.ts', `const css={borderWidth:1,color:'red'};`),
  ).toEqual([]);
});
it('traverses source directories and reports file-qualified failures', () => {
  const folder = mkdtempSync(join(tmpdir(), 'elspeth-architecture-'));
  try {
    mkdirSync(join(folder, 'nested'));
    writeFileSync(
      join(folder, 'nested', 'Foo.presentational.tsx'),
      `import './Foo.wired';`,
    );
    writeFileSync(join(folder, 'readme.md'), 'Ignored');
    const violations = checkDirectory(folder);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Foo.presentational.tsx:');
  } finally {
    rmSync(folder, { recursive: true });
  }
});
it('reports syntax failures and surfaces violations to the CLI reporter', async () => {
  expect(inspectArchitecture('invalid.ts', 'const =')).not.toHaveLength(0);
  const { reportViolations } = await import('../tooling/check-architecture');
  const messages: string[] = [];
  expect(
    reportViolations(['broken'], (message) => messages.push(message)),
  ).toBe(1);
  expect(messages).toEqual(['broken']);
});
it.each([
  'const state=useFooState();const mode=state.page === "cms";',
  'const state=useFooState();const mode=state.page ? "all" : "latest";',
  'const state=useFooState();const mode=state.page || "latest";',
  'const state=useFooState();if(state.page){}',
  'const state=useFooState();switch(state.page){}',
])('rejects policy decisions at the wired boundary: %s', (source) => {
  expect(inspectArchitecture('Foo/Foo.wired.tsx', source)).toEqual([
    expect.objectContaining({
      message: expect.stringContaining('cannot make policy decisions'),
    }),
  ]);
});
it.each([
  'renderHook(() => useFooState(props));',
  'renderHook(function(){return useFooState(props)});',
  'RTL.renderHook(() => useFooState(props));',
  'renderHook();',
  "import {renderHook as renderState} from '@testing-library/react';renderState(()=>useFooState(props));",
])('rejects renderHook wrappers: %s', (source) => {
  expect(inspectArchitecture('Foo.test.ts', source)).toHaveLength(1);
});
it('accepts a direct hook and initialProps', () => {
  expect(
    inspectArchitecture(
      'Foo.test.ts',
      'renderHook(useFooState,{initialProps:props});',
    ),
  ).toEqual([]);
});
it('keeps domain models and ports independent of implementations', () => {
  expect(
    inspectArchitecture(
      'frontend/src/domain/ports/Api.ts',
      "import {ApiService} from '../../application/services/ApiService';",
    ),
  ).toHaveLength(1);
  expect(
    inspectArchitecture(
      'frontend/src/domain/models/Project.ts',
      "import type {ProjectId} from './ProjectId';",
    ),
  ).toEqual([]);
});
