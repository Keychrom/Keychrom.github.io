#!/usr/bin/env node
/**
 * Import the Tessa Markdown docs into Starlight content.
 *
 * Source of truth: a Tessa checkout (default: ../Tessa, override with TESSA_REPO).
 * The generated content lives under src/content/docs/docs and
 * src/content/docs/ja/docs so the site keeps a custom landing page at /.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.env.TESSA_REPO
  ? path.resolve(process.env.TESSA_REPO)
  : path.resolve(root, '../Tessa');
const contentRoot = path.join(root, 'src/content/docs');
const enDocs = path.join(contentRoot, 'docs');
const jaDocs = path.join(contentRoot, 'ja/docs');
const publicRoot = path.join(root, 'public');

const pages = [
  {
    file: 'GUIDE',
    slug: 'guide',
    title: 'Setup & Customization Guide',
    jaTitle: 'セットアップ & カスタマイズガイド',
  },
  { file: 'CUSTOMIZATION', slug: 'customization', title: 'Customization', jaTitle: 'カスタマイズ' },
  { file: 'RENDERING', slug: 'rendering', title: 'Rendering & games', jaTitle: '描画・ゲーム機能' },
  { file: 'EXTENDING', slug: 'extending', title: 'Extending Tessa', jaTitle: 'Tessa を拡張する' },
  {
    file: 'EXTENSION-API',
    slug: 'extension-api',
    title: 'Extension API v1',
    jaTitle: '拡張 API v1',
  },
  { file: 'ARCHITECTURE', slug: 'architecture', title: 'Architecture', jaTitle: 'アーキテクチャ' },
  { file: 'DEVELOPMENT', slug: 'development', title: 'Development', jaTitle: '開発' },
  { file: 'ROADMAP', slug: 'roadmap', title: 'Roadmap', jaTitle: 'ロードマップ' },
  { file: 'BENCHMARK', slug: 'benchmark', title: 'Benchmark', jaTitle: 'ベンチマーク' },
];

const docPaths = new Map([
  ['README.md', '/docs/'],
  ['GUIDE.md', '/docs/guide/'],
  ['CUSTOMIZATION.md', '/docs/customization/'],
  ['RENDERING.md', '/docs/rendering/'],
  ['EXTENDING.md', '/docs/extending/'],
  ['EXTENSION-API.md', '/docs/extension-api/'],
  ['ARCHITECTURE.md', '/docs/architecture/'],
  ['DEVELOPMENT.md', '/docs/development/'],
  ['ROADMAP.md', '/docs/roadmap/'],
  ['BENCHMARK.md', '/docs/benchmark/'],
]);

const jaDocPaths = new Map(
  [...docPaths].map(([file, target]) => {
    if (file === 'README.md') return ['README.ja.md', '/ja/docs/'];
    return [file.replace(/\.md$/, '.ja.md'), target.replace(/^\/docs\//, '/ja/docs/')];
  }),
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readSource(relative) {
  const file = path.join(source, relative);
  if (!fs.existsSync(file)) throw new Error(`Missing source document: ${file}`);
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function stripLeadingSwitch(text) {
  const lines = text.split('\n');
  while (
    lines.length &&
    /(English|日本語)/u.test(lines[0]) &&
    lines[0].includes('|') &&
    lines[0].length < 120
  ) {
    lines.shift();
  }
  while (lines.length && lines[0].trim() === '') lines.shift();
  return lines.join('\n');
}

// The GitHub docs advertise their website copy with a marked notice block.
// That block is for the repository view only, so drop it during import.
function stripSiteNotice(text) {
  return text.replace(
    /<!-- tessa-site-notice:start -->[\s\S]*?<!-- tessa-site-notice:end -->\s*/g,
    '',
  );
}

function extractPage(text, fallbackTitle) {
  let body = stripLeadingSwitch(stripSiteNotice(text));
  let title = fallbackTitle;
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) {
    title = h1[1].trim();
    body = body.replace(/^#\s+.+\n?/m, '');
  }
  const paragraph =
    body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('|')) ?? '';
  const description = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
  return { title, description, body: body.trimStart() };
}

