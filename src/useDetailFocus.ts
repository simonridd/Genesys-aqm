import { useEffect, useRef, useState } from 'react'

/** Inline details keep a real opener and focus when a detail opens, including a repeated selection. */
export function useDetailFocus(identity: string | null | undefined) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const fallbackRef = useRef<HTMLHeadingElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const [,setOpenRevision] = useState(0)
  const pending = useRef(false)
  const previous = useRef<string | null | undefined>(null)
  const capture = () => { pending.current = true; setOpenRevision(n=>n+1); openerRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body && document.activeElement !== document.documentElement ? document.activeElement : null }
  useEffect(() => {
    if (!identity || previous.current === identity && !pending.current) { previous.current = identity; return }
    const heading = headingRef.current
    if (!heading) return
    previous.current = identity
    pending.current = false
    heading.scrollIntoView({ block: 'start' })
    heading.focus({ preventScroll: true })
  })
  const restore = () => {
    const opener = openerRef.current
    const target = opener?.isConnected && !opener.closest('[hidden],details:not([open])') ? opener : fallbackRef.current
    target?.focus()
  }
  return { headingRef, fallbackRef, capture, restore }
}
