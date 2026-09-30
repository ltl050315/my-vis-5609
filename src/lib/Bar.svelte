<script lang="ts">
  import { max, scaleBand, scaleLinear } from 'd3';
  import { summarize } from './movies';
  import type { TMovie } from '../types';
  let { movies }: { movies: TMovie[] } = $props();
  let selected = $state<string | null>(null);
  const data = $derived(summarize(movies).distribution);
  const x = $derived(scaleBand<string>().domain(data.map(d => d.genre)).range([60, 1080]).padding(0.24));
  const y = $derived(scaleLinear().domain([0, max(data, d => d.count) ?? 1]).nice().range([330, 25]));
</script>

<div class="chart-scroll">
  <svg viewBox="0 0 1100 445" role="img" aria-labelledby="bar-title bar-desc">
    <title id="bar-title">Distribution of movie genres</title>
    <desc id="bar-desc">Bars show movie counts, sorted from largest to smallest. A movie may contribute to several genres.</desc>
    <text x="60" y="14" class="axis-title">Number of movies</text>
    {#each y.ticks(6) as tick}
      <line x1="60" x2="1080" y1={y(tick)} y2={y(tick)} stroke="#e3e9e6" />
      <text x="50" y={y(tick) + 4} text-anchor="end">{tick}</text>
    {/each}
    {#each data as d}
      <g role="button" tabindex="0" aria-label={`${d.genre}: ${d.count} movies`}
        onmouseenter={() => selected = d.genre} onmouseleave={() => selected = null}
        onfocus={() => selected = d.genre} onblur={() => selected = null}
        onclick={() => selected = selected === d.genre ? null : d.genre}
        onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selected = selected === d.genre ? null : d.genre; } }}>
        <rect x={x(d.genre)} y={y(d.count)} width={x.bandwidth()} height={y(0) - y(d.count)} rx="2"
          fill={selected === d.genre ? '#155e4b' : '#94bd9b'} opacity={selected && selected !== d.genre ? 0.45 : 1} />
        <text x={x(d.genre)! + x.bandwidth() / 2} y={y(d.count) - 7} text-anchor="middle" font-weight={selected === d.genre ? 700 : 400}>{d.count}</text>
        <text transform={`translate(${x(d.genre)! + x.bandwidth() / 2}, 347) rotate(48)`} text-anchor="start">{d.genre}</text>
      </g>
    {/each}
    <text x="570" y="437" text-anchor="middle" class="axis-title">Movie genre</text>
  </svg>
</div>
<p class="readout" aria-live="polite">{selected ? `${selected}: ${data.find(d => d.genre === selected)?.count} movies` : 'Hover over or focus a bar to highlight its movie count.'}</p>

<style>
  svg { width: 100%; min-width: 780px; display: block; }
  text { font: 12px Arial, sans-serif; fill: #33483f; }
  .axis-title { font-size: 13px; font-weight: 600; }
  g[role='button'] { cursor: pointer; }
  g:focus rect { stroke: #173c32; stroke-width: 2px; }
  .chart-scroll { overflow-x: auto; }
  .readout { min-height: 24px; color: #155e4b; font-size: 14px; }
</style>
