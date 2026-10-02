<script setup>
import { computed, ref } from 'vue'
import { useSession } from '../stores/session'

const s = useSession()
const text = ref('')
const format = ref('doubles')
const courts = ref(1)

// one name per line, case-insensitive de-dupe
const names = computed(() => [...new Map(
  text.value.split('\n').map(n => n.trim()).filter(Boolean).map(n => [n.toLowerCase(), n])
).values()])
const min = computed(() => (format.value === 'doubles' ? 4 : 2))
const ok = computed(() => names.value.length >= min.value)

function go() {
  s.start(names.value, format.value, Math.max(1, Math.min(8, Number(courts.value) || 1)))
}
</script>

<template>
  <section class="mx-auto max-w-xl space-y-5 rounded-lg bg-card p-5 shadow-sm ring-1 ring-court/15">
    <div>
      <label for="players" class="mb-1 block font-semibold">Players (one name per line)</label>
      <textarea id="players" v-model="text" rows="8" placeholder="Alief&#10;Basuki&#10;Candra&#10;Dredge"
        class="w-full rounded-md border border-ink/20 bg-paper p-3 text-lg"></textarea>
      <p class="mt-1 text-sm text-ink/60">
        {{ names.length }} {{ names.length === 1 ? 'player' : 'players' }}
        <template v-if="!ok">— add at least {{ min }} to start</template>
      </p>
    </div>

    <fieldset>
      <legend class="mb-1 font-semibold">Starting format for each court</legend>
      <div class="grid grid-cols-2 gap-1 rounded-lg bg-court/10 p-1">
        <button v-for="[key, label] in [['singles', 'Singles (1v1)'], ['doubles', 'Doubles (2v2)']]" :key="key"
          class="rounded-md py-2 font-semibold" :class="format === key ? 'bg-court text-on-court' : 'text-court'"
          :aria-pressed="format === key" @click="format = key">{{ label }}</button>
      </div>
      <p class="mt-1 text-sm text-ink/60">You can switch any court later, before its next match.</p>
    </fieldset>

    <div class="flex items-center justify-between">
      <label for="courts" class="font-semibold">Courts available</label>
      <input id="courts" v-model="courts" type="number" min="1" max="8"
        class="w-20 rounded-md border border-ink/20 bg-paper py-2 text-center font-display text-2xl" />
    </div>

    <button :disabled="!ok" class="w-full rounded-md bg-court py-3 text-lg font-semibold text-on-court disabled:opacity-40" @click="go">
      Start session
    </button>
  </section>
</template>
