<script setup lang="ts">
import { useHead, useRoute, useRouter } from ".vitekit-runtime/index"

useHead({
  title: "Home",
})

const route = useRoute()
</script>

<template>
  <div>
    {{ route.hash }}
    <router-link to="/hello">hello</router-link>
  </div>
</template>
