# Blockly Games (Offline)

A [Tauri v2](https://tauri.app) desktop app that bundles a complete, offline
copy of [Google's Blockly Games](https://blockly.games) and serves it locally.

The app requires no internet connection to run: the whole site (games, images,
audio, and all 65 locale files — including Russian `ru.js`) is downloaded at
build time and embedded into the binary.

## How it works

1. `npm run download` runs `scripts/download-blockly.mjs`, which mirrors the
   full site into `site/`.
   - The public `https://blockly.games` domain has been migrated and currently
     returns 404 for the compiled `generated/*` and `common/boot.js` assets, so
     the script mirrors the still-working original deployment at
     `https://blockly-games.appspot.com`.
2. `tauri.conf.json` points `frontendDist` at `../site`, so Tauri embeds the
   files into the binary and serves them locally via its built-in protocol.
3. The Apache 2.0 `LICENSE` and `NOTICE` files are bundled as resources (under
   `licenses/`) for redistribution compliance.

## Prerequisites

- [Node.js](https://nodejs.org) (for the download script and Tauri CLI)
- [Rust](https://rustup.rs) (stable)
- Tauri [system prerequisites](https://tauri.app/start/prerequisites/)

## Development

```sh
npm install
npm run download          # fetch the site (also runs automatically before build)
npm run tauri dev
```

## Build

```sh
npm install
npm run tauri build
```

The bundled app will be produced under `src-tauri/target/release/`.

## Continuous integration

`.github/workflows/build-windows.yml` builds the Windows installers on every push
to `main`, on pull requests, and on demand. Pushing a `v*` tag additionally
creates a draft GitHub release with the generated installers attached.

## License

This project redistributes Google's Blockly Games, which is licensed under the
Apache License, Version 2.0. See `LICENSE` and `NOTICE`.

## AI disclaimer

This project was scaffolded and largely written with the help of an AI coding
assistant, and may contain errors or omissions. It is provided as-is, without
warranty of any kind. Review the code and the bundled third-party content (and
their licenses) before redistributing or relying on it.
