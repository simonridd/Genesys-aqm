import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { entryRoute } from './routing'
import { hasSeenWelcome } from './welcomePreference'
import { useReviewDrafts } from '../useReviewDrafts'
const Welcome = lazy(() => import('./Welcome'))
const Demo = lazy(() => import('./Demo'))
const Live = lazy(() => import('../App').then(module => ({ default: module.App })))
class DemoBoundary extends Component<{ children: ReactNode; onExit: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <main className="page-content"><h1>Demo unavailable</h1><p role="alert">The prepared story could not be loaded. No live fallback will be attempted.</p><button className="outline-button" onClick={this.props.onExit}>Exit demo</button></main> : this.props.children
  }
}
export function Root() {
  // About/demo can unmount the workspace too. Keep human work for this SPA's
  // lifetime without keeping the workspace (or its network effects) mounted.
  const reviewDrafts=useReviewDrafts()
  useEffect(()=>{
    if(!reviewDrafts.dirty)return
    const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='You have unsaved human review changes.'}
    window.addEventListener('beforeunload',warn)
    return()=>window.removeEventListener('beforeunload',warn)
  },[reviewDrafts.dirty])
  const [connected, setConnected] = useState(false)
  const [entry, setEntry] = useState(() => entryRoute(new URLSearchParams(location.search), false, hasSeenWelcome()))
  useEffect(() => {
    const navigate = () => setEntry(entryRoute(new URLSearchParams(location.search), connected, hasSeenWelcome()))
    window.addEventListener('popstate', navigate)
    return () => window.removeEventListener('popstate', navigate)
  }, [connected])
  const navigate = (page: string, step?: number, showcaseEntry = false) => {
    const url = new URL(location.href)
    url.search = new URLSearchParams({ page, ...(showcaseEntry ? { entry: 'showcase' } : {}), ...(page === 'settings' ? { settingsSection: 'connection' } : {}), ...(page === 'demo' ? { tour: 'quality', step: String(step ?? 1) } : {}) }).toString()
    url.hash = ''
    window.history.pushState(null, '', url)
    setEntry(entryRoute(url.searchParams, connected, hasSeenWelcome()))
    window.scrollTo(0, 0)
  }
  return <Suspense fallback={<main className="page-content" role="status">Loading IPI AQM…</main>}>
    {entry === 'demo' ? <DemoBoundary onExit={() => navigate('welcome')}><Demo onExit={pilot => { navigate('welcome'); if (pilot) history.replaceState(null, '', `${location.pathname}${location.search}#pilot`) }} connected={connected} onConnect={() => navigate('settings')} onLive={() => navigate(connected ? 'automation' : 'conversations', undefined, !connected)} /></DemoBoundary> : entry === 'welcome' ? <Welcome connected={connected} onLive={page => navigate(page, undefined, !connected && page === 'conversations')} onDemo={step => navigate('demo', step)}/> : <Live reviewDrafts={reviewDrafts} onConnectionChange={setConnected} onAbout={value => { setConnected(value); navigate('welcome') }}/>}
  </Suspense>
}
