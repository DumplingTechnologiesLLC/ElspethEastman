export class Project {
  constructor(
    readonly id: number,
    readonly src: string,
    readonly title: string,
    readonly uuid: number | null,
  ) {}
  withField(field: 'src' | 'title', value: string): Project {
    return new Project(
      this.id,
      field === 'src' ? value : this.src,
      field === 'title' ? value : this.title,
      this.uuid,
    );
  }
}
