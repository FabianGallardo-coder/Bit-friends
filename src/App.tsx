import { useState, useEffect, useRef } from 'react'
import Character from './components/Character'
import ConfigPanel from './components/ConfigPanel'
import aiService from './services/ai'
import './index.css'

type CharacterType = 'anime' | 'wizard'
type CharacterState = 'idle' | 'talking' | 'thinking' | 'happy'

function App() {
  const savedChar = localStorage.getItem('selected-character') as CharacterType | null
  const [character, setCharacter] = useState<CharacterType>(savedChar || 'wizard')
  const [charState, setCharState] = useState<CharacterState>('idle')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [startupStatus, setStartupStatus] = useState<'checking' | 'ollama' | 'api' | 'none'>('checking')
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('selected-character', character)
  }, [character])

  useEffect(() => {
    const checkAI = async () => {
      const ollamaAvailable = await aiService.checkOllamaHealth()
      if (ollamaAvailable) {
        setStartupStatus('ollama')
        setTimeout(() => {
          setIsOpen(true)
          setCharState('talking')
          setResponse('¡Hola! Soy Bit, tu asistente mágico 🤖\nOllama está listo, ¿en qué te ayudo?')
        }, 800)
        return
      }

      const config = aiService.getConfig()
      if (config.cloudProvider !== 'none' && config.cloudApiKey) {
        setStartupStatus('api')
        setTimeout(() => {
          setIsOpen(true)
          setCharState('talking')
          setResponse('¡Hola! Conexión cloud activa ☁️\nDecime, ¿qué necesitás?')
        }, 800)
        return
      }

      setStartupStatus('none')
      setTimeout(() => {
        setIsOpen(true)
        setCharState('talking')
        setResponse('¡Hola! 👋\nPara chatear necesito IA.\n\n• Ollama local (recomendado): instalalo y correlo\n• API Cloud: click derecho → configuración\n\nElegí una opción y te respondo!')
      }, 800)
    }

    checkAI()
  }, [])

  useEffect(() => {
    if (bubbleRef.current) {
      bubbleRef.current.scrollTop = bubbleRef.current.scrollHeight
    }
  }, [response])

  const handleCloseApp = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      await getCurrentWindow().close()
    } catch (error) {
      console.error('Cannot close app:', error)
    }
  }

  const handleClick = () => {
    if (!showConfig) setIsOpen(prev => !prev)
  }

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowConfig(true)
    setIsOpen(true)
  }

  const handleSend = async () => {
    const texto = message.trim()
    if (!texto) return

    // Comando /bye => cerrar app
    if (texto.toLowerCase() === '/bye') {
      setResponse('¡Chau! Nos vemos 👋')
      setCharState('happy')
      setMessage('')
      setTimeout(() => handleCloseApp(), 1000)
      return
    }

    setMessage('')
    setIsOpen(true)
    setCharState('thinking')
    setResponse('...')

    try {
      await aiService.generateResponse(texto, (text) => {
        setResponse(text)
        setCharState('talking')
      })
      setCharState('happy')
      setTimeout(() => setCharState('idle'), 2000)
    } catch (error) {
      console.error('Error generating response:', error)
      setCharState('idle')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="app-container" onContextMenu={handleRightClick}>
      <div className="ai-status" title={
        startupStatus === 'ollama' ? 'IA: Ollama local' :
        startupStatus === 'api' ? 'IA: API cloud' :
        startupStatus === 'checking' ? 'Verificando...' :
        'Sin IA configurada'
      }>
        {startupStatus === 'checking' && '⏳'}
        {startupStatus === 'ollama' && '🟢'}
        {startupStatus === 'api' && '☁️'}
        {startupStatus === 'none' && '🔴'}
      </div>

      {showConfig && (
        <ConfigPanel
          visible={showConfig}
          onClose={() => setShowConfig(false)}
          onCloseApp={handleCloseApp}
          character={character}
          onCharacterChange={setCharacter}
          startupStatus={startupStatus}
        />
      )}

      {/* Globo de diálogo */}
      {response !== '' && (
        <div className="speech-bubble" ref={bubbleRef}>
          <div className="speech-bubble__arrow" />
          {response}
        </div>
      )}

      {/* Personaje */}
      <div onClick={handleClick} className="character-wrapper">
        <Character character={character} state={charState} />
      </div>

      {/* Input y botón */}
      {isOpen && !showConfig && (
        <div className="chat-row">
          <input
            className="chat-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí algo..."
            autoFocus
          />
          <button className="send-btn" onClick={handleSend}>→</button>
        </div>
      )}
    </div>
  )
}

export default App