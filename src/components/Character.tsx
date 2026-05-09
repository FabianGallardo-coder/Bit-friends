import { useState, useEffect } from 'react'
import wizardSheet from '../assets/sprite-wizard.png'

// Imports de frames para anime (Eve)
import animeIdle0 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_000.png'
import animeIdle1 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_001.png'
import animeIdle2 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_002.png'
import animeIdle3 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_003.png'
import animeIdle4 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_004.png'
import animeIdle5 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_005.png'
import animeIdle6 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_006.png'
import animeIdle7 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_007.png'
import animeIdle8 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_008.png'

type CharacterType = 'anime' | 'wizard'
type CharacterState = 'idle' | 'talking' | 'thinking' | 'happy'

interface CharacterProps {
  character?: CharacterType
  state: CharacterState
  size?: number
  onClick?: () => void
}

// Constantes del mago
const FRAME_SIZE = 64
const FRAMES_PER_ROW = 4
const SHEET_SIZE = 256
const INTERVAL_MS = 120
const STATE_ROW: Record<CharacterState, number> = {
  idle: 0,
  talking: 1,
  thinking: 2,
  happy: 3,
}

// Frames de anime (por ahora solo idle, usar como fallback para todos los estados)
const ANIME_FRAMES = [
  animeIdle0, animeIdle1, animeIdle2, animeIdle3,
  animeIdle4, animeIdle5, animeIdle6, animeIdle7, animeIdle8
]

const Character: React.FC<CharacterProps> = ({ character = 'wizard', state, size = 128, onClick }) => {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setFrame(0)
    const interval = setInterval(() => {
      const totalFrames = character === 'anime' ? ANIME_FRAMES.length : FRAMES_PER_ROW
      setFrame(f => (f + 1) % totalFrames)
    }, INTERVAL_MS)
    return () => clearInterval(interval)
  }, [state, character])

  const handleDrag = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().startDragging()
    } catch (_) {}
  }

  // Render para personaje anime (Eve)
  if (character === 'anime') {
    return (
      <div
        style={{
          width: size,
          height: size,
          overflow: 'hidden',
          cursor: 'grab',
        }}
        onClick={onClick}
        onMouseDown={handleDrag}
      >
        <img
          src={ANIME_FRAMES[frame % ANIME_FRAMES.length]}
          alt="Eve"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />
      </div>
    )
  }

  // Render para personaje mago (Merlin)
  const col = frame % FRAMES_PER_ROW
  const row = STATE_ROW[state]
  const bgX = col * FRAME_SIZE
  const bgY = row * FRAME_SIZE
  const scale = size / FRAME_SIZE

  return (
    <div
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        cursor: 'grab',
      }}
      onClick={onClick}
      onMouseDown={handleDrag}
    >
      <div style={{
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        backgroundImage: `url(${wizardSheet})`,
        backgroundSize: `${SHEET_SIZE}px ${SHEET_SIZE}px`,
        backgroundPosition: `-${bgX}px -${bgY}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }} />
    </div>
  )
}

export default Character