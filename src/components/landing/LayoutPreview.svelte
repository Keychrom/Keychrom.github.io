<script lang="ts">
  import type { LandingCopy } from '../../i18n/landing';

  let { copy }: { copy: LandingCopy } = $props();

  type LayoutId = 'master' | 'mosaic' | 'grid' | 'columns' | 'scrolling' | 'monocle' | 'stacking';
  type Win = { x: number; y: number; w: number; h: number; z?: number };

  const order: LayoutId[] = ['master', 'mosaic', 'grid', 'columns', 'scrolling', 'monocle', 'stacking'];

  const layouts: Record<LayoutId, Win[]> = {
    master: [
      { x: 0, y: 0, w: 57, h: 100 },
      { x: 60, y: 0, w: 40, h: 48 },
      { x: 60, y: 52, w: 40, h: 48 },
    ],
    mosaic: [
      { x: 0, y: 0, w: 56, h: 54 },
      { x: 59, y: 0, w: 41, h: 36 },
      { x: 59, y: 39, w: 41, h: 61 },
      { x: 0, y: 57, w: 56, h: 43 },
    ],
    grid: [
      { x: 0, y: 0, w: 49, h: 48 },
      { x: 51, y: 0, w: 49, h: 48 },
      { x: 0, y: 52, w: 49, h: 48 },
      { x: 51, y: 52, w: 49, h: 48 },
    ],
    columns: [
      { x: 0, y: 0, w: 31, h: 100 },
      { x: 34.5, y: 0, w: 31, h: 100 },
      { x: 69, y: 0, w: 31, h: 100 },
    ],
    scrolling: [
      { x: 0, y: 0, w: 40, h: 100 },
      { x: 43, y: 0, w: 34, h: 100 },
      { x: 80, y: 0, w: 34, h: 100 },
      { x: 117, y: 0, w: 34, h: 100 },
    ],
    monocle: [{ x: 0, y: 0, w: 100, h: 100 }],
    stacking: [
      { x: 0, y: 0, w: 76, h: 100, z: 0 },
      { x: 10, y: 7, w: 76, h: 86, z: 1 },
      { x: 20, y: 14, w: 76, h: 72, z: 2 },
      { x: 30, y: 21, w: 70, h: 58, z: 3 },
    ],
  };

  let selected = $state<LayoutId>('master');
  let active = $derived(layouts[selected]);

  function select(id: LayoutId) {
    selected = id;
  }

  function onKeydown(event: KeyboardEvent, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : order.length - 1;
    const next = order[(index + delta) % order.length];
    select(next);
    document.getElementById(`layout-tab-${next}`)?.focus();
  }
</script>

<div class="overflow-hidden rounded-2xl border border-[var(--tessa-border-soft)] bg-[var(--tessa-bg-soft)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
  <div class="flex items-center justify-between gap-3 border-b border-[var(--tessa-border-soft)] px-4 py-3">
    <div class="flex items-center gap-1.5" aria-hidden="true">
      <span class="size-2 rounded-full bg-[#f08a72]/80"></span>
      <span class="size-2 rounded-full bg-[#d7b36a]/70"></span>
      <span class="size-2 rounded-full bg-[#6f9f8a]/70"></span>
    </div>
    <span class="font-mono text-[0.65rem] tracking-[0.14em] text-[var(--tessa-faint)]">HEADLESS-1 · 1920×1080</span>
    <span class="font-mono text-[0.65rem] text-[var(--tessa-accent-2)]">{selected}</span>
  </div>

  <div
    class="relative mx-4 mt-4 aspect-[16/10] overflow-hidden rounded-xl border border-[var(--tessa-border-soft)] bg-[var(--tessa-bg)]"
    role="img"
    aria-label={`${copy.layout.labels[selected]} layout preview`}
  >
    <div class="absolute inset-0 grid-field opacity-70"></div>
    {#each active as win, i (i)}
      <div
        class="absolute rounded-[5px] border border-[var(--tessa-accent)]/35 bg-[linear-gradient(155deg,rgba(226,104,79,0.16),rgba(20,29,44,0.86))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[left,top,width,height] duration-500 ease-out"
        style={`left:${win.x}%; top:${win.y}%; width:${win.w}%; height:${win.h}%; z-index:${win.z ?? 0};`}
      >
        <div class="flex items-center gap-1 border-b border-white/5 px-2 py-1">
          <span class="size-1 rounded-full bg-[var(--tessa-accent-2)]/70"></span>
          <span class="h-1 w-6 rounded-full bg-white/10"></span>
        </div>
        <div class="space-y-1 p-2">
          <span class="block h-1 w-2/3 rounded-full bg-white/12"></span>
          <span class="block h-1 w-1/2 rounded-full bg-white/8"></span>
          <span class="block h-1 w-3/4 rounded-full bg-[var(--tessa-accent)]/20"></span>
        </div>
      </div>
    {/each}
    <div class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--tessa-bg)] to-transparent"></div>
  </div>

  <div class="flex flex-wrap gap-1.5 p-4" role="tablist" aria-label={copy.layout.title}>
    {#each order as id, i}
      <button
        id={`layout-tab-${id}`}
        type="button"
        role="tab"
        aria-selected={selected === id}
        tabindex={selected === id ? 0 : -1}
        class="rounded-full border px-3 py-1.5 text-xs transition {selected === id
          ? 'border-[var(--tessa-accent)]/50 bg-[var(--tessa-accent)]/15 text-[var(--tessa-accent-2)]'
          : 'border-transparent text-[var(--tessa-faint)] hover:border-[var(--tessa-border-soft)] hover:text-[var(--tessa-text)]'}"
        onclick={() => select(id)}
        onkeydown={(event) => onKeydown(event, i)}
      >
        {copy.layout.labels[id]}
      </button>
    {/each}
  </div>
</div>
