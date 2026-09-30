import { csvParse, range } from 'd3';
import type { TMovie } from '../types';

const missing = new Set(['', 'NA', 'N/A', '\\N']);
function numeric(value: string | undefined): number | null {
  if (value === undefined || missing.has(value.trim())) return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

export function parseMovies(csv: string): TMovie[] {
  return csvParse(csv).map((row, index) => {
    const year = numeric(row.year);
    if (year !== null && !Number.isInteger(year)) throw new Error(`Invalid year on CSV row ${index + 2}`);
    const genres = [...new Set((row.genres ?? '').split(',').map(g => g.trim()).filter(g => !missing.has(g)))];
    return {
      tconst: row.tconst ?? '', title_type: row.title_type ?? '',
      primary_title: row.primary_title ?? '', original_title: row.original_title ?? '',
      simple_title: row.simple_title ?? '', year: year === null ? null : new Date(Date.UTC(year, 0, 1)),
      runtime_minutes: numeric(row.runtime_minutes), genres,
      average_rating: numeric(row.average_rating), num_votes: numeric(row.num_votes) ?? 0
    };
  });
}

export function summarize(movies: TMovie[]) {
  const counts = new Map<string, number>();
  const annual = new Map<number, Map<string, number>>();
  const pairs = new Map<string, number>();
  let unknown = 0;
  let unknownYear = 0;
  for (const movie of movies) {
    const year = movie.year?.getUTCFullYear();
    if (year === undefined) unknownYear++;
    else if (!annual.has(year)) annual.set(year, new Map());
    const yearCounts = year === undefined ? undefined : annual.get(year)!;
    if (!movie.genres.length) unknown++;
    for (const genre of movie.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
      yearCounts?.set(genre, (yearCounts.get(genre) ?? 0) + 1);
      for (const other of movie.genres) {
        const key = `${genre}|${other}`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
      }
    }
  }
  const distribution = [...counts].map(([genre, count]) => ({ genre, count }));
  if (unknown) distribution.push({ genre: 'Unknown', count: unknown });
  distribution.sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
  const genres = distribution.filter(d => d.genre !== 'Unknown').map(d => d.genre);
  const recordedYears = [...annual.keys()].sort((a, b) => a - b);
  const years = recordedYears.length ? range(recordedYears[0], recordedYears.at(-1)! + 1) : [];
  // Competition ranking preserves ties: 1, 1, 3 or 1, 2, 2.
  const top = years.flatMap(year => {
    const entries = [...(annual.get(year) ?? [])].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return entries.map(([genre, count]) => ({
      year, genre, count, rank: 1 + entries.filter(([, otherCount]) => otherCount > count).length
    })).filter(d => d.rank <= 3);
  });
  const topGenres = genres.filter(genre => top.some(d => d.genre === genre));
  const eligibleYears = recordedYears.filter(year => annual.get(year)!.size > 0).length;
  const appearances = genres.map(genre => ({ genre, count: top.filter(d => d.genre === genre).length }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
  const comedyPairs = genres.filter(g => g !== 'Comedy')
    .map(genre => ({ genre, count: pairs.get(`Comedy|${genre}`) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
  const strongest = genres.flatMap((a, i) => genres.slice(i + 1).map(b => ({
    a, b, count: pairs.get(`${a}|${b}`) ?? 0
  }))).sort((a, b) => b.count - a.count)[0];
  return { counts, distribution, genres, years, top, topGenres, eligibleYears, appearances, pairs, comedyPairs, strongest, unknown, unknownYear };
}
