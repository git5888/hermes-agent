import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build, Platform, Arch } from 'electron-builder';

const require = createRequire(import.meta.url);
const source = path.resolve(import.meta.dirname, '..');
const prepackaged = process.env.AIGOWORK_PREPACKAGED_DIR;
if (process.platform !== 'win32' || process.arch !== 'x64') {
  throw new Error('A Windows x64 host is required');
}
if (!prepackaged || !fs.existsSync(path.join(prepackaged, 'AiGoWork.exe')) ||
    !fs.existsSync(path.join(prepackaged, 'resources', 'app.asar'))) {
  throw new Error('The verified desktop payload is missing');
}

await build({
  projectDir: path.join(source, 'apps/desktop'),
  prepackaged,
  config: require('./aigowork-windows-nsis.cjs'),
  targets: Platform.WINDOWS.createTarget(['nsis'], Arch.x64),
  publish: 'never',
});
