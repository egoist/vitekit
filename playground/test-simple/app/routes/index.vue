<script setup lang="ts">
import { useRoute, useNavigate } from ".vitekit-package/index"

const route = useRoute()
const navigate = useNavigate()
</script>

<template>
  <div>
    {{ route.hash }}
    <router-link to="/hello">hello</router-link>
    <button @click="navigate('/hello')">go hello</button>
  </div>
</template>
