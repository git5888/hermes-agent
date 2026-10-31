import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { build, Platform, Arch } from 'electron-builder'
import { extractFile } from '@electron/asar'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const source = path.resolve(import.meta.dirname, '..')
export function inspectPayload(prepackaged, version) {
  const config = require('./aigowork-windows-nsis.cjs')(version)
  if (
    !prepackaged ||
    !fs.existsSync(path.join(prepackaged, 'AiGoWork.exe')) ||
    !fs.existsSync(path.join(prepackaged, 'resources', 'app.asar'))
  ) {
    throw new Error('The verified desktop payload is missing')
  }
  const metadata = JSON.parse(
    extractFile(path.join(prepackaged, 'resources', 'app.asar'), 'package.json').toString('utf8')
  )
  if (metadata.version !== version) {
    throw new Error(`Payload version ${metadata.version} does not match installer ${version}`)
  }
  return config
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  if (process.platform !== 'win32' || process.arch !== 'x64') {
    throw new Error('A Windows x64 host is required')
  }
  const prepackaged = process.env.AIGOWORK_PREPACKAGED_DIR
  const config = inspectPayload(prepackaged, process.env.AIGOWORK_PACKAGE_VERSION)
  await build({
    projectDir: path.join(source, 'apps/desktop'),
    prepackaged,
    config,
    targets: Platform.WINDOWS.createTarget(['nsis'], Arch.x64),
    publish: 'never'
  })
}
