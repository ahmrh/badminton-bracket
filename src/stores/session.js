import { reactive, computed, watch } from 'vue'
import { buildMatches, queueOrder } from '../lib/matchmaking'
import { START_MMR, mmrDelta } from '../lib/mmr'

// Module-level state, mirrored to localStorage so it survives refreshes until the user clears it.
const state = reactive({
  started: false, format: 'doubles', autoFill: true,
  players: [], courts: [], history: [], counter: 0, nextId: 1, matchSeq: 0,
})

// ---- persistence (localStorage, unique key because github.io origins are shared across repos) ----
const KEY = 'badminton-bracket:v1'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))?.state
    if (saved?.started && Array.isArray(saved.players) && Array.isArray(saved.courts)) {
      Object.assign(state, saved)
    }
  } catch { /* storage blocked or corrupted: start fresh */ }
}

function save() {
  try {
    if (state.started) localStorage.setItem(KEY, JSON.stringify({ v: 1, state }))
    else localStorage.removeItem(KEY) // "New session" deletes the saved data
  } catch { /* storage full or blocked: keep running in memory */ }
}

load()
watch(state, save, { deep: true })

const byId = id => state.players.find(p => p.id === id)
const onCourt = computed(() => new Set(
  state.courts.flatMap(c => (c.match ? [...c.match.teamA, ...c.match.teamB] : []))))
const queue = computed(() => queueOrder(state.players, onCourt.value))
const standings = computed(() => [...state.players].sort((a, b) => b.mmr - a.mmr || b.wins - a.wins))

const newPlayer = (name, games = 0, mmr = START_MMR) => ({
  id: state.nextId++, name, mmr, games, wins: 0, losses: 0, pf: 0, pa: 0, last: 0, streak: 0,
  lastPlayed: state.counter, active: true, partners: {}, opponents: {}, tie: Math.random(),
})

function start(names, format, courtCount) {
  Object.assign(state, {
    started: true, format, players: [], history: [], counter: 0, nextId: 1, matchSeq: 0,
    courts: Array.from({ length: courtCount }, (_, i) => ({ id: i + 1, format, match: null })),
  })
  names.forEach(n => state.players.push(newPlayer(n)))
  fillCourts()
}

function fillCourts() {
  const free = state.courts.filter(c => !c.match)
  buildMatches(state.players, onCourt.value, free).forEach(({ court, teamA, teamB }) => {
    court.match = { teamA, teamB, id: ++state.matchSeq, format: court.format }
  })
}

// Applies to the NEXT match generated on that court.
function setCourtFormat(courtId, format) {
  const c = state.courts.find(c => c.id === courtId)
  if (!c || c.format === format) return
  c.format = format
  if (!c.match && state.autoFill) fillCourts()
}

function submitScore(courtId, sa, sb) {
  const court = state.courts.find(c => c.id === courtId)
  const m = court?.match
  if (!m || ![sa, sb].every(n => Number.isInteger(n) && n >= 0) || sa === sb) return false

  const aWon = sa > sb
  const [win, lose] = aWon ? [m.teamA, m.teamB] : [m.teamB, m.teamA]
  const [wp, lp] = aWon ? [sa, sb] : [sb, sa]
  const avg = ids => ids.reduce((t, id) => t + byId(id).mmr, 0) / ids.length
  const delta = mmrDelta(avg(win), avg(lose), wp, lp)

  state.counter++
  const apply = (ids, foes, sign, pf, pa) => ids.forEach(id => {
    const p = byId(id)
    p.mmr += sign * delta; p.last = sign * delta
    p.games++; p.pf += pf; p.pa += pa; p.lastPlayed = state.counter
    if (sign > 0) { p.wins++; p.streak++ } else { p.losses++; p.streak = 0 }
    ids.filter(o => o !== id).forEach(o => { p.partners[o] = (p.partners[o] ?? 0) + 1 })
    foes.forEach(o => { p.opponents[o] = (p.opponents[o] ?? 0) + 1 })
  })
  apply(win, lose, 1, wp, lp)
  apply(lose, win, -1, lp, wp)

  const names = ids => ids.map(id => byId(id).name)
  state.history.unshift({ teamA: names(m.teamA), teamB: names(m.teamB), sa, sb, delta })
  court.match = null
  if (state.autoFill) fillCourts()
  return true
}

function cancelMatch(courtId) {
  const c = state.courts.find(c => c.id === courtId)
  if (c) c.match = null
}

// Takes effect from the NEXT match: someone already on court finishes that game first.
function toggleSitOut(id) {
  const p = byId(id)
  p.active = !p.active
  if (p.active && !onCourt.value.has(id) && state.autoFill) fillCourts()
}

// Late joiner: average MMR, and the lowest game count so they slot in fairly.
function addPlayer(raw) {
  const name = raw.trim()
  if (!name || state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) return false
  const active = state.players.filter(p => p.active)
  const avgMmr = Math.round(state.players.reduce((t, p) => t + p.mmr, 0) / (state.players.length || 1)) || START_MMR
  state.players.push(newPlayer(name, active.length ? Math.min(...active.map(p => p.games)) : 0, avgMmr))
  if (state.autoFill) fillCourts()
  return true
}

function reset() {
  Object.assign(state, { started: false, players: [], courts: [], history: [], counter: 0, nextId: 1, matchSeq: 0 })
}

export const useSession = () => ({
  state, queue, onCourt, standings, byId,
  start, fillCourts, submitScore, cancelMatch, toggleSitOut, setCourtFormat, addPlayer, reset,
})
