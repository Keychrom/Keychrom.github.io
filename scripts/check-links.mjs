#!/usr/bin/env node
/**
 * Validate internal links, anchors, and assets in the built site.
 * Usage: node scripts/check-links.mjs [dist]
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}

function fileForUrl(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (decoded.endsWith('/')) return path.join(dist, decoded, 'index.html');
  const direct = path.join(dist, decoded.replace(/^\//, ''));
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (!path.extname(direct)) return path.join(direct, 'index.html');
  return direct;
}

function idsIn(file) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set();
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) ids.add(match[1]);
  return ids;
}

if (!fs.existsSync(dist)) {
  console.error(`Missing build output: ${dist}`);
  process.exit(1);
}

walk(dist);
const idsCache = new Map();
const problems = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1];
    if (
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('mailto:') ||
      raw.startsWith('data:') ||
      raw.startsWith('javascript:') ||
      raw.startsWith('#')
    ) {
      continue;
    }
    checked += 1;
    const [urlPath, ...hashParts] = raw.split('#');
    const hash = hashParts.length ? hashParts.join('#') : '';
    if (urlPath.startsWith('/')) {
      const target = fileForUrl(urlPath);
      if (!fs.existsSync(target)) {
        problems.push(`${rel}: missing ${raw}`);
        continue;
      }
      if (hash && target.endsWith('.html')) {
        if (!idsCache.has(target)) idsCache.set(target, idsIn(target));
        let id = hash;
        try {
          id = decodeURIComponent(hash);
        } catch {}
        if (!idsCache.get(target).has(id)) problems.push(`${rel}: missing anchor ${raw}`);
      }
    } else if (urlPath.endsWith('.html') && !fs.existsSync(path.resolve(path.dirname(file), urlPath))) {
      problems.push(`${rel}: missing relative ${raw}`);
    }
  }
}

if (problems.length) {
  console.error(`Broken internal links (${problems.length}):`);
  for (const problem of problems.slice(0, 80)) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${checked} internal links across ${htmlFiles.length} HTML files: ok`);
}
