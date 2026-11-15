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
  const hookRenderers = new Set(['renderHook']);
  new Visitor({
    ImportDeclaration(node) {
      const target = String(node.source.value);
      if (target === '@testing-library/react') {
        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            source.slice(specifier.imported.start, specifier.imported.end) ===
              'renderHook'
          )
            hookRenderers.add(specifier.local.name);
        }
      }
      const typeOnly = node.importKind === 'type';
      if ((presentation || story) && target.includes('.wired'))
        fail('Presentation and stories cannot import wired components.');
      if (
        presentation &&
        !typeOnly &&
        (/\/(application\/services|domain\/ports|composition)\//.test(target) ||
          /use[A-Z].*State/.test(target))
      )
        fail('Presentation cannot import business services or state hooks.');
      if (
        file.includes('/domain/') &&
        /\/(application|composition|platform|hooks)\//.test(target)
      )
        fail('Domain models and ports cannot depend on implementations.');
    },
    CallExpression(node) {
      const callee = source.slice(node.callee.start, node.callee.end);
      if (
        (hookRenderers.has(callee) || callee.endsWith('.renderHook')) &&
        node.arguments[0]?.type !== 'Identifier'
      )
        fail(
          'Pass the hook directly to renderHook and supply inputs through initialProps.',
        );
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
    ConditionalExpression() {
      if (wired)
        fail(
          'Wired components cannot make policy decisions; project props in the state hook.',
        );
    },
    BinaryExpression() {
      if (wired)
        fail(
          'Wired components cannot make policy decisions; project props in the state hook.',
        );
    },
    LogicalExpression() {
      if (wired)
        fail(
          'Wired components cannot make policy decisions; project props in the state hook.',
        );
    },
    IfStatement() {
      if (wired)
        fail(
          'Wired components cannot make policy decisions; project props in the state hook.',
        );
    },
    SwitchStatement() {
      if (wired)
        fail(
          'Wired components cannot make policy decisions; project props in the state hook.',
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
