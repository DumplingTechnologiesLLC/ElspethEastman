import type { UIAlert } from '../../domain/models/UIAlert';
export function getSubmissionAlert(
  status: number | null,
  overrides: Readonly<Partial<Record<number, UIAlert>>> = {},
): UIAlert | undefined {
  switch (status) {
    case null:
      return undefined;
    case 200:
      return (
        overrides[status] ?? {
          title: 'Success',
          content: 'Action submitted successfully.',
          flavor: 'success',
        }
      );
    case 400:
      return (
        overrides[status] ?? {
          title: 'Error',
          content: 'There was a problem with your submission',
          flavor: 'error',
        }
      );
    default:
      return overrides[status];
  }
}
