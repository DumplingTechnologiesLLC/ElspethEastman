/** The project's JSON representation at the Django API boundary. */
export interface ProjectDTO {
  id: string;
  src: string;
  title: string;
  uuid: string | null;
}
