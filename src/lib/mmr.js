export const START_MMR = 1000
const K = 32

// Standard Elo win probability for rating a against rating b.
export const expected = (a, b) => 1 / (1 + 10 ** ((b - a) / 400))

/**
 * Points the winning side gains and the losing side loses (zero-sum).
 *   delta = K * (1 - expectedWin) * (1 + margin)
 *   margin = (winnerPts - loserPts) / winnerPts   -> 0 (nail-biter) .. 1 (shutout)
 * Even match: 21-19 ~ +18, 21-8 ~ +26, 21-0 = +32. Upsets pay more, favourites less.
 */
export function mmrDelta(winnerMmr, loserMmr, winnerPts, loserPts) {
  const margin = (winnerPts - loserPts) / Math.max(winnerPts, 1)
  const surprise = 1 - expected(winnerMmr, loserMmr)
  return Math.max(1, Math.round(K * surprise * (1 + margin)))
}
