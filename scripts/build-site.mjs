#!/usr/bin/env node
/**
 * Builds the Blockly Games site from the `site/` submodule (the fork of
 * google/blockly-games) so Tauri can bundle and serve it offline.
 *
 * Steps:
 *   1. Ensure the submodule is checked out.
 *   2. Fetch third-party dependencies (Closure Compiler, Blockly, ACE,
 *      SoundJS, JS-Interpreter, Babel) — skipped when already present.
 *   3. Compile every game (`make games`).
 *   4. Assemble the distributable site (`make offline`).
 *
 * Output: `site/offline/blockly-games` (pointed to by tauri.conf.json).
 *
 * `--force` re-runs every step even if the site is already built.  Release
 * builds pass this so the bundled site is always freshly compiled; `tauri dev`
 * omits it so repeat invocations are instant.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const SITE_DIR = resolve(ROOT_DIR, 'site');

const FORCE = process.argv.includes('--force');

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (res.error) {
    console.error(`Failed to run '${cmd}': ${res.error.message}`);
    process.exit(1);
  }
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

// Skip the whole build if the site already exists (and we're not forced).
const offlineIndex = resolve(SITE_DIR, 'offline', 'blockly-games', 'index.html');
if (!FORCE && existsSync(offlineIndex)) {
  console.log(`Blockly Games already built to ${offlineIndex}; skipping (use --force to rebuild).`);
  process.exit(0);
}

// Fresh clones won't have the submodule checked out yet.
if (!existsSync(resolve(SITE_DIR, 'Makefile'))) {
  console.log('Initializing the site submodule...');
  run('git', ['submodule', 'update', '--init', 'site'], ROOT_DIR);
}

// Fetch dependencies only when missing (third-party libs rarely change; use
// `make clean-deps` in the submodule to force a fresh fetch).
const hasClosureCompiler =
    existsSync(resolve(SITE_DIR, 'build', 'third-party-downloads', 'closure-compiler.jar'));
const hasBlockly =
    existsSync(resolve(SITE_DIR, 'appengine', 'third-party', 'blockly'));
if (!hasClosureCompiler || !hasBlockly) {
  console.log('Fetching third-party dependencies...');
  run('make', ['deps'], SITE_DIR);
}

console.log('Compiling games...');
run('make', ['games'], SITE_DIR);

console.log('Assembling the offline bundle...');
run('make', ['offline'], SITE_DIR);

console.log('Done. Site is at site/offline/blockly-games.');
