export function ReviewScoreSummary({ aiScore, humanScore, agreements, answered, gap, completed }: { aiScore: number | null; humanScore: number | null; agreements: number; answered: number; gap: number | null | undefined; completed: boolean }) {
  const percent = (value: number | null) => value == null ? '—' : `${Math.round(value * 100)}%`
  return <div className="review-summary"><div><small>AI SCORE</small><strong>{percent(aiScore)}</strong></div><div><small>{completed ? 'HUMAN SCORE' : 'HUMAN PROGRESS PREVIEW'}</small><strong>{percent(humanScore)}</strong></div><div><small>EXACT AGREEMENT</small><strong>{agreements} / {answered}</strong></div><div><small>ABSOLUTE SCORE GAP</small><strong>{gap == null ? '—' : `${(gap * 100).toFixed(1)} pp`}</strong></div></div>
}
