<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import Bar from '$lib/Bar.svelte';
  import AnnualTop from '$lib/AnnualTop.svelte';
  import Cooccurrence from '$lib/Cooccurrence.svelte';
  import { parseMovies, summarize } from '$lib/movies';
  import type { TMovie } from '../../types';
  let movies: TMovie[] = $state([]);
  let error = $state('');
  let loading = $state(true);
  const summary = $derived(summarize(movies));
  const always = $derived(summary.appearances.filter(d => d.count === summary.eligibleYears));
  const comparisonYears = $derived([2000, summary.years.at(-1)].filter((year): year is number => year !== undefined));
  const yearComparison = $derived(comparisonYears.map(year => {
    const leaders = summary.top.filter(d => d.year === year).sort((a, b) => a.rank - b.rank || a.genre.localeCompare(b.genre));
    return `In ${year}, the top-ranked genres were ${leaders.map(d => `${d.genre} (#${d.rank}, ${d.count} movies)`).join(', ')}.`;
  }).join(' '));
  onMount(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${base}/summer_movies.csv`, { signal: controller.signal });
        if (!response.ok) throw new Error(`CSV request failed (${response.status})`);
        movies = parseMovies(await response.text());
        if (!movies.length) throw new Error('The movie dataset is empty.');
      } catch (cause) {
        if (!controller.signal.aborted) error = cause instanceof Error ? cause.message : 'Unable to load movie data.';
      } finally { loading = false; }
    }
    void load();
    return () => controller.abort();
  });
</script>

<svelte:head><title>Summer Movies · A1 Visual Encoding</title><meta name="description" content="Exploring annual genre rankings and genre co-occurrence in 899 summer-titled IMDb movies." /></svelte:head>

<main>
  <nav><a href={`${base}/`}>Home</a><a href={`${base}/A0/`}>A0</a><span>A1 · Visual Encoding</span></nav>
  <header><p class="eyebrow">CSCI 5609 / ASSIGNMENT 01</p><h1>Summer Movies</h1><p class="intro">Which genres define “summer” on screen?</p>
    <p>Exploring movies whose titles contain “summer,” using the provided IMDb dataset.</p>
  </header>
  {#if loading}<p role="status">Loading movie data…</p>
  {:else if error}<p role="alert" class="error">{error} Please reload the page to try again.</p>
  {:else}
    <div class="stats"><div><strong>{movies.length}</strong><span>movies</span></div><div><strong>{summary.years[0]}–{summary.years.at(-1)}</strong><span>release years</span></div><div><strong>{summary.genres.length}</strong><span>known genres</span></div></div>
    <section><p class="eyebrow">OVERVIEW</p><h2>The distribution of genres, {summary.years[0]}–{summary.years.at(-1)}</h2>
      <p>Each movie contributes once to each of its genre tags. “Unknown” represents {summary.unknown} movies with missing genre information.</p><Bar {movies} />
    </section>
    <section><p class="eyebrow">QUESTION 01</p><h2>How do the annual top three genres change over time?</h2>
      <p>Read down a year to find its leading genres, or across a row to follow a genre through time.</p><AnnualTop {movies} />
      <aside><h3>What the data shows</h3><p>{summary.appearances[0]?.genre} reaches the annual top three most often: {summary.appearances[0]?.count} of {summary.eligibleYears} years with known genres. {summary.appearances.slice(1, 3).map(d => `${d.genre} appears in ${d.count} years`).join('; ')}. {always.length ? `${always.map(d => d.genre).join(', ')} stays in the top three in every eligible year.` : 'No genre stays in the top three in every eligible year.'} {yearComparison} This comparison shows that top-three membership changes even though Drama and Comedy remain frequent leaders. These rankings describe this summer-title dataset, not the entire film industry.</p></aside>
    </section>
    <section><p class="eyebrow">QUESTION 02</p><h2>Which genres tend to occur together?</h2><Cooccurrence {movies} />
      <aside><h3>What the data shows</h3><p>{summary.strongest?.a} and {summary.strongest?.b} form the most frequent genre pair ({summary.strongest?.count} movies). Comedy most often co-occurs with {summary.comedyPairs[0]?.genre} ({summary.comedyPairs[0]?.count} movies), followed by {summary.comedyPairs[1]?.genre} ({summary.comedyPairs[1]?.count}). The most frequent Comedy pairing appears in {(100 * (summary.comedyPairs[0]?.count ?? 0) / (summary.counts.get('Comedy') || 1)).toFixed(1)}% of Comedy-tagged movies.</p></aside>
    </section>
    <footer>Source: the course-provided summer_movies.csv, derived from IMDb non-commercial data. Counts include every title format provided in the dataset.</footer>
  {/if}
</main>

<style>
  :global(body) { margin: 0; background: #f5f7f2; color: #203c30; font-family: Arial, Helvetica, sans-serif; }
  :global(*) { box-sizing: border-box; }
  main { max-width: 1240px; margin: auto; padding: 28px 32px 60px; }
  nav { display: flex; gap: 24px; font-size: 14px; padding-bottom: 28px; border-bottom: 1px solid #d7e1d6; }
  nav a { color: #22624b; } nav span { margin-left: auto; color: #627366; }
  header { padding: 40px 0 25px; } .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.15em; color: #617762; }
  h1 { font-size: clamp(38px, 6vw, 62px); letter-spacing: -0.04em; margin: 12px 0; }
  .intro { font-size: 23px; margin: 12px 0; } p { line-height: 1.65; }
  .stats { display: flex; gap: 55px; margin: 4px 0 34px; } .stats div { display: flex; flex-direction: column; gap: 6px; } .stats strong { font-size: 25px; } .stats span { color: #657669; font-size: 14px; }
  section { background: white; border: 1px solid #dce4d9; border-radius: 12px; padding: 28px; margin-bottom: 28px; }
  h2 { font-size: 23px; line-height: 1.35; margin: 8px 0 12px; } section > p:not(.eyebrow) { color: #596a60; font-size: 14px; }
  aside { margin-top: 22px; border-left: 3px solid #5c9e84; padding: 4px 18px; } h3 { font-size: 15px; margin: 0; } aside p { font-size: 14px; margin-bottom: 0; }
  footer { color: #657669; font-size: 12px; line-height: 1.6; } .error { color: #a32626; }
  @media (max-width: 600px) { main { padding: 20px 14px; } section { padding: 16px; } nav { gap: 14px; } .stats { gap: 24px; } .stats strong { font-size: 20px; } }
</style>
