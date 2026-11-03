<script lang="ts">
  let {
    text,
    label = 'Copy',
    copiedLabel = 'Copied',
  }: { text: string; label?: string; copiedLabel?: string } = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      clearTimeout(timer);
      timer = setTimeout(() => (copied = false), 1600);
    } catch {
      copied = false;
    }
  }
</script>

<button
  type="button"
  class="inline-flex items-center gap-1.5 rounded-full border border-[var(--tessa-border-soft)] bg-[var(--tessa-surface)]/70 px-3 py-1.5 text-xs font-medium text-[var(--tessa-muted)] transition hover:border-[var(--tessa-border)] hover:text-[var(--tessa-text)]"
  onclick={copy}
  aria-live="polite"
>
  {#if copied}
    <svg class="size-3.5 text-[var(--tessa-accent)]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    {copiedLabel}
  {:else}
    <svg class="size-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.7" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.7" />
    </svg>
    {label}
  {/if}
</button>
