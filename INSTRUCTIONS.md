# YATE
Yet another translation extension

## Features
- [x] translate on clicking/selecting/context menu
- [x] translate on popup
- [x] full page translation

## Devlopment

```sh
pnpm install
pnpm dev
```

Make sure you provide correct path to your browser. `web-ext` doesn't work with `wsl` so comment this line in `./scripts/dev.mjs` and load extension manually:

```js
extensionRunner = await webExt.cmd.run(runOptions, { shouldExitProgram: false });
```

After developing and testing, use `pnpm pack-src` to compress source code and artifacts for submission.

## Installation

```sh
pnpm install
pnpm build
```
Then follows [installation guide](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) of Mozilla
