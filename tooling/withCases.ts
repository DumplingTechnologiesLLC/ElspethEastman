/** Supplies table rows to native registrations so Playwright retains spec locations and fixture discovery. */
export function withCases<Test extends object>(base: Test) {
  return Object.assign(base, {
    each<Row>(rows: readonly Row[]) {
      return (register: (row: Row) => void): void => {
        for (const row of rows) register(row);
      };
    },
  });
}
