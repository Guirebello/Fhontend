import { ref, type Ref } from 'vue'
import { transcribe } from '@/lib/api'
import type { TranscriptionResult } from '@/lib/types'

export interface UseTranscribeReturn {
  result: Ref<TranscriptionResult | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  run: (file: File, modelId?: string) => Promise<void>
  reset: () => void
}

export function useTranscribe(): UseTranscribeReturn {
  const result = ref<TranscriptionResult | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function run(file: File, modelId?: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      result.value = await transcribe(file, modelId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Transcription failed'
      result.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    result.value = null
    error.value = null
  }

  return { result, loading, error, run, reset }
}
