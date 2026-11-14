import { parseSync, Visitor } from 'oxc-parser';
export interface Violation {
  file: string;
  message: string;
}
/** Checks syntax-level boundaries; DOM-only hook behavior still requires review. */
export function inspectArchitecture(file: string, source: string): Violation[] {
  const result: Violation[] = [];
  const fail = (message: string) => {
    result.push({ file, message });
  };
  const { program, errors } = parseSync(file, source);
  for (const error of errors)
    fail(`Cannot inspect invalid syntax: ${error.message}`);
  const wired = file.endsWith('.wired.tsx');
  const presentation = file.endsWith('.presentational.tsx');
  const story = file.endsWith('.stories.tsx');
  const expected =
    'use' + file.split('/').at(-1)!.replace('.wired.tsx', '') + 'State';
  const calls: string[] = [];
  new Visitor({
    ImportDeclaration(node) {
      const target = String(node.source.value);
      const typeOnly = node.importKind === 'type';
      if ((presentation || story) && target.includes('.wired'))
        fail('Presentation and stories cannot import wired components.');
      if (
        presentation &&
        !typeOnly &&
        (/\/domain\//.test(target) || /use[A-Z].*State/.test(target))
      )
        fail('Presentation cannot import business services or state hooks.');
    },
    CallExpression(node) {
      const callee = source.slice(node.callee.start, node.callee.end);
      if (wired) calls.push(callee);
      if (/(^|\.)(createContext|useContext)$/.test(callee))
        fail(
          'Context providers are forbidden; pass a scoped service container explicitly.',
        );
      if (
        presentation &&
        (/(^|\.)(fetch|use.*Service|useSyncExternalStore)$/.test(callee) ||
          /\.(localStorage|sessionStorage)\./.test(callee))
      )
        fail(
          'Presentation cannot perform business I/O or subscribe to services.',
        );
    },
    Property(node) {
      if (
        node.value.type !== 'ObjectExpression' &&
        [
          'border',
          'borderTop',
          'borderBottom',
          'borderLeft',
          'borderRight',
          'font',
          'background',
        ].includes(
          source.slice(node.key.start, node.key.end).replaceAll("'", ''),
        )
      )
        fail('Use StyleX longhand properties for multi-value CSS shorthands.');
    },
  }).visit(program);
  if (wired && (calls.length !== 1 || calls[0] !== expected))
    fail(`Wired components may only call ${expected}.`);
  return result;
}
