<script lang="ts">
  import { onMount } from 'svelte';

  let { label = 'Toggle theme' }: { label?: string } = $props();
  let theme = $state<'dark' | 'light'>('dark');
  let ready = $state(false);

  function apply(next: 'dark' | 'light') {
    theme = next;
    document.documentElement.dataset.theme = next;
    localStorage.setItem('starlight-theme', next);
  }

  function toggle() {
    apply(theme === 'dark' ? 'light' : 'dark');
  }

  onMount(() => {
    const stored = localStorage.getItem('starlight-theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    theme = stored === 'light' || (stored !== 'dark' && prefersLight) ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    ready = true;
  });
</script>

<button
  type="button"
  class="grid size-9 place-items-center rounded-full border border-[var(--tessa-border-soft)] bg-[var(--tessa-surface)]/60 text-[var(--tessa-muted)] transition hover:border-[var(--tessa-border)] hover:text-[var(--tessa-text)]"
  onclick={toggle}
  aria-label={label}
  title={label}
>
  {#if ready && theme === 'light'}
    <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
    </svg>
  {:else}
    <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
    </svg>
  {/if}
</button>
