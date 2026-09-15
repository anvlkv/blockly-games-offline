#!/usr/bin/env node
/**
 * Downloads the complete Blockly Games site so it can be served offline.
 *
 * The public domain `https://blockly.games` has been migrated and currently
 * returns 404 for the compiled `generated/*` and `common/boot.js` assets.
 * The original App Engine deployment at `https://blockly-games.appspot.com`
 * still serves the full, working site, so we mirror that.
 *
 * Output: the `site/` directory at the project root.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'site');

// `--force` re-downloads even if the site is already present.  Release builds pass
// this so the bundled site is always freshly fetched; `tauri dev` omits it so
// repeat invocations are instant.
const FORCE = process.argv.includes('--force');

const BASE_URL = 'https://blockly-games.appspot.com';

// Supported languages, as listed in common/boot.js.
const LANGUAGES = [
  'am', 'ar', 'be', 'be-tarask', 'bg', 'bn', 'br', 'ca', 'cs', 'da', 'de',
  'el', 'en', 'eo', 'es', 'eu', 'fa', 'fi', 'fo', 'fr', 'gl', 'ha', 'he',
  'hi', 'hr', 'hu', 'hy', 'ia', 'id', 'ig', 'is', 'it', 'ja', 'kab', 'kn',
  'ko', 'lt', 'lv', 'ms', 'my', 'nb', 'nl', 'pl', 'pms', 'pt', 'pt-br',
  'ro', 'ru', 'sc', 'sk', 'sl', 'sq', 'sr', 'sr-latn', 'sv', 'th', 'ti',
  'tr', 'uk', 'ur', 'vi', 'yo', 'zh-hans', 'zh-hant',
];

// Application directory names (the `appName` used by common/boot.js).
const GAMES = [
  'index', 'puzzle', 'maze', 'bird', 'turtle', 'movie', 'music',
  'pond/tutor', 'pond/duck',
];

// Top-level HTML pages. On appspot the `.html` pages are served from the
// extension-less URL, but the site's own JavaScript links to `*.html`, so we
// save them under their `.html` names.
const HTML_PAGES = {
  'index.html': '/',
  'about.html': '/about',
  'puzzle.html': '/puzzle',
  'maze.html': '/maze',
  'bird.html': '/bird',
  'turtle.html': '/turtle',
  'movie.html': '/movie',
  'music.html': '/music',
  'pond-tutor.html': '/pond-tutor',
  'pond-duck.html': '/pond-duck',
};

// Static files shipped in the source tree (excluding compiled `generated/*`,
// `src/*`, and server/backend files).
const STATIC_FILES = [
  'bird/birds-120.png',
  'bird/help_heading.png',
  'bird/help_mutator.png',
  'bird/help_up.png',
  'bird/nest.png',
  'bird/quack.mp3',
  'bird/quack.ogg',
  'bird/style.css',
  'bird/whack.mp3',
  'bird/whack.ogg',
  'bird/worm.mp3',
  'bird/worm.ogg',
  'bird/worm.png',
  'common/1x1.gif',
  'common/back.js',
  'common/boot.js',
  'common/common.css',
  'common/help.png',
  'common/icons.png',
  'common/loading.gif',
  'common/prettify.css',
  'common/prettify.js',
  'common/stripes.svg',
  'index/bird.png',
  'index/maze.png',
  'index/movie.png',
  'index/music.png',
  'index/pond-duck.png',
  'index/pond-tutor.png',
  'index/puzzle.png',
  'index/style.css',
  'index/title-beta.png',
  'index/title.png',
  'index/title.svg',
  'index/turtle.png',
  'maze/astro.png',
  'maze/bg_astro.jpg',
  'maze/bg_panda.jpg',
  'maze/fail_astro.mp3',
  'maze/fail_astro.ogg',
  'maze/fail_panda.mp3',
  'maze/fail_panda.ogg',
  'maze/fail_pegman.mp3',
  'maze/fail_pegman.ogg',
  'maze/help_down.png',
  'maze/help_run.png',
  'maze/help_stack.png',
  'maze/help_up.png',
  'maze/marker.png',
  'maze/panda.png',
  'maze/pegman.png',
  'maze/style.css',
  'maze/tiles_astro.png',
  'maze/tiles_panda.png',
  'maze/tiles_pegman.png',
  'maze/win.mp3',
  'maze/win.ogg',
  'movie/style.css',
  'movie/win.mp3',
  'movie/win.ogg',
  'movie/youtube-bg.png',
  'music/black1x1.gif',
  'music/note0.03125.png',
  'music/note0.0625.png',
  'music/note0.125.png',
  'music/note0.25.png',
  'music/note0.5.png',
  'music/note1.png',
  'music/notes.png',
  'music/play.png',
  'music/rest0.03125.png',
  'music/rest0.0625.png',
  'music/rest0.125.png',
  'music/rest0.25.png',
  'music/rest0.5.png',
  'music/rest1.png',
  'music/stave.png',
  'music/style.css',
  'pond/boom.mp3',
  'pond/boom.ogg',
  'pond/docs.html',
  'pond/docs/compass.png',
  'pond/docs/docs.js',
  'pond/docs/map.png',
  'pond/docs/style.css',
  'pond/docs/zippy-minus.png',
  'pond/docs/zippy-plus.png',
  'pond/duck/default-ducks.js',
  'pond/duck/style.css',
  'pond/splash.mp3',
  'pond/splash.ogg',
  'pond/sprites.png',
  'pond/style.css',
  'pond/tutor/style.css',
  'pond/whack.mp3',
  'pond/whack.ogg',
  'puzzle/bee.jpg',
  'puzzle/cat.jpg',
  'puzzle/duck.jpg',
  'puzzle/snail.jpg',
  'puzzle/style.css',
  'puzzle/win.mp3',
  'puzzle/win.ogg',
  'turtle/help_left.png',
  'turtle/square.gif',
  'turtle/style.css',
  'turtle/win.mp3',
  'turtle/win.ogg',
];

// Blockly's bundled media files (referenced at runtime by the compiled code).
const BLOCKLY_MEDIA_FILES = [
  'click.mp3', 'click.ogg', 'click.wav',
  'delete.mp3', 'delete.ogg', 'delete.wav',
  'disconnect.mp3', 'disconnect.ogg', 'disconnect.wav',
  'handclosed.cur', 'handdelete.cur', 'handopen.cur',
  'quote0.png', 'quote1.png', 'sprites.png',
];

// ACE editor files used by the Pond games' text editor.
const ACE_FILES = [
  'ace.js',
  'ext-language_tools.js',
  'mode-javascript.js',
  'theme-chrome.js',
  'worker-javascript.js',
];

// Soundfonts used by the Music game: instruments x note names.
const INSTRUMENTS = ['piano', 'trumpet', 'violin', 'drum', 'flute', 'banjo', 'guitar', 'choir'];
const NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'];

async function fetchBytes(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function download(url, relPath) {
  const bytes = await fetchBytes(url);
  const outPath = join(OUT_DIR, relPath);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, bytes);
  return bytes.length;
}

function buildUrlList() {
  const urls = [];

  // Top-level HTML pages (extension-less remote URL -> local .html file).
  for (const [local, remote] of Object.entries(HTML_PAGES)) {
    urls.push([`${BASE_URL}${remote}`, local]);
  }

  // Static files.
  for (const f of STATIC_FILES) {
    urls.push([`${BASE_URL}/${f}`, f]);
  }

  // Third-party files.
  for (const f of BLOCKLY_MEDIA_FILES) {
    urls.push([`${BASE_URL}/third-party/blockly/media/${f}`, `third-party/blockly/media/${f}`]);
  }
  urls.push([`${BASE_URL}/third-party/JS-Interpreter/compressed.js`, 'third-party/JS-Interpreter/compressed.js']);
  urls.push([`${BASE_URL}/third-party/SoundJS/soundjs.min.js`, 'third-party/SoundJS/soundjs.min.js']);
  urls.push([`${BASE_URL}/third-party/babel.min.js`, 'third-party/babel.min.js']);
  for (const f of ACE_FILES) {
    urls.push([`${BASE_URL}/third-party/ace/${f}`, `third-party/ace/${f}`]);
  }
  for (const inst of INSTRUMENTS) {
    for (const note of NOTES) {
      urls.push([
        `${BASE_URL}/third-party/soundfonts/${inst}/${note}.mp3`,
        `third-party/soundfonts/${inst}/${note}.mp3`,
      ]);
    }
  }

  // Compiled per-game files: compressed.js + one locale file per language.
  for (const game of GAMES) {
    urls.push([`${BASE_URL}/${game}/generated/compressed.js`, `${game}/generated/compressed.js`]);
    for (const lang of LANGUAGES) {
      urls.push([
        `${BASE_URL}/${game}/generated/msg/${lang}.js`,
        `${game}/generated/msg/${lang}.js`,
      ]);
    }
  }

  return urls;
}

async function main() {
  if (!FORCE && existsSync(join(OUT_DIR, 'index.html'))) {
    console.log(`Blockly Games already downloaded to ${OUT_DIR}; skipping (use --force to refresh).`);
    return;
  }

  const urls = buildUrlList();
  let downloaded = 0;
  let failed = 0;

  // Fetch in small concurrent batches to stay polite.
  const BATCH = 8;
  for (let i = 0; i < urls.length; i += BATCH) {
    const chunk = urls.slice(i, i + BATCH);
    await Promise.all(chunk.map(async ([url, rel]) => {
      try {
        await download(url, rel);
        downloaded++;
      } catch (err) {
        failed++;
        console.error(`FAILED ${rel}: ${err.message}`);
      }
    }));
  }

  // Verify the Russian locale files are present (explicit requirement).
  const ruCount = urls.filter(([, rel]) => /generated\/msg\/ru\.js$/.test(rel)).length;
  console.log(`Downloaded ${downloaded} files (${failed} failed).`);
  console.log(`Russian (ru) locale files expected: ${ruCount}.`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
