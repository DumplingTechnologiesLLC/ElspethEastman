/** Build only named DTO fields, omitting undefined while retaining explicit nulls. */
export function suppliedField<T extends object>() {
  return <Key extends keyof T>(
    key: Key,
    value: T[Key] | undefined,
  ): Partial<Pick<T, Key>> => {
    const fields: Partial<Pick<T, Key>> = {};
    if (value !== undefined) fields[key] = value;
    return fields;
  };
}

export function mapDefined<T, U>(
  value: T | undefined,
  map: (input: T) => U,
): U | undefined {
  return value === undefined ? undefined : map(value);
}
export function mapNullable<T, U>(
  value: T | null,
  map: (input: T) => U,
): U | null {
  return value === null ? null : map(value);
}
