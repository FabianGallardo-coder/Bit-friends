import { useState, useEffect } from 'react'
import aiService from '../services/ai'
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

  useEffect(() => {
    if (visible) checkOllamaStatus()
  }, [visible])

  const checkOllamaStatus = async () => {
    setOllamaStatus('checking')
    setOllamaStatus(await aiService.checkOllamaHealth() ? 'active' : 'inactive')
  }

  const handleChange = (key: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    aiService.saveConfig(config)
    onClose()
    // Recargar la página para que tome los nuevos valores
    window.location.reload()
  }

  const getStatusMessage = () => {
    switch (ollamaStatus) {
      case 'active':
        return '🟢 Ollama activo y funcionando'
      case 'inactive':
        return '🔴 Ollama no encontrado'
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

        {/* Estado actual de la IA */}
        <div className="config-panel__status">
          {startupStatus === 'ollama' && '🤖 IA: Ollama local'}
          {startupStatus === 'api' && '☁️ IA: API en la nube'}
          {startupStatus === 'none' && '⚠️ Sin IA configurada'}
        </div>

        {/* Selector de personaje */}
        {onCharacterChange && (
          <div className="config-panel__field">
            <label>👤 Personaje:</label>
            <select 
              value={character} 
              onChange={e => onCharacterChange(e.target.value as CharacterType)}
            >
              <option value="wizard">🧙‍♂️ Merlin</option>
              <option value="anime">👩 Eve</option>
            </select>
          </div>
        )}

        <div className="config-panel__section">
          <div className="config-panel__section-title">🔮 Ollama (IA Local)</div>
          <div className="config-panel__status-small">{getStatusMessage()}</div>
          
          <div className="config-panel__field">
            <label>URL:</label>
            <input 
              type="text" 
              value={config.ollamaUrl} 
              onChange={e => handleChange('ollamaUrl', e.target.value)}
              placeholder="http://localhost:11434"
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

          <button 
            className="config-panel__test" 
            onClick={checkOllamaStatus}
            type="button"
          >
            🔄 Probar conexión
          </button>
        </div>

        <div className="config-panel__section">
          <div className="config-panel__section-title">☁️ API Cloud (Opcional)</div>
          
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
                  placeholder={config.cloudProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                />
              </div>

              <div className="config-panel__field">
                <label>Modelo:</label>
                <input 
                  type="text" 
                  value={config.cloudModel} 
                  onChange={e => handleChange('cloudModel', e.target.value)}
                  placeholder={config.cloudProvider === 'openai' ? 'gpt-4o-mini' : 'claude-3-haiku-20240307'}
                />
              </div>
            </>
          )}
        </div>

        <div className="config-panel__help">
          💡 <b>Recomendación:</b> Instalá Ollama desde <a href="https://ollama.com" target="_blank" rel="noopener">ollama.com</a> para IA local gratuita.
        </div>

        <button className="config-panel__save" onClick={handleSave}>💾 Guardar y reiniciar</button>
        
        {onCloseApp && (
          <button className="config-panel__close-app" onClick={onCloseApp}>
            ❌ Cerrar Bit
          </button>
        )}
      </div>
    </div>
  )
}

export default ConfigPanel