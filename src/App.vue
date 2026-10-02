<script setup>
import { ref, watchEffect } from 'vue'
import { useSession } from './stores/session'
import SetupPanel from './components/SetupPanel.vue'
import CourtBoard from './components/CourtBoard.vue'
import Leaderboard from './components/Leaderboard.vue'

const { state, reset } = useSession()
const tab = ref('courts')
const THEME_KEY = 'badminton-bracket:theme'
const readTheme = () => { try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark' } catch { return 'dark' } }
const theme = ref(readTheme()) // dark unless the user picked light before
watchEffect(() => {
  document.documentElement.dataset.theme = theme.value
  try { localStorage.setItem(THEME_KEY, theme.value) } catch { /* ignore */ }
})
const tabs = [['courts', 'Courts'], ['board', 'Leaderboard']]

function end() {
  if (confirm('Start a new session? This deletes the saved players, ratings and results from this browser.')) reset()
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 pb-16">
    <header class="flex items-center justify-between gap-2 py-5">
      <h1 class="font-display text-3xl font-bold">Badminton Bracket</h1>
      <div class="flex items-center gap-2">
        <button class="rounded-md px-3 py-2 text-sm font-semibold text-court ring-1 ring-court/30"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
          @click="theme = theme === 'dark' ? 'light' : 'dark'">
          {{ theme === 'dark' ? 'Light theme' : 'Dark theme' }}
        </button>
        <button v-if="state.started" class="rounded-md px-3 py-2 text-sm font-semibold text-loss hover:bg-loss/10" @click="end">
          New session
        </button>
      </div>
    </header>

    <SetupPanel v-if="!state.started" />

    <template v-else>
      <p class="mb-3 text-sm text-ink/60">Progress is saved in this browser until you start a new session or clear site data.</p>
      <nav class="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-court/10 p-1 lg:hidden" aria-label="Sections">
        <button v-for="[key, label] in tabs" :key="key"
          class="rounded-md py-2 font-semibold"
          :class="tab === key ? 'bg-court text-on-court' : 'text-court'"
          :aria-pressed="tab === key" @click="tab = key">{{ label }}</button>
      </nav>

      <div class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div :class="tab === 'courts' ? 'block' : 'hidden lg:block'"><CourtBoard /></div>
        <div :class="tab === 'board' ? 'block' : 'hidden lg:block'"><Leaderboard /></div>
      </div>
    </template>
  </div>
</template>
