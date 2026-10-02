<script setup>
defineProps({ tag: { type: Object, required: true } })
</script>

<template>
  <span class="inline-block rounded-full px-2 py-0.5 text-xs font-semibold" :class="tag.cls">{{ tag.label }}</span>
</template>
