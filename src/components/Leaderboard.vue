<script setup>
import { ref } from 'vue'
import { useSession } from '../stores/session'
import { tierFor, streakFor } from '../lib/tags'
import TagChip from './TagChip.vue'

const { standings, onCourt, addPlayer, toggleSitOut } = useSession()
const name = ref('')
const error = ref('')

function add() {
  if (addPlayer(name.value)) { name.value = ''; error.value = '' }
  else error.value = 'Enter a name that is not already in this session.'
}
</script>

<template>
  <section class="space-y-4">
    <h2 class="font-display text-2xl font-bold">Leaderboard</h2>

    <div class="overflow-x-auto rounded-lg bg-card shadow-sm ring-1 ring-court/15">
      <table class="w-full text-left">
        <thead class="bg-court/10 text-sm">
          <tr>
            <th class="px-3 py-2">#</th><th class="px-3 py-2">Player</th>
            <th class="px-3 py-2">Level</th><th class="px-3 py-2 text-right">W-L</th>
            <th class="hidden px-3 py-2 text-right sm:table-cell">Pts +/-</th>
            <th class="px-3 py-2"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in standings" :key="p.id" class="border-t border-ink/10" :class="{ 'opacity-60': !p.active }">
            <td class="px-3 py-2 font-display text-lg">{{ i + 1 }}</td>
            <td class="px-3 py-2 font-semibold">
              {{ p.name }}
              <span v-if="!p.active" class="ml-1 text-xs font-normal">{{ onCourt.has(p.id) ? 'sits out next' : 'sitting out' }}</span>
              <span v-else-if="onCourt.has(p.id)" class="ml-1 text-xs font-normal text-court">on court</span>
            </td>
            <td class="px-3 py-2">
              <div class="flex flex-wrap items-center gap-1">
                <TagChip :tag="tierFor(p.mmr)" />
                <TagChip v-if="streakFor(p)" :tag="streakFor(p)" />
                <span v-if="p.last" class="text-xs font-semibold" :class="p.last > 0 ? 'text-win' : 'text-loss'">
                  {{ p.last > 0 ? '▲' : '▼' }}<span class="sr-only">{{ p.last > 0 ? 'rating up' : 'rating down' }}</span>
                </span>
              </div>
            </td>
            <td class="px-3 py-2 text-right">{{ p.wins }}-{{ p.losses }}</td>
            <td class="hidden px-3 py-2 text-right sm:table-cell">{{ p.pf - p.pa > 0 ? '+' : '' }}{{ p.pf - p.pa }}</td>
            <td class="px-3 py-2 text-right">
              <button class="whitespace-nowrap text-sm font-semibold text-court" @click="toggleSitOut(p.id)">
                {{ p.active ? (onCourt.has(p.id) ? 'Sit out next' : 'Sit out') : 'Rejoin' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <form class="space-y-1" @submit.prevent="add">
      <label for="late" class="block font-semibold">Add a late player</label>
      <div class="flex gap-2">
        <input id="late" v-model="name" placeholder="Name" class="min-w-0 flex-1 rounded-md border border-ink/20 bg-card px-3 py-2" />
        <button class="rounded-md bg-court px-4 py-2 font-semibold text-on-court">Add</button>
      </div>
      <p v-if="error" class="text-sm text-loss" role="alert">{{ error }}</p>
    </form>
  </section>
</template>
