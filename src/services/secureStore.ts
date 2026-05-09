// Almacenamiento seguro usando tauri-plugin-store
// Reemplaza localStorage para datos sensibles (API keys, config)

interface AIConfig {
  ollamaUrl: string
  ollamaModel: string
  cloudProvider: 'claude' | 'openai' | 'none'
  cloudApiKey: string
  cloudModel: string
}

let store: any = null

async function getStore() {
  if (!store) {
    const { Store } = await import('@tauri-apps/plugin-store')
    store = await Store.load('settings.json', { autoSave: true })
  }
  return store
}

export async function loadConfig(): Promise<AIConfig> {
  try {
    const s = await getStore()
    const config = await s.get<AIConfig>('ai-config')
    if (config) return config
  } catch (e) {
    console.warn('Store not available, falling back to localStorage', e)
  }
  // Fallback a localStorage
  const saved = localStorage.getItem('bit-ai-config')
  if (saved) return JSON.parse(saved)
  return {
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2',
    cloudProvider: 'none',
    cloudApiKey: '',
    cloudModel: '',
  }
}

export async function saveConfig(config: AIConfig): Promise<void> {
  try {
    const s = await getStore()
    await s.set('ai-config', config)
    await s.save()
    return
  } catch (e) {
    console.warn('Store not available, falling back to localStorage', e)
  }
  localStorage.setItem('bit-ai-config', JSON.stringify(config))
}

export async function clearConfig(): Promise<void> {
  try {
    const s = await getStore()
    await s.delete('ai-config')
    await s.save()
    return
  } catch (e) {
    console.warn('Store not available', e)
  }
  localStorage.removeItem('bit-ai-config')
}

export async function loadCharacter(): Promise<string | null> {
  try {
    const s = await getStore()
    const char = await s.get<string>('selected-character')
    if (char) return char
  } catch (e) {
    console.warn('Store not available', e)
  }
  return localStorage.getItem('selected-character')
}

export async function saveCharacter(character: string): Promise<void> {
  try {
    const s = await getStore()
    await s.set('selected-character', character)
    await s.save()
    return
  } catch (e) {
    console.warn('Store not available', e)
  }
  localStorage.setItem('selected-character', character)
}
