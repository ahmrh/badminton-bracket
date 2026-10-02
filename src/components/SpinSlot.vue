<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import TagChip from './TagChip.vue'

const props = defineProps({
  target: { type: String, required: true },   // the real, already-decided player
  pool: { type: Array, required: true },      // names that whizz past (visual only)
  tag: { type: Object, required: true },
  delay: { type: Number, default: 0 },
  duration: { type: Number, default: 1800 },
  align: { type: String, default: 'left' },
})

const ITEM = 28 // px per reel row
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Decoration only: random names that scroll past, ending on the real assignment.
function buildReel() {
  if (reduce) return { items: [props.target], index: 0 }
  const src = props.pool.filter(n => n !== props.target)
  const items = []
  const pick = () => {
    if (!src.length) return props.target
    let n
    do { n = src[Math.floor(Math.random() * src.length)] } while (src.length > 1 && n === items.at(-1))
    return n
  }
  for (let i = 0; i < 16; i++) items.push(pick())
  items.push(props.target)
  const index = items.length - 1
  items.push(pick()) // row below the target while spinning
  return { items, index }
}
const { items, index } = buildReel()

const phase = ref(reduce ? 'landed' : 'spin')
const started = ref(false)
let timer

function land() {
  if (phase.value === 'landed') return
  phase.value = 'landed'
}

onMounted(() => {
  if (reduce) return
  requestAnimationFrame(() => requestAnimationFrame(() => { started.value = true }))
  timer = setTimeout(land, props.delay + props.duration + 150) // fallback if transitionend never fires
})
onBeforeUnmount(() => clearTimeout(timer))

const windowStyle = computed(() => ({
  height: `${phase.value === 'spin' ? ITEM * 3 : ITEM}px`,
  transition: 'height 250ms ease',
  maskImage: phase.value === 'spin'
    ? 'linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent)' : 'none',
}))

const reelStyle = computed(() => {
  if (phase.value === 'landed') {
    return { transform: `translateY(${-index * ITEM}px)`, transition: 'transform 250ms ease' }
  }
  const y = started.value ? -(index - 1) * ITEM : 0   // target settles on the middle row
  return {
    transform: `translateY(${y}px)`,
    transition: `transform ${props.duration}ms cubic-bezier(.12,.75,.15,1) ${props.delay}ms`,
  }
})

function onEnd(e) {
  if (e.propertyName === 'transform' && started.value) land()
}
</script>

<template>
  <div>
    <span class="sr-only">{{ target }}</span>
    <div class="overflow-hidden" :style="windowStyle" aria-hidden="true">
      <div :style="reelStyle" :class="phase === 'spin' && started ? 'blur-[1px]' : ''" @transitionend="onEnd">
        <div v-for="(n, i) in items" :key="i"
          class="flex items-center truncate text-lg font-semibold"
          :class="[align === 'right' ? 'justify-end' : '', i === index && phase === 'landed' ? '' : 'text-ink/70']"
          :style="{ height: ITEM + 'px' }">{{ n }}</div>
      </div>
    </div>
    <div class="flex h-6 items-center" :class="align === 'right' ? 'justify-end' : ''">
      <TagChip v-if="phase === 'landed'" :tag="tag" />
    </div>
  </div>
</template>
