// Who is waiting, in priority order: fewest games first, then longest wait.
export function queueOrder(players, onCourt) {
  return players
    .filter(p => p.active && !onCourt.has(p.id))
    .sort((a, b) => a.games - b.games || a.lastPlayed - b.lastPlayed || a.tie - b.tie)
}

const SPLITS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]]

// Of the 3 ways to split 4 players into 2 teams, pick the lowest-cost one:
// MMR gap between teams + penalties for repeated partners / opponents.
function bestSplit(g) {
  let best = null
  for (const [A, B] of SPLITS) {
    const [a0, a1, b0, b1] = [g[A[0]], g[A[1]], g[B[0]], g[B[1]]]
    const gap = Math.abs(a0.mmr + a1.mmr - b0.mmr - b1.mmr)
    const partnerRepeats = (a0.partners[a1.id] ?? 0) + (b0.partners[b1.id] ?? 0)
    const opponentRepeats = [a0, a1].reduce(
      (t, a) => t + [b0, b1].reduce((s, b) => s + (a.opponents[b.id] ?? 0), 0), 0)
    const cost = gap + 60 * partnerRepeats + 15 * opponentRepeats
    if (!best || cost < best.cost) best = { cost, teamA: [a0.id, a1.id], teamB: [b0.id, b1.id] }
  }
  return { teamA: best.teamA, teamB: best.teamB }
}

const sizeOf = format => (format === 'doubles' ? 4 : 2)

// Fill the given free courts; every court has its own format (singles / doubles).
// Fairness decides WHO plays (front of the queue), MMR decides WHO PLAYS WHOM.
export function buildMatches(players, onCourt, freeCourts) {
  const queue = queueOrder(players, onCourt)
  let left = queue.length
  const chosen = []
  for (const court of freeCourts) {          // skip a court that can't be filled, try the next
    if (sizeOf(court.format) <= left) { chosen.push(court); left -= sizeOf(court.format) }
  }
  const total = chosen.reduce((t, c) => t + sizeOf(c.format), 0)
  const pool = queue.slice(0, total).sort((a, b) => b.mmr - a.mmr) // group similar levels
  let at = 0
  return chosen.map(court => {
    const g = pool.slice(at, (at += sizeOf(court.format)))
    const match = g.length === 2 ? { teamA: [g[0].id], teamB: [g[1].id] } : bestSplit(g)
    return { court, ...match }
  })
}
