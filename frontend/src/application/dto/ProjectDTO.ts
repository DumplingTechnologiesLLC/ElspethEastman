/** The project's JSON representation at the Django API boundary. */
export interface ProjectDTO {
  id: number;
  src: string;
  title: string;
  uuid: number | null;
}
