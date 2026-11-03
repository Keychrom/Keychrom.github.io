<script lang="ts">
  import type { LandingCopy } from '../../i18n/landing';

  let { copy }: { copy: LandingCopy } = $props();

  const bars = $derived([
    { label: copy.benchmark.single, value: '59.7 fps', pct: 99.6, tone: 'accent' },
    { label: copy.benchmark.multi, value: '53.3 fps', pct: 89.0, tone: 'soft' },
    { label: copy.benchmark.comp, value: '2.4 / 4.6 ms', pct: 48, tone: 'muted' },
    { label: copy.benchmark.idle, value: '0.21 %', pct: 8, tone: 'faint' },
  ]);
</script>

<div class="grid gap-3">
  {#each bars as bar}
    <div class="grid gap-1.5">
      <div class="flex items-baseline justify-between gap-3">
        <span class="text-xs text-[var(--tessa-faint)]">{bar.label}</span>
        <span class="font-mono text-[0.72rem] text-[var(--tessa-text)]">{bar.value}</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-[var(--tessa-surface-2)]">
        <div
          class="h-full rounded-full {bar.tone === 'accent'
            ? 'bg-[var(--tessa-accent)]'
            : bar.tone === 'soft'
              ? 'bg-[var(--tessa-accent-2)]/70'
              : bar.tone === 'muted'
                ? 'bg-[var(--tessa-muted)]/60'
                : 'bg-[var(--tessa-faint)]/40'}"
          style={`width:${bar.pct}%`}
        ></div>
      </div>
    </div>
  {/each}
</div>
