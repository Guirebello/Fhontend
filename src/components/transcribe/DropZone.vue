<script setup lang="ts">
import { computed, ref } from 'vue'
import { FileAudio, UploadCloud, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  modelValue: File | null
  accept: string
  maxBytes: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  error: [message: string]
}>()

const isDragging = ref<boolean>(false)
const inputRef = ref<HTMLInputElement | null>(null)

const acceptedMimes = computed<string[]>(() =>
  props.accept
    .split(',')
    .map((mime) => mime.trim())
    .filter((mime) => mime.length > 0)
)

const humanMaxSize = computed<string>(() => formatBytes(props.maxBytes))

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validate(file: File): string | null {
  if (acceptedMimes.value.length > 0 && !acceptedMimes.value.includes(file.type)) {
    return `Unsupported file type: ${file.type || 'unknown'}. Allowed: ${acceptedMimes.value.join(', ')}`
  }
  if (file.size > props.maxBytes) {
    return `File too large: ${formatBytes(file.size)}. Max ${humanMaxSize.value}`
  }
  return null
}

function handleFiles(files: FileList | null): void {
  if (!files || files.length === 0) return
  const file = files[0]
  const errorMessage = validate(file)
  if (errorMessage) {
    emit('error', errorMessage)
    emit('update:modelValue', null)
    return
  }
  emit('update:modelValue', file)
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = false
  if (props.disabled) return
  handleFiles(event.dataTransfer?.files ?? null)
}

function onDragOver(event: DragEvent): void {
  event.preventDefault()
  if (props.disabled) return
  isDragging.value = true
}

function onDragLeave(): void {
  isDragging.value = false
}

function onPick(event: Event): void {
  const target = event.target as HTMLInputElement
  handleFiles(target.files)
  target.value = ''
}

function openPicker(): void {
  if (props.disabled) return
  inputRef.value?.click()
}

function clear(event: Event): void {
  event.stopPropagation()
  emit('update:modelValue', null)
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    :aria-disabled="disabled"
    :class="
      cn(
        'group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-card px-6 py-12 text-center',
        'transition-[border-color,background-color,transform] duration-200 ease-out motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isDragging && !disabled
          ? 'border-primary bg-primary/5 scale-[1.01] motion-reduce:scale-100'
          : 'border-border hover:border-primary/60',
        disabled && 'cursor-not-allowed opacity-60'
      )
    "
    @click="openPicker"
    @keydown.enter.prevent="openPicker"
    @keydown.space.prevent="openPicker"
    @drop="onDrop"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
  >
    <input ref="inputRef" type="file" class="sr-only" :accept="accept" :disabled="disabled" @change="onPick" />

    <template v-if="modelValue">
      <FileAudio class="size-10 text-primary" />
      <div class="space-y-1">
        <p class="text-sm font-medium text-foreground">{{ modelValue.name }}</p>
        <p class="text-xs text-muted-foreground">{{ formatBytes(modelValue.size) }}</p>
      </div>
      <Button type="button" variant="ghost" size="sm" :disabled="disabled" class="mt-1" @click="clear">
        <X class="size-4" />
        Remove
      </Button>
    </template>

    <template v-else>
      <UploadCloud class="size-10 text-muted-foreground transition-colors group-hover:text-primary" />
      <div class="space-y-1">
        <p class="text-sm font-medium text-foreground">
          Drop an audio file here, or
          <span class="text-primary underline-offset-4 group-hover:underline">click to browse</span>
        </p>
        <p class="text-xs text-muted-foreground">WAV, M4A, MP3, MP4, WebM, OGG · up to {{ humanMaxSize }}</p>
      </div>
    </template>
  </div>
</template>
