import { nextTick, onMounted, ref, watch, type Ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'phon-theme'

function readStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'dark' || value === 'light' ? value : null
}

function detectPreferredTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export interface UseThemeReturn {
  theme: Ref<Theme>
  toggle: (event?: MouseEvent) => void
}

export function useTheme(): UseThemeReturn {
  const theme = ref<Theme>('light')

  onMounted(() => {
    theme.value = readStoredTheme() ?? detectPreferredTheme()
    applyTheme(theme.value)
  })

  watch(theme, (next) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next)
    }
  })

  function commit(next: Theme): void {
    theme.value = next
    applyTheme(next)
  }

  function toggle(event?: MouseEvent): void {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'

    if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
      commit(next)
      return
    }

    const x = event?.clientX ?? window.innerWidth - 32
    const y = event?.clientY ?? 32
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    const transition = document.startViewTransition(async () => {
      commit(next)
      await nextTick()
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 450,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    })
  }

  return { theme, toggle }
}
