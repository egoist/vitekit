<script lang="ts" setup>
const { error } = defineProps<{
  error: {
    status: number
    message: string
  }
}>()
</script>

<template>
  <div>
    <h1>{{ error.status }}</h1>
    <p>{{ error.message }}</p>
  </div>
</template>
