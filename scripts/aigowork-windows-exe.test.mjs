import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createPackage } from '@electron/asar'
import { inspectPayload } from './aigowork-windows-exe.mjs'

const require = createRequire(import.meta.url)
const config = require('./aigowork-windows-nsis.cjs')
const version = '0.22.5-local.20261031.2d2808e'

test('requires an explicit valid version and preserves installer identity and user data', () => {
  for (const invalid of [undefined, '', 'latest', '0.22', '../0.22.5']) {
    assert.throws(() => config(invalid), /explicit installer version/)
  }
  const result = config(version)
  assert.equal(result.extraMetadata.version, version)
  assert.equal(result.appId, 'com.aigowork.desktop')
  assert.equal(result.nsis.deleteAppDataOnUninstall, false)
  assert.equal(result.nsis.language, '2052')
  assert.equal(result.publish, null)
})

test('rejects missing or mismatched payloads and admits matching ASAR metadata', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'aigowork-exe-'))
  try {
    assert.throws(() => inspectPayload(root, version), /payload is missing/)
    const content = path.join(root, 'content')
    const resources = path.join(root, 'resources')
    await mkdir(content)
    await mkdir(resources)
    await writeFile(path.join(root, 'AiGoWork.exe'), 'test executable placeholder')
    await writeFile(path.join(content, 'package.json'), JSON.stringify({ version }))
    await createPackage(content, path.join(resources, 'app.asar'))
    assert.equal(inspectPayload(root, version).extraMetadata.version, version)
    assert.throws(() => inspectPayload(root, '0.21.7'), /does not match installer/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
