<script lang="ts">
  import { interpolateGreens, scaleSequential } from 'd3';
  import { summarize } from './movies';
  import type { TMovie } from '../types';
  let { movies }: { movies: TMovie[] } = $props();
  const data = $derived(summarize(movies));
  let selectedGenre = $state('Comedy');
  const cell = 25;
  const size = $derived(140 + data.genres.length * cell);
  const largest = $derived(Math.max(1, data.strongest?.count ?? 0));
  const color = $derived(scaleSequential(interpolateGreens).domain([0, largest]));
  const partners = $derived(data.genres.filter(g => g !== selectedGenre).map(genre => ({ genre, count: data.pairs.get(`${selectedGenre}|${genre}`) ?? 0 })).sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre)).slice(0, 5));
</script>

<p class="note">Both axes show movie genres. Each square counts movies with both genres; darker green means more co-occurrences. The gray diagonal is omitted because it would only repeat genre totals.</p>
<div class="legend"><span>0 movies</span><div style:background={`linear-gradient(to right, ${color(0)}, ${color(largest)})`}></div><span>{largest} movies</span></div>
<div class="chart-scroll">
  <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-labelledby="matrix-title matrix-desc">
    <title id="matrix-title">Movie genre co-occurrence matrix</title>
    <desc id="matrix-desc">Each off-diagonal square counts movies tagged with both its row and column genre. Hover for exact counts or use the genre selector below.</desc>
    {#each data.genres as a, i}
      <text x="108" y={120 + i * cell + cell / 2 + 4} text-anchor="end">{a}</text>
      <text transform={`translate(${120 + i * cell + cell / 2},108) rotate(-52)`} text-anchor="start">{a}</text>
      {#each data.genres as b, j}
        {@const count = data.pairs.get(`${a}|${b}`) ?? 0}
        <rect x={120 + j * cell} y={120 + i * cell} width={cell - 1} height={cell - 1}
          fill={a === b ? '#e3e6e3' : color(count)} stroke={a === selectedGenre && a !== b ? '#3d7560' : 'none'} stroke-width="1">
          <title>{a === b ? `${a}: diagonal omitted` : `${a} + ${b}: ${count} movies`}</title>
        </rect>
      {/each}
    {/each}
  </svg>
</div>
<div class="detail">
  <label>Explore co-occurrences with <select bind:value={selectedGenre}>{#each data.genres as genre}<option value={genre}>{genre}</option>{/each}</select></label>
  <p>{data.counts.get(selectedGenre)} movies have the {selectedGenre} tag. Most frequent partners:</p>
  <table><thead><tr><th>Partner genre</th><th>Shared movies</th><th>% of {selectedGenre} movies</th></tr></thead>
    <tbody>{#each partners as partner}<tr><td>{partner.genre}</td><td>{partner.count}</td><td>{(100 * partner.count / (data.counts.get(selectedGenre) || 1)).toFixed(1)}%</td></tr>{/each}</tbody>
  </table>
</div>
<p class="note">Co-occurrence describes shared tags, not causation or a statistical correlation coefficient. Common genres naturally have more opportunities to co-occur. Percentages may overlap because a movie can have up to three tags. Unknown tags are excluded.</p>

<style>
  .chart-scroll { overflow-x: auto; }
  svg { display: block; width: min(100%, 820px); min-width: 710px; margin: 18px auto; }
  text { font: 11px Arial, sans-serif; fill: #33483f; }
  rect:hover { stroke: #142e22; stroke-width: 2px; }
  .legend { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 13px; }
  .legend div { width: 200px; height: 14px; border: 1px solid #bdccbf; }
  .detail { background: #f3f7f3; padding: 18px; border-radius: 8px; }
  select { margin-left: 8px; padding: 6px 10px; background: white; border: 1px solid #a6bcae; border-radius: 5px; }
  table { width: 100%; max-width: 620px; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #dbe5dc; }
  .note { color: #596a60; font-size: 13px; line-height: 1.6; }
</style>
