import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { inspectArchitecture } from './architecture';
export function checkDirectory(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory()
      ? checkDirectory(file)
      : /\.tsx?$/.test(file)
        ? inspectArchitecture(file, readFileSync(file, 'utf8')).map(
            (item) => `${item.file}: ${item.message}`,
          )
        : [];
  });
}
export function reportViolations(
  violations: readonly string[],
  reporter: (message: string) => void = console.error,
): number {
  for (const violation of violations) reporter(violation);
  return Number(violations.length > 0);
}
process.exitCode = reportViolations(checkDirectory('frontend/src'));
