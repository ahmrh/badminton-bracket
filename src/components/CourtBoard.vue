<script setup>
import { useSession } from '../stores/session'
import MatchCard from './MatchCard.vue'
import PlayerQueue from './PlayerQueue.vue'

const s = useSession()
const { state } = s
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="font-display text-2xl font-bold">Courts</h2>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="state.autoFill" type="checkbox" class="size-4 accent-court" />
        Fill free courts automatically
      </label>
    </div>

    <MatchCard v-for="c in state.courts" :key="c.id" :court="c" />

    <button v-if="!state.autoFill" class="w-full rounded-md border-2 border-court py-2 font-semibold text-court" @click="s.fillCourts()">
      Fill free courts
    </button>

    <PlayerQueue />

    <div v-if="state.history.length" class="rounded-lg bg-card p-4 shadow-sm ring-1 ring-court/15">
      <h3 class="mb-2 font-display text-xl font-bold">Recent results</h3>
      <ul class="space-y-1 text-sm">
        <li v-for="(h, i) in state.history.slice(0, 5)" :key="i">
          {{ h.teamA.join(' & ') }} <strong>{{ h.sa }}-{{ h.sb }}</strong> {{ h.teamB.join(' & ') }}
        </li>
      </ul>
    </div>
  </section>
</template>
