<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TranscriptionResult } from '@/lib/types'

interface Props {
  result: TranscriptionResult | null
}

const props = defineProps<Props>()

const durationLabel = computed<string>(() => {
  if (!props.result) return ''
  const seconds = props.result.durationMs / 1000
  return seconds >= 1 ? `${seconds.toFixed(2)} s` : `${props.result.durationMs} ms`
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Sparkles class="size-5 text-primary" />
        Transcription
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Transition name="result" mode="out-in">
        <div v-if="result" :key="result.ipa" class="space-y-4">
          <p
            class="select-text break-words rounded-lg bg-muted/50 p-4 font-mono text-2xl leading-relaxed text-foreground"
          >
            /{{ result.ipa }}/
          </p>
          <div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{{ result.modelId }}</Badge>
            <span>Duration: {{ durationLabel }}</span>
            <span v-if="result.segments.length > 0">· {{ result.segments.length }} segment(s)</span>
          </div>
        </div>
        <p v-else key="empty" class="text-sm text-muted-foreground">
          Drop an audio file and click Transcribe to see the IPA result here.
        </p>
      </Transition>
    </CardContent>
  </Card>
</template>
