import type { ApiError, PhoneticModel, TranscriptionResult } from '@/lib/types'

const baseUrl: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1337'

export class TranscriptionApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'TranscriptionApiError'
    this.code = code
    this.status = status
  }
}

interface ApiEnvelope<T> {
  data?: T
  error?: ApiError
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null
  try {
    body = (await response.json()) as ApiEnvelope<T>
  } catch {
    body = null
  }

  if (!response.ok) {
    const message = body?.error?.message ?? `Request failed with status ${response.status}`
    const code = body?.error?.code ?? 'UNKNOWN_ERROR'
    throw new TranscriptionApiError(message, code, response.status)
  }

  if (!body || body.data === undefined) {
    throw new TranscriptionApiError('Malformed response from server', 'MALFORMED_RESPONSE', response.status)
  }

  return body.data
}

export async function getModels(): Promise<PhoneticModel[]> {
  const response = await fetch(`${baseUrl}/models`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  return parseEnvelope<PhoneticModel[]>(response)
}

export async function transcribe(file: File, modelId?: string): Promise<TranscriptionResult> {
  const form = new FormData()
  form.append('audio', file)
  if (modelId) {
    form.append('modelId', modelId)
  }

  const response = await fetch(`${baseUrl}/transcription`, {
    method: 'POST',
    body: form,
  })
  return parseEnvelope<TranscriptionResult>(response)
}
