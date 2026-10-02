<script setup>
import { computed } from 'vue'
import { useSession } from '../stores/session'

const { state, queue, onCourt, toggleSitOut } = useSession()
const playing = computed(() => state.players.filter(p => onCourt.value.has(p.id)))
const sitting = computed(() => state.players.filter(p => !p.active && !onCourt.value.has(p.id)))
const chip = 'flex items-center gap-2 rounded-full bg-court/10 py-1 pl-3 pr-1 text-sm font-semibold'
const btn = 'rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-court ring-1 ring-court/30'
</script>

<template>
  <div class="space-y-4 rounded-lg bg-card p-4 shadow-sm ring-1 ring-court/15">
    <div>
      <h3 class="mb-2 font-display text-xl font-bold">Up next</h3>
      <ol v-if="queue.length" class="flex flex-wrap gap-2">
        <li v-for="(p, i) in queue" :key="p.id" :class="chip">
          <span>{{ i + 1 }}. {{ p.name }} <span class="font-normal text-ink/60">({{ p.games }} played)</span></span>
          <button :class="btn" @click="toggleSitOut(p.id)">Sit out</button>
        </li>
      </ol>
      <p v-else class="text-ink/60">Nobody is waiting right now.</p>
    </div>

    <div v-if="playing.length">
      <h3 class="mb-2 font-display text-xl font-bold">On court</h3>
      <ul class="flex flex-wrap gap-2">
        <li v-for="p in playing" :key="p.id" :class="chip">
          <span>{{ p.name }}</span>
          <button :class="[btn, !p.active && 'bg-shuttle/60 text-ink']" :aria-pressed="!p.active" @click="toggleSitOut(p.id)">
            {{ p.active ? 'Sit out next' : 'Sitting out next' }}
          </button>
        </li>
      </ul>
    </div>

    <div v-if="sitting.length">
      <h3 class="mb-2 font-display text-xl font-bold">Sitting out</h3>
      <ul class="flex flex-wrap gap-2">
        <li v-for="p in sitting" :key="p.id" :class="chip">
          <span>{{ p.name }} <span class="font-normal text-ink/60">({{ p.games }} played)</span></span>
          <button :class="btn" @click="toggleSitOut(p.id)">Rejoin</button>
        </li>
      </ul>
    </div>
  </div>
</template>
