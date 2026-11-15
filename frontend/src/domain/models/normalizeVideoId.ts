export function normalizeVideoId(value: string): string {
  const embed = 'embed/';
  const watch = 'watch?v=';
  if (value.includes(embed))
    return value.slice(value.indexOf(embed) + embed.length);
  if (value.includes(watch))
    return value.slice(value.indexOf(watch) + watch.length).split('&')[0]!;
  return value;
}
