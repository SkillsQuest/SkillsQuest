import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { applyTheme, watchSystemTheme } from './host/theme.ts'
import './index.css'

applyTheme()
watchSystemTheme(applyTheme)

const root = document.getElementById('root')
if (!root) throw new Error('#root 不存在')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
