export interface PhoneticModel {
  id: string
  name: string
  language: string
  status: 'available' | 'disabled'
}

export interface TranscriptionSegment {
  startMs: number
  endMs: number
  ipa: string
}

export interface TranscriptionResult {
  modelId: string
  ipa: string
  durationMs: number
  segments: TranscriptionSegment[]
}

export interface ApiError {
  code: string
  message: string
}
