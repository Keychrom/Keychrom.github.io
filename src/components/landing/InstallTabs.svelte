<script lang="ts">
  import CopyButton from '../ui/CopyButton.svelte';
  import type { LandingCopy } from '../../i18n/landing';

  let { copy }: { copy: LandingCopy } = $props();

  type Tab = 'arch' | 'ubuntu' | 'source';
  const tabs: Tab[] = ['arch', 'ubuntu', 'source'];

  const commands: Record<Tab, string> = {
    arch: `git clone https://github.com/Keychrom/Tessa.git
cd Tessa/packaging/arch
makepkg -si`,
    ubuntu: `git clone https://github.com/Keychrom/Tessa.git
cd Tessa
./install.sh --check
./install.sh`,
    source: `git clone https://github.com/Keychrom/Tessa.git
cd Tessa
./scripts/build.sh -Doptimize=ReleaseSafe
./scripts/install-session.sh`,
  };

  let tab = $state<Tab>('arch');
</script>

<div class="grid min-w-0 gap-3">
  <div class="flex flex-wrap gap-1.5" role="tablist" aria-label={copy.install.title}>
    {#each tabs as id}
      <button
        type="button"
        role="tab"
        aria-selected={tab === id}
        class="rounded-full border px-3.5 py-1.5 text-xs font-medium transition {tab === id
          ? 'border-[var(--tessa-accent)]/50 bg-[var(--tessa-accent)]/15 text-[var(--tessa-accent-2)]'
          : 'border-[var(--tessa-border-soft)] text-[var(--tessa-faint)] hover:border-[var(--tessa-border)] hover:text-[var(--tessa-text)]'}"
        onclick={() => (tab = id)}
      >
        {copy.install.tabs[id]}
      </button>
    {/each}
  </div>

  <div class="overflow-hidden rounded-xl border border-[var(--tessa-border-soft)] bg-[var(--tessa-bg)]/80">
    <div class="flex items-center justify-between border-b border-[var(--tessa-border-soft)] px-4 py-2.5">
      <span class="font-mono text-[0.68rem] tracking-[0.12em] text-[var(--tessa-faint)]">
        {copy.install.tabs[tab]}
      </span>
      <CopyButton text={commands[tab]} label={copy.install.copy} copiedLabel={copy.install.copied} />
    </div>
    <pre class="max-w-full overflow-x-auto p-4 font-mono text-[0.78rem] leading-6 text-[var(--tessa-text)]"><code>{commands[tab]}</code></pre>
  </div>

  <p class="text-xs leading-5 text-[var(--tessa-faint)]">{copy.install.notes[tab]}</p>
</div>
