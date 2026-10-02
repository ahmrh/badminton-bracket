<script setup>
import { computed, ref } from 'vue'
import { useSession } from '../stores/session'
import { tierFor } from '../lib/tags'
import SpinSlot from './SpinSlot.vue'

const props = defineProps({ court: { type: Object, required: true } })
const s = useSession()
const a = ref('')
const b = ref('')
const FORMATS = [['singles', 'Singles'], ['doubles', 'Doubles']]

const pool = computed(() => s.state.players.map(p => p.name))
const team = ids => ids.map(s.byId)
const sa = computed(() => (a.value === '' ? NaN : Number(a.value)))
const sb = computed(() => (b.value === '' ? NaN : Number(b.value)))
const valid = computed(() =>
  [sa.value, sb.value].every(n => Number.isInteger(n) && n >= 0) && sa.value !== sb.value)

const preview = computed(() => {
  if (!valid.value) return ''
  const hi = Math.max(sa.value, sb.value)
  const margin = (hi - Math.min(sa.value, sb.value)) / hi
  const kind = margin < 0.15 ? 'close win' : margin < 0.4 ? 'clear win' : 'dominant win'
  return `Team ${sa.value > sb.value ? 'A' : 'B'}: ${kind}`
})

// Reels land one after another, court by court. slot = 0..3 (A1, B1, A2, B2)
const delayFor = slot => (props.court.id - 1) * 250 + slot * 200
const durationFor = slot => 1500 + slot * 300

function clear() { a.value = ''; b.value = '' }
function submit() { if (s.submitScore(props.court.id, sa.value, sb.value)) clear() }
function cancel() { s.cancelMatch(props.court.id); clear() }
</script>

<template>
  <article class="overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-court/15">
    <header class="flex items-center justify-between bg-court px-4 py-2 text-on-court">
      <h3 class="font-display text-xl font-bold">
        Court {{ court.id }}
        <span v-if="court.match" class="ml-1 rounded-full bg-on-court/20 px-2 py-0.5 align-middle font-sans text-xs font-semibold">
          {{ court.match.format === 'doubles' ? 'Doubles' : 'Singles' }}
        </span>
      </h3>
      <button v-if="court.match" class="text-sm font-semibold hover:underline" @click="cancel">Cancel match</button>
    </header>

    <div v-if="court.match" class="space-y-3 p-4">
      <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div class="min-w-0">
          <p class="mb-1 text-sm text-ink/60">Team A</p>
          <SpinSlot v-for="(p, i) in team(court.match.teamA)" :key="`${court.match.id}-${p.id}`"
            :target="p.name" :pool="pool" :tag="tierFor(p.mmr)"
            :delay="delayFor(i * 2)" :duration="durationFor(i * 2)" />
        </div>

        <div class="flex items-center gap-1 pt-6">
          <input v-model="a" type="number" min="0" inputmode="numeric" aria-label="Team A score"
            class="w-14 rounded-md border border-ink/20 bg-paper py-2 text-center font-display text-3xl" />
          <span class="font-display text-2xl">:</span>
          <input v-model="b" type="number" min="0" inputmode="numeric" aria-label="Team B score"
            class="w-14 rounded-md border border-ink/20 bg-paper py-2 text-center font-display text-3xl" />
        </div>

        <div class="min-w-0 text-right">
          <p class="mb-1 text-sm text-ink/60">Team B</p>
          <SpinSlot v-for="(p, i) in team(court.match.teamB)" :key="`${court.match.id}-${p.id}`"
            :target="p.name" :pool="pool" :tag="tierFor(p.mmr)" align="right"
            :delay="delayFor(i * 2 + 1)" :duration="durationFor(i * 2 + 1)" />
        </div>
      </div>

      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-ink/70" aria-live="polite">{{ preview || 'Enter the final score' }}</p>
        <button :disabled="!valid" class="rounded-md bg-court px-4 py-2 font-semibold text-on-court disabled:opacity-40" @click="submit">
          Save result
        </button>
      </div>
    </div>

    <p v-else class="p-6 text-center text-ink/60">Waiting for enough players in the queue.</p>

    <footer class="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 px-4 py-2">
      <span class="text-sm text-ink/70">{{ court.match ? 'Format of the next match here' : 'Format for this court' }}</span>
      <div class="grid grid-cols-2 gap-1 rounded-lg bg-court/10 p-1" role="group" :aria-label="`Format for the next match on court ${court.id}`">
        <button v-for="[key, label] in FORMATS" :key="key"
          class="rounded-md px-3 py-1 text-sm font-semibold"
          :class="court.format === key ? 'bg-court text-on-court' : 'text-court'"
          :aria-pressed="court.format === key" @click="s.setCourtFormat(court.id, key)">{{ label }}</button>
      </div>
    </footer>
  </article>
</template>
