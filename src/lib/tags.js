// Level tags replace raw MMR in the UI. Edit labels / cut-offs freely (everyone starts at 1000).
const TIERS = [
  { min: 1100, label: 'Strong player', cls: 'bg-court text-on-court' },
  { min: 1030, label: 'Solid player', cls: 'bg-court/15 text-court' },
  { min: 970, label: 'Steady player', cls: 'bg-ink/10 text-ink' },
  { min: -Infinity, label: 'Warming up', cls: 'bg-shuttle/25 text-ink' },
]
export const tierFor = mmr => TIERS.find(t => mmr >= t.min)

// Extra tag for 3+ wins in a row.
export const streakFor = p => (p.streak >= 3 ? { label: 'On a roll', cls: 'bg-win/15 text-win' } : null)