function rewriteTarget(target, lang) {
  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:') ||
    target.startsWith('#')
  ) {
    return target;
  }

  const [rawPath, ...anchorParts] = target.split('#');
  let anchor = anchorParts.length ? `#${anchorParts.join('#')}` : '';
  if (anchor === '#effect-helper-process-protocol') anchor = '#external-effect-helper';
  let pathPart = rawPath.replace(/^\.\//, '');

  if (pathPart.includes('packaging/README')) {
    return (lang === 'ja' ? '/ja/docs/packaging/' : '/docs/packaging/') + anchor;
  }
  const basename = path.posix.basename(pathPart);
  const table = lang === 'ja' ? jaDocPaths : docPaths;
  if (table.has(basename)) {
    return table.get(basename) + anchor;
  }

  if (basename === 'README.md' || basename === 'README.ja.md') {
    return (lang === 'ja' ? '/ja/docs/' : '/docs/') + anchor;
  }
  if (pathPart.startsWith('images/') || pathPart.includes('/images/')) {
    return '/images/' + path.posix.basename(pathPart);
  }
  if (pathPart.startsWith('benchmarks/')) {
    return '/benchmarks/' + path.posix.basename(pathPart);
  }
  if (pathPart.includes('examples/')) {
    return '/examples/' + path.posix.basename(pathPart);
  }
  if (pathPart.includes('config.example')) {
    return '/config.example' + anchor;
  }
  if (pathPart.endsWith('.png') || pathPart.endsWith('.jpg') || pathPart.endsWith('.webp')) {
    return '/images/' + path.posix.basename(pathPart) + anchor;
  }
  return target;
}

function rewriteLinks(markdown, lang) {
  return markdown.replace(/\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (_whole, target, title = '') => {
    return `](${rewriteTarget(target, lang)}${title})`;
  });
}

function frontmatter({ title, description }) {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n`;
}

function writeDoc(dir, slug, data) {
  const file = path.join(dir, `${slug}.md`);
  fs.writeFileSync(file, frontmatter(data) + rewriteLinks(data.body, data.lang).trim() + '\n');
}

function copyTree(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function main() {
  if (!fs.existsSync(path.join(source, 'README.md'))) {
    throw new Error(`Tessa source not found at ${source}; set TESSA_REPO.`);
  }

  fs.rmSync(enDocs, { recursive: true, force: true });
  fs.rmSync(jaDocs, { recursive: true, force: true });
  ensureDir(enDocs);
  ensureDir(jaDocs);

  const overviewEn = extractPage(readSource('README.md'), 'Overview');
  writeDoc(enDocs, 'index', { ...overviewEn, title: 'Overview', lang: 'en' });
  const overviewJa = extractPage(readSource('README.ja.md'), '概要');
  writeDoc(jaDocs, 'index', { ...overviewJa, title: '概要', lang: 'ja' });

  for (const page of pages) {
    const en = extractPage(readSource(`docs/${page.file}.md`), page.title);
    writeDoc(enDocs, page.slug, {
      ...en,
      title: en.title || page.title,
      lang: 'en',
    });
    const ja = extractPage(readSource(`docs/${page.file}.ja.md`), page.jaTitle);
    writeDoc(jaDocs, page.slug, {
      ...ja,
      title: ja.title || page.jaTitle,
      lang: 'ja',
    });
  }

  const extraPages = [
    {
      source: 'packaging/README.md',
      slug: 'packaging',
      title: 'Packaging Tessa',
      lang: 'en',
      dir: enDocs,
    },
    {
      source: 'packaging/README.ja.md',
      slug: 'packaging',
      title: 'Tessa のパッケージング',
      lang: 'ja',
      dir: jaDocs,
    },
  ];
  for (const page of extraPages) {
    const data = extractPage(readSource(page.source), page.title);
    writeDoc(page.dir, page.slug, {
      ...data,
      title: data.title || page.title,
      lang: page.lang,
    });
  }

  copyTree(path.join(source, 'docs/images'), path.join(publicRoot, 'images'));
  copyTree(path.join(source, 'docs/benchmarks'), path.join(publicRoot, 'benchmarks'));
  copyTree(path.join(source, 'examples'), path.join(publicRoot, 'examples'));
  fs.copyFileSync(path.join(source, 'config/config.example'), path.join(publicRoot, 'config.example'));

  console.log(`Synced ${pages.length * 2 + extraPages.length + 2} docs from ${source}`);
}

main();
