<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Loader2, Moon, Sun, Waves } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import DropZone from '@/components/transcribe/DropZone.vue'
import ModelPicker from '@/components/transcribe/ModelPicker.vue'
import ResultPanel from '@/components/transcribe/ResultPanel.vue'
import { useModels } from '@/composables/useModels'
import { useTheme } from '@/composables/useTheme'
import { useTranscribe } from '@/composables/useTranscribe'

const ACCEPTED_MIMES = 'audio/wav,audio/x-wav,audio/m4a,audio/mp4,audio/mpeg,audio/webm,audio/ogg'
const MAX_BYTES = 25 * 1024 * 1024

const { theme, toggle: toggleTheme } = useTheme()
const { models, loading: modelsLoading, error: modelsError } = useModels()
const { result, loading: transcribing, run: runTranscribe } = useTranscribe()

const file = ref<File | null>(null)
const selectedModelId = ref<string | null>(null)

watch(models, (next) => {
  if (selectedModelId.value) return
  const firstAvailable = next.find((model) => model.status === 'available')
  if (firstAvailable) selectedModelId.value = firstAvailable.id
})

watch(modelsError, (message) => {
  if (message) toast.error('Could not load models', { description: message })
})

const canSubmit = computed<boolean>(() => file.value !== null && !transcribing.value)

async function onSubmit(): Promise<void> {
  if (!file.value) return
  try {
    await runTranscribe(file.value, selectedModelId.value ?? undefined)
    toast.success('Transcription complete')
  } catch (err) {
    toast.error('Transcription failed', {
      description: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}

function onDropError(message: string): void {
  toast.error('File rejected', { description: message })
}
</script>

<template>
  <div class="min-h-svh bg-background text-foreground">
    <header class="border-b border-border">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-2">
          <Waves class="size-6 text-primary" />
          <h1 class="text-lg font-semibold tracking-tight">Phon</h1>
          <span class="text-sm text-muted-foreground">· Audio → IPA</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="relative overflow-hidden"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="(e: MouseEvent) => toggleTheme(e)"
        >
          <Transition name="theme-icon" mode="out-in">
            <Sun v-if="theme === 'dark'" key="sun" class="size-4" />
            <Moon v-else key="moon" class="size-4" />
          </Transition>
        </Button>
      </div>
    </header>

    <main class="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-10 lg:grid-cols-2 lg:items-start">
      <Card>
        <CardContent class="space-y-6 pt-6">
          <ModelPicker v-model="selectedModelId" :models="models" :loading="modelsLoading" :disabled="transcribing" />

          <DropZone
            v-model="file"
            :accept="ACCEPTED_MIMES"
            :max-bytes="MAX_BYTES"
            :disabled="transcribing"
            @error="onDropError"
          />

          <Progress v-if="transcribing" />

          <div class="flex items-center justify-end">
            <Button type="button" :disabled="!canSubmit" @click="onSubmit">
              <Loader2 v-if="transcribing" class="size-4 animate-spin" />
              {{ transcribing ? 'Transcribing...' : 'Transcribe' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResultPanel :result="result" />
    </main>
  </div>
</template>
