<script lang="ts">
    import { base } from '$app/paths';

    let maxClick = $state(4);
    let cnt = $state(4);

    function onClick() {
        if (cnt > 0){
            cnt -= 1;
        }
    }
    function resetCount(){
        cnt = maxClick;
    }
</script>

<h1>Tianlin Lu's VIS Site</h1>
<img
  src={`${base}/meInAnimate.jpg`}
  alt="myFavouritePhoto"
  width="200"
/>
<div>
  <label>
    You can click up to
    <select bind:value={maxClick} onchange={resetCount}>
      {#each [2, 4, 6] as optionNum}
        <option value={optionNum}>{optionNum}</option>
      {/each}
    </select>
    times
  </label>
</div>

<button onclick={onClick} disabled={cnt === 0}>
  Click Me
</button>

{#if cnt > 0}
  <p>Remaining Number of Clicks: {cnt}</p>
{:else}
  <p>No more clicks allowed</p>
{/if}

<style>
  :global(body) {
    font-family: Arial, Helvetica, sans-serif;
  }

  button {
    background-color: #44aa66;
    color: white;
    font-size: xx-large;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 12px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>