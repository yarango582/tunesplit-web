import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AudioMixer from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AudioMixer />
  </StrictMode>,
)
