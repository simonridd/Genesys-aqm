"""Read-only release gate, executed after final evidence branch push and fresh fetch."""
import subprocess,json,pathlib,sys
base='bb3f0830a521dbc97ce57bd94d55c87873228fc1'
tag='b12fd5f7fec100b5a834aed760743a2935f12b31'
branch='codex/aqm-v0211-returning-visitor-default'
def git(*args):return subprocess.check_output(['git',*args],text=True).strip()
assert git('rev-parse','origin/main')==base
assert git('rev-parse','v0.21.0')==tag and git('rev-parse','v0.21.0^{}')==base
assert not git('tag','--list','v0.21.1')
assert git('branch','--show-current')==branch
assert not git('status','--porcelain')
behind,ahead=map(int,git('rev-list','--left-right','--count',f'origin/main...HEAD').split())
assert behind==0 and ahead>0
refs=dict(line.split()[::-1] for line in git('ls-remote','origin','refs/heads/main','refs/heads/'+branch,'refs/heads/gh-pages','refs/tags/v0.21.0','refs/tags/v0.21.0^{}','refs/tags/v0.21.1','refs/tags/v0.21.1^{}').splitlines())
head=git('rev-parse','HEAD')
assert refs['refs/heads/main']==base
assert refs['refs/heads/'+branch]==head
assert refs['refs/tags/v0.21.0']==tag and refs['refs/tags/v0.21.0^{}']==base
assert 'refs/tags/v0.21.1' not in refs and 'refs/tags/v0.21.1^{}' not in refs
assert refs['refs/heads/gh-pages']=='c97950c335ef53dbd94faee43ad4f5a285f07743'
# Final product inputs remain byte-identical to the tested committed source.
assert not git('diff','43bc67f459508f8b319b093774bdd816ab6592a2','HEAD','--','src','public','package.json','package-lock.json','index.html','vite.config.ts','tsconfig.json','.env.production')
result={'allReleaseGatesPassed':True,'base':base,'finalBranchHead':head,'ahead':ahead,'behind':behind,'remoteRefs':refs,'worktreeClean':True,'buildInputsUnchanged':True}
pathlib.Path(sys.argv[1]).write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['allReleaseGatesPassed','finalBranchHead','ahead','behind','worktreeClean','buildInputsUnchanged']}))
