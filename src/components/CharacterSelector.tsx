import React from 'react'
import animeIdle0 from './eve/animations/Gentle_idle_breathing_animation._Character_subtly-6dd229f1/south/frame_000.png'
import wizardSheet from '../sprite-wizard.png.png'

type CharacterType = 'anime' | 'wizard'

interface CharacterSelectorProps {
  onSelect: (character: CharacterType) => void
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ onSelect }) => {
  const handleSelect = (character: CharacterType) => {
    localStorage.setItem('selected-character', character)
    onSelect(character)
  }

  return (
    <div className="selector-overlay">
      <div className="selector-title">elegí tu asistente</div>
      <div className="selector-cards">
        {/* Anime - Eve */}
        <div className="selector-card" onClick={() => handleSelect('anime')}>
          <img
            src={animeIdle0}
            width={92}
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
          <span>Eve</span>
        </div>

        {/* Wizard - Merlin */}
        <div className="selector-card" onClick={() => handleSelect('wizard')}>
          <div style={{
            width: 64 * 2,
            height: 64 * 2,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              width: 64,
              height: 64,
              backgroundImage: `url(${wizardSheet})`,
              backgroundSize: '256px 256px',
              backgroundPosition: '0 0',
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
              transform: 'scale(2)',
              transformOrigin: 'top left',
            }} />
          </div>
          <span>Merlin</span>
        </div>
      </div>
    </div>
  )
}

export default CharacterSelector
