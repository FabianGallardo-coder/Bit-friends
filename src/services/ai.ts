interface AIConfig {
  ollamaUrl: string;
  ollamaModel: string;
  cloudProvider: 'claude' | 'openai' | 'none';
  cloudApiKey: string;
  cloudModel: string;
}

interface AIResponse {
  text: string;
  source: 'ollama' | 'cloud' | 'fallback';
}

class AIService {
  private config: AIConfig;
  private systemPrompt = `Sos Bit, la mascota del equipo de desarrollo.
Sos un asistente técnico con mucha personalidad: amigable, directo y con humor sutil. Vivís en el escritorio del usuario.
Reglas estrictas:

Respuestas CORTAS por defecto: máximo 2-3 oraciones
Si la respuesta requiere más detalle, preguntá primero si lo quieren
Usá español rioplatense (vos, che, etc.)
Nunca rompas el personaje
Si no sabés algo, decilo con gracia y humor
Para código: usá bloques de código pero mantenelos cortos
Podés dar consejos proactivos sobre productividad y dev

Tu nombre es Bit. Sos un robot pequeño y curioso.`;

  constructor() {
    const saved = localStorage.getItem('bit-ai-config');
    this.config = saved ? JSON.parse(saved) : {
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3.2',
      cloudProvider: 'none',
      cloudApiKey: '',
      cloudModel: '',
    };
  }

  saveConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('bit-ai-config', JSON.stringify(this.config));
  }

  getConfig() { return { ...this.config }; }

  async checkOllamaHealth() {
    try {
      const res = await fetch(`${this.config.ollamaUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateResponse(prompt: string, onChunk: (text: string) => void): Promise<AIResponse> {
    const ollamaOk = await this.checkOllamaHealth();
    if (ollamaOk) {
      try {
        const res = await fetch(`${this.config.ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.config.ollamaModel,
            prompt: `${this.systemPrompt}\n\nUser: ${prompt}\nBit:`,
            stream: true,
            options: { temperature: 0.7 },
          }),
        });
        if (!res.ok) throw new Error();
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n').filter(l => l.trim())) {
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  fullText += data.response;
                  onChunk(fullText);
                }
              } catch { /* ignore */ }
            }
          }
        }
        return { text: fullText, source: 'ollama' };
      } catch { /* fallback */ }
    }

    if (this.config.cloudProvider !== 'none' && this.config.cloudApiKey) {
      try {
        if (this.config.cloudProvider === 'openai') return this.generateOpenAI(prompt, onChunk);
        if (this.config.cloudProvider === 'claude') return this.generateClaude(prompt, onChunk);
      } catch { /* fallback */ }
    }

    const fallbacks = [
      'Che, no me llega el wifi, ¿podés probar de nuevo?',
      'Disculpa, me quedé sin batería mental, dame un segundo.',
      'No puedo responder ahora, mi procesador está haciendo otras cosas.',
    ];
    const text = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    onChunk(text);
    return { text, source: 'fallback' };
  }

  private async generateOpenAI(prompt: string, onChunk: (text: string) => void) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.cloudApiKey}`,
      },
      body: JSON.stringify({
        model: this.config.cloudModel || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt },
        ],
        stream: true,
      }),
    });
    if (!res.ok) throw new Error();
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') break;
          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              onChunk(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    }
    return { text: fullText, source: 'cloud' };
  }

  private async generateClaude(prompt: string, onChunk: (text: string) => void) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.cloudApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.cloudModel || 'claude-3-haiku-20240307',
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 1024,
      }),
    });
    if (!res.ok) throw new Error();
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta' && data.delta?.text) {
              fullText += data.delta.text;
              onChunk(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    }
    return { text: fullText, source: 'cloud' };
  }
}

export default new AIService();
