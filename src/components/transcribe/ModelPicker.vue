<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PhoneticModel } from '@/lib/types'

interface Props {
  modelValue: string | null
  models: PhoneticModel[]
  loading: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [modelId: string]
}>()

function onChange(value: unknown): void {
  if (typeof value === 'string') emit('update:modelValue', value)
}

function isDisabled(): boolean {
  return props.disabled || props.loading || props.models.length === 0
}
</script>

<template>
  <div class="space-y-2">
    <Label for="model-picker">Model</Label>
    <Select :model-value="modelValue ?? undefined" :disabled="isDisabled()" @update:model-value="onChange">
      <SelectTrigger id="model-picker" class="w-full">
        <SelectValue :placeholder="loading ? 'Loading models...' : 'Select a model'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="model in models" :key="model.id" :value="model.id" :disabled="model.status !== 'available'">
          {{ model.name }} <span class="text-muted-foreground">· {{ model.language }}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
