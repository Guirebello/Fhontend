import { onMounted, ref, type Ref } from 'vue'
import { getModels } from '@/lib/api'
import type { PhoneticModel } from '@/lib/types'

export interface UseModelsReturn {
  models: Ref<PhoneticModel[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  refresh: () => Promise<void>
}

export function useModels(): UseModelsReturn {
  const models = ref<PhoneticModel[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function refresh(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      models.value = await getModels()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load models'
      models.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  return { models, loading, error, refresh }
}
