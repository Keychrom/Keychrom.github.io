<script lang="ts">
  import type { LandingCopy } from '../../i18n/landing';

  let {
    copy,
    repo = 'https://github.com/Keychrom/Tessa',
  }: { copy: LandingCopy; repo?: string } = $props();

  let open = $state(false);

  const links = $derived([
    { href: '#features', label: copy.nav.features },
    { href: '#layouts', label: copy.nav.layouts },
    { href: '#install', label: copy.nav.install },
    { href: copy.nav.docsHref, label: copy.nav.docs },
    { href: copy.nav.benchmarkHref, label: copy.nav.benchmark },
  ]);
</script>

<div class="md:hidden">
  <button
    type="button"
    class="grid size-9 place-items-center rounded-full border border-[var(--tessa-border-soft)] bg-[var(--tessa-surface)]/60 text-[var(--tessa-text)]"
    onclick={() => (open = !open)}
    aria-expanded={open}
    aria-controls="mobile-menu"
    aria-label={open ? copy.nav.close : copy.nav.menu}
  >
    {#if open}
      <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    {:else}
      <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    {/if}
  </button>

  {#if open}
    <div
      id="mobile-menu"
      class="absolute inset-x-3 top-[calc(100%+0.6rem)] rounded-2xl border border-[var(--tessa-border-soft)] bg-[var(--tessa-bg-soft)]/95 p-2 shadow-2xl backdrop-blur-xl"
    >
      {#each links as link}
        <a
          href={link.href}
          class="block rounded-xl px-4 py-3 text-sm text-[var(--tessa-muted)] hover:bg-[var(--tessa-surface)] hover:text-[var(--tessa-text)]"
          onclick={() => (open = false)}
        >
          {link.label}
        </a>
      {/each}
      <div class="my-2 h-px bg-[var(--tessa-border-soft)]"></div>
      <a
        href={copy.nav.languageHref}
        class="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--tessa-muted)] hover:bg-[var(--tessa-surface)] hover:text-[var(--tessa-text)]"
        hreflang={copy.lang === 'en' ? 'ja' : 'en'}
        onclick={() => (open = false)}
      >
        {copy.nav.language}
      </a>
      <a
        href={repo}
        class="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--tessa-accent-2)]"
        onclick={() => (open = false)}
      >
        GitHub ↗
      </a>
    </div>
  {/if}
</div>
