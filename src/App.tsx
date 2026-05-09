import { useState, useEffect, useRef } from 'react'
import Character from './components/Character'
import ConfigPanel from './components/ConfigPanel'
import aiService from './services/ai'
import { loadCharacter, saveCharacter } from './services/secureStore'
import './index.css'

type CharacterType = 'anime' | 'wizard'
type CharacterState = 'idle' | 'talking' | 'thinking' | 'happy'

function App() {
  const [character, setCharacter] = useState<CharacterType>('wizard')
  const [charState, setCharState] = useState<CharacterState>('idle')
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [startupStatus, setStartupStatus] = useState<'checking' | 'ollama' | 'api' | 'none'>('checking')
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      await aiService.init()
      const savedChar = await loadCharacter()
      if (savedChar === 'anime' || savedChar === 'wizard') {
        setCharacter(savedChar)
      }
    }
    init()
  }, [])

  useEffect(() => {
    saveCharacter(character)
  }, [character])

  useEffect(() => {
    const checkAI = async () => {
      await aiService.init()
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
      const { getCurrentWindow } = await import('@tauri-apps/api/core')
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

  const handleCloseConfig = () => {
    setShowConfig(false)
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
          onClose={handleCloseConfig}
          onCloseApp={handleCloseApp}
          character={character}
          onCharacterChange={setCharacter}
          startupStatus={startupStatus}
        />
      )}

      {response !== '' && (
        <div className="speech-bubble" ref={bubbleRef}>
          <div className="speech-bubble__arrow" />
          {response}
        </div>
      )}

      <div onClick={handleClick} className="character-wrapper">
        <Character character={character} state={charState} />
      </div>

      {/* Input siempre visible cuando hay algo abierto o escribiendo */}
      {(isOpen || message.trim()) && (
        <div className="chat-row">
          <input
            className="chat-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí algo... (/bye para salir)"
            autoFocus
          />
          <button className="send-btn" onClick={handleSend}>→</button>
        </div>
      )}
    </div>
  )
}

export default App