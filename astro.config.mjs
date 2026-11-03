import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://keychrom.github.io',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Tessa',
      description:
        'A quiet, tiled Wayland desktop written in Zig on top of wlroots, with an integrated shell, extensions, and a native Japanese input path.',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'Tessa',
      },
      favicon: '/favicon.svg',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Keychrom/Tessa',
        },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ja: { label: '日本語', lang: 'ja' },
      },
      pagefind: true,
      lastUpdated: true,
      disable404Route: true,
      editLink: {
        baseUrl: 'https://github.com/Keychrom/Keychrom.github.io/edit/main/',
      },
      customCss: ['./src/styles/starlight.css'],
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
        styleOverrides: {
          borderRadius: '0.75rem',
          borderColor: 'var(--tessa-border)',
        },
      },
      sidebar: [
        {
          label: 'Start here',
          translations: { ja: 'はじめに' },
          items: [
            {
              slug: 'docs/quickstart',
              label: 'Quickstart',
              translations: { ja: 'クイックスタート' },
            },
            { slug: 'docs', label: 'Overview', translations: { ja: '概要' } },
            { slug: 'docs/guide', label: 'Guide', translations: { ja: 'ガイド' } },
          ],
        },
        {
          label: 'Configuration',
          translations: { ja: '設定' },
          items: [
            {
              slug: 'docs/customization',
              label: 'Customization',
              translations: { ja: 'カスタマイズ' },
            },
            {
              slug: 'docs/rendering',
              label: 'Rendering & games',
              translations: { ja: '描画・ゲーム' },
            },
          ],
        },
        {
          label: 'Extending',
          translations: { ja: '拡張' },
          items: [
            {
              slug: 'docs/extending',
              label: 'Extending Tessa',
              translations: { ja: 'Tessa を拡張する' },
            },
            {
              slug: 'docs/extension-api',
              label: 'Extension API v1',
              translations: { ja: 'Extension API v1' },
            },
          ],
        },
        {
          label: 'Internals',
          translations: { ja: '内部構造' },
          items: [
            {
              slug: 'docs/architecture',
              label: 'Architecture',
              translations: { ja: 'アーキテクチャ' },
            },
            {
              slug: 'docs/development',
              label: 'Development',
              translations: { ja: '開発' },
            },
            {
              slug: 'docs/packaging',
              label: 'Packaging',
              translations: { ja: 'パッケージング' },
            },
          ],
        },
        {
          label: 'Project',
          translations: { ja: 'プロジェクト' },
          items: [
            { slug: 'docs/roadmap', label: 'Roadmap', translations: { ja: 'ロードマップ' } },
            { slug: 'docs/benchmark', label: 'Benchmark', translations: { ja: 'ベンチマーク' } },
          ],
        },
      ],
    }),
    svelte(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
