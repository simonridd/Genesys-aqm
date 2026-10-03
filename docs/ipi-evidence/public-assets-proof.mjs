import { readdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
const [sourceSha, output = 'docs/ipi-evidence/publication.json'] = process.argv.slice(2)
if (!/^[a-f0-9]{40}$/.test(sourceSha ?? '')) throw Error('Pass the exact tested source SHA.')
const base = 'https://simonridd.github.io/Genesys-aqm/'
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
async function paths(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? paths(`${directory}/${entry.name}`) : `${directory}/${entry.name}`))).flat()
}
const files = []
for (const file of await paths('dist')) {
  const relative = file.slice(5), bytes = await readFile(file)
  let remote
  for (let attempt = 0; attempt < 18; attempt++) {
    const response = await fetch(`${base}${relative}?ipi=${sourceSha}`, { signal: AbortSignal.timeout(20_000) })
    if (response.ok) remote = Buffer.from(await response.arrayBuffer())
    if (remote?.equals(bytes)) break
    await new Promise(resolve => setTimeout(resolve, 5_000))
  }
  files.push({ path: relative, sha256: digest(bytes), remoteSha256: remote ? digest(remote) : null, equal: remote?.equals(bytes) ?? false })
}
const pagesHead = execFileSync('git', ['ls-remote', 'origin', 'refs/heads/gh-pages'], { encoding: 'utf8' }).split(/\s/)[0]
const result = { testedSource: sourceSha, pagesHead, base, checkedAt: new Date().toISOString(), allBytesEqual: files.every(file => file.equal), files }
await writeFile(output, JSON.stringify(result, null, 2) + '\n')
console.log(`Verified ${files.length} public files; all equal: ${result.allBytesEqual}; Pages HEAD: ${pagesHead}`)
if (!result.allBytesEqual) process.exitCode = 1
