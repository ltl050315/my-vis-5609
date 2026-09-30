<script lang="ts">
  import { scaleBand } from 'd3';
  import { summarize } from './movies';
  import type { TMovie } from '../types';
  let { movies }: { movies: TMovie[] } = $props();
  const data = $derived(summarize(movies));
  let selectedYear = $state(2023);
  const colors = ['#175d4b', '#5c9e84', '#b9d8c5'];
  const height = $derived(90 + data.topGenres.length * 27);
  const x = $derived(scaleBand<number>().domain(data.years).range([118, 1120]).padding(0.1));
  const y = $derived(scaleBand<string>().domain(data.topGenres).range([30, height - 60]).padding(0.12));
  const selected = $derived(data.top.filter(d => d.year === Number(selectedYear)).sort((a, b) => a.rank - b.rank || a.genre.localeCompare(b.genre)));
</script>

<div class="legend">Annual rank: {#each colors as color, i}<span><i style:background={color}></i>{i + 1}</span>{/each}<span><i style:background="#f0f2f0"></i>Outside top 3 / no data</span></div>
<div class="chart-scroll">
  <svg viewBox={`0 0 1140 ${height}`} role="img" aria-labelledby="annual-title annual-desc">
    <title id="annual-title">Annual top-three movie genres</title>
    <desc id="annual-desc">Columns are years, rows are genres. Darker green indicates a higher annual rank. Ties are included.</desc>
    {#each data.topGenres as genre}
      <text x="110" y={y(genre)! + y.bandwidth() / 2 + 4} text-anchor="end">{genre}</text>
      {#each data.years as year}
        <rect x={x(year)} y={y(genre)} width={x.bandwidth()} height={y.bandwidth()} fill="#f0f2f0" />
      {/each}
    {/each}
    {#each data.top as d}
      <rect x={x(d.year)} y={y(d.genre)} width={x.bandwidth()} height={y.bandwidth()} fill={colors[d.rank - 1]}>
        <title>{d.year} · {d.genre}: rank {d.rank}, {d.count} movies</title>
      </rect>
    {/each}
    {#each data.years.filter(year => year % 5 === 0 || year === data.years.at(-1)) as year}
      <text x={x(year)! + x.bandwidth() / 2} y={height - 39} text-anchor="middle">{year}</text>
    {/each}
    <text x="620" y={height - 10} text-anchor="middle">Release year</text>
  </svg>
</div>
<div class="detail">
  <label>Inspect a year <select bind:value={selectedYear}>{#each data.years as year}<option value={year}>{year}</option>{/each}</select></label>
  <p aria-live="polite">{selected.length ? selected.map(d => `#${d.rank} ${d.genre} (${d.count})`).join(' · ') : 'No movies with known genres in this year.'}</p>
</div>
<p class="note">Rank is based on movie counts within each year. Ties share a rank (1, 1, 3 or 1, 2, 2), so more than three genres can qualify. Rows include every genre that ever reached the top three. Unknown genres and {data.unknownYear} movies with missing release years are excluded from this chart.</p>

<style>
  .chart-scroll { overflow-x: auto; }
  svg { width: 100%; min-width: 1050px; display: block; }
  text { font: 12px Arial, sans-serif; fill: #33483f; }
  .legend { display: flex; flex-wrap: wrap; gap: 15px; font-size: 13px; margin-bottom: 12px; }
  .legend span { display: inline-flex; align-items: center; gap: 6px; }
  i { display: inline-block; width: 14px; height: 14px; border: 1px solid #c4d2c9; }
  .detail { background: #f3f7f3; padding: 14px 18px; border-radius: 8px; margin-top: 12px; }
  select { margin-left: 12px; padding: 6px 12px; border: 1px solid #a6bcae; border-radius: 5px; background: white; }
  .detail p { margin: 10px 0 0; font-size: 14px; }
  .note { color: #596a60; font-size: 13px; line-height: 1.6; }
</style>
