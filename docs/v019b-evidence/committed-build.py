"""Rebuild an immutable committed archive and prove it equals the tested frontend."""
import hashlib, json, pathlib, subprocess, tarfile, tempfile

workspace = pathlib.Path.cwd()
evidence = workspace / 'docs/v019b-evidence'
source = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
release = pathlib.Path(tempfile.mkdtemp(prefix='aqm-v019b-committed-' + source[:7] + '-', dir='/private/tmp'))
archive = release / 'source.tar'
with archive.open('wb') as output:
    subprocess.run(['git', 'archive', source], stdout=output, check=True)
with tarfile.open(archive) as content:
    content.extractall(release, filter='data')
archive.unlink()
release.joinpath('node_modules').symlink_to(workspace.joinpath('node_modules').resolve(), target_is_directory=True)
with evidence.joinpath('committed-build.txt').open('w') as output:
    subprocess.run(['npm', 'run', 'build'], cwd=release, stdout=output, stderr=subprocess.STDOUT, check=True)

def files(root):
    return {p.relative_to(root).as_posix(): p.read_bytes() for p in root.rglob('*') if p.is_file()}

built = files(release / 'dist')
assert built == files(workspace / 'dist'), 'Committed build differs from the tested frontend.'
inputs = ['src', 'public', 'index.html', 'package.json', 'package-lock.json', 'vite.config.ts', 'tsconfig.json', '.env.production']
tracked = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', source, '--', *inputs], text=True).splitlines()
for path in tracked:
    assert release.joinpath(path).read_bytes() == subprocess.check_output(['git', 'show', source + ':' + path])
backend = subprocess.check_output(['git', 'diff', '--name-only', 'c48fefc7d9ce1933799bd37543823c4c2ed94424', source, '--', 'src/server', 'src/domain', 'src/provider', 'package.json', 'package-lock.json'], text=True).strip()
assert not backend, 'Backend or shared domain source changed.'
result = {'sourceSha': source, 'releasePath': str(release), 'frontendInputs': inputs,
          'archiveInputsMatchCommit': True, 'archiveBuildMatchesTestedBuild': True,
          'fileCount': len(built), 'files': {p: hashlib.sha256(data).hexdigest() for p, data in built.items()},
          'backendSourceChanged': False}
evidence.joinpath('committed-build.json').write_text(json.dumps(result, indent=2) + '\n')
print('Committed source:', source, 'files:', len(built), 'match tested build:', True)
