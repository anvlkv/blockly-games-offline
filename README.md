# Blockly Games (Offline)

A [Tauri v2](https://tauri.app) desktop app that bundles a complete, offline
copy of [Google's Blockly Games](https://blockly.games) and serves it locally.

The app requires no internet connection to run. The game source lives in a
[git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) (`site/`)
pointing at a [fork of Google's Blockly Games](https://github.com/anvlkv/blockly-games);
it is compiled at build time with Closure Compiler and embedded into the binary,
including all 65 locale files (such as Russian `ru.js`).

## How it works

1. `site/` is a git submodule pointing at the `blockly-games` fork — the real,
   editable game source (each game's `src/*.js` lives under `appengine/`).
2. `npm run build:site` runs the fork's `Makefile` (`make deps games offline`),
   which compiles every game with Closure Compiler and assembles a distributable
   site at `site/offline/blockly-games/`.
3. `tauri.conf.json` points `frontendDist` at that folder, so Tauri embeds the
   files into the binary and serves them locally via its built-in protocol.
4. The Apache 2.0 `LICENSE` and `NOTICE` files are bundled as resources (under
   `licenses/`) for redistribution compliance.

## Prerequisites

- [Node.js](https://nodejs.org) (for the build script and Tauri CLI)
- [Rust](https://rustup.rs) (stable)
- Tauri [system prerequisites](https://tauri.app/start/prerequisites/)
- Java (for Closure Compiler), Python 3, Git, and `make`
  (used by the Blockly Games build)

## Development

```sh
npm install
git submodule update --init      # fetch the Blockly Games source
npm run build:site               # compile the games (also runs automatically before build)
npm run tauri dev
```

While iterating on game source in `site/appengine/`, recompile a single game
directly from the submodule instead of rebuilding everything:

```sh
cd site
make maze          # or: make bird / turtle / movie / music / ...
make offline
```

## Build

```sh
npm install
git submodule update --init
npm run tauri build
```

The bundled app will be produced under `src-tauri/target/release/`.

## Continuous integration

`.github/workflows/build-windows.yml` builds the Windows installers for
**x64, x86 (32-bit), and arm64** with
[`tauri-action`](https://github.com/tauri-apps/tauri-action):

- Pull requests only build (and upload the installers as workflow artifacts).
- Pushes to `main`, `v*` tags, and manual runs **publish a GitHub Release** with
  the installers attached. On a tag the release uses that tag; otherwise it is
  tagged `v<version>` from `src-tauri/tauri.conf.json` and updated in place on
  subsequent runs. All three architectures upload to the same release.

## License

This project redistributes Google's Blockly Games, which is licensed under the
Apache License, Version 2.0. See `LICENSE` and `NOTICE`.

## AI disclaimer

This project was scaffolded and largely written with the help of an AI coding
assistant, and may contain errors or omissions. It is provided as-is, without
warranty of any kind. Review the code and the bundled third-party content (and
their licenses) before redistributing or relying on it.
