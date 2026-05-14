<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import TranscribePage from '@/components/transcribe/TranscribePage.vue'
</script>

<template>
  <TranscribePage />
  <Toaster rich-colors close-button position="bottom-right" />
</template>
