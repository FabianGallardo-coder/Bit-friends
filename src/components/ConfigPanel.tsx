import { useState, useEffect } from 'react'
import aiService from '../services/ai'
import { saveCharacter } from '../services/secureStore'
import '../index.css'

const OLLAMA_MODELS = ['llama3.2', 'mistral', 'phi3', 'codellama', 'llama3']
const CLOUD_PROVIDERS = [
  { value: 'none', label: 'Ninguno' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude (Anthropic)' },
]

type CharacterType = 'anime' | 'wizard'

interface ConfigPanelProps {
  visible: boolean
  onClose: () => void
  onCloseApp?: () => void
  character?: CharacterType
  onCharacterChange?: (char: CharacterType) => void
  startupStatus?: 'checking' | 'ollama' | 'api' | 'none'
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  visible, 
  onClose, 
  onCloseApp,
  character = 'wizard',
  onCharacterChange,
  startupStatus = 'none'
}) => {
  const [config, setConfig] = useState(aiService.getConfig())
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'active' | 'inactive'>('checking')
  const [saving, setSaving] = useState(false)
  const [selectedChar, setSelectedChar] = useState<CharacterType>(character)

  useEffect(() => {
    if (visible) {
      setConfig(aiService.getConfig())
      setSelectedChar(character)
      checkOllamaStatus()
    }
  }, [visible, character])

  const checkOllamaStatus = async () => {
    setOllamaStatus('checking')
    setOllamaStatus(await aiService.checkOllamaHealth() ? 'active' : 'inactive')
  }

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleCharacterSelect = async (char: CharacterType) => {
    setSelectedChar(char)
    await saveCharacter(char)
    onCharacterChange?.(char)
  }

  const handleSave = async () => {
    setSaving(true)
    await aiService.saveConfig(config)
    setSaving(false)
    onClose()
    window.location.reload()
  }

  const getStatusMessage = () => {
    switch (ollamaStatus) {
      case 'active':
        return '🟢 Ollama activo'
      case 'inactive':
        return '🔴 Ollama no disponible'
      case 'checking':
        return '🟡 Verificando...'
    }
  }

  if (!visible) return null

  return (
    <div className="config-panel-overlay" onClick={onClose}>
      <div className="config-panel" onClick={e => e.stopPropagation()}>
        <div className="config-panel__header">
          <h3>⚙️ Bit - Configuración</h3>
          <button className="config-panel__close" onClick={onClose}>×</button>
        </div>

        <div className="config-panel__status">
          {startupStatus === 'ollama' && '🤖 Ollama local'}
          {startupStatus === 'api' && '☁️ API cloud'}
          {startupStatus === 'none' && '⚠️ Sin IA'}
        </div>

        <div className="config-panel__field">
          <label>👤 Personaje:</label>
          <select 
            value={selectedChar}
            onChange={e => handleCharacterSelect(e.target.value as CharacterType)}
          >
            <option value="wizard">🧙‍♂️ Merlin</option>
            <option value="anime">👩 Eve</option>
          </select>
        </div>

        <div className="config-panel__section">
          <div className="config-panel__section-title">🔮 Ollama</div>
          <div className="config-panel__status-small">{getStatusMessage()}</div>
          
          <div className="config-panel__field">
            <label>URL:</label>
            <input 
              type="text" 
              value={config.ollamaUrl} 
              onChange={e => handleChange('ollamaUrl', e.target.value)}
            />
          </div>

          <div className="config-panel__field">
            <label>Modelo:</label>
            <select 
              value={config.ollamaModel} 
              onChange={e => handleChange('ollamaModel', e.target.value)}
            >
              {OLLAMA_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <button className="config-panel__test" onClick={checkOllamaStatus}>
            🔄 Probar
          </button>
        </div>

        <div className="config-panel__section">
          <div className="config-panel__section-title">☁️ API Cloud</div>
          
          <div className="config-panel__field">
            <label>Proveedor:</label>
            <select 
              value={config.cloudProvider} 
              onChange={e => handleChange('cloudProvider', e.target.value)}
            >
              {CLOUD_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {config.cloudProvider !== 'none' && (
            <>
              <div className="config-panel__field">
                <label>API Key:</label>
                <input 
                  type="password" 
                  value={config.cloudApiKey} 
                  onChange={e => handleChange('cloudApiKey', e.target.value)}
                />
              </div>

              <div className="config-panel__field">
                <label>Modelo:</label>
                <input 
                  type="text" 
                  value={config.cloudModel} 
                  onChange={e => handleChange('cloudModel', e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <button className="config-panel__save" onClick={handleSave}>
          {saving ? 'Guardando...' : '💾 Guardar'}
        </button>

        <button className="config-panel__close-app" onClick={onCloseApp}>
          ❌ Cerrar Bit
        </button>
      </div>
    </div>
  )
}

export default ConfigPanel