const QUERY = '(prefers-color-scheme: dark)'

function systemDark(): boolean {
  try {
    return matchMedia(QUERY).matches
  } catch {
    return false
  }
}

export function applyTheme(): void {
  const dark = systemDark()
  const html = document.documentElement
  html.classList.toggle('dark', dark)
  html.style.colorScheme = dark ? 'dark' : 'light'
}

export function watchSystemTheme(onChange: () => void): () => void {
  try {
    const media = matchMedia(QUERY)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  } catch {
    return () => undefined
  }
}
