# 🚀 GUÍA RÁPIDA PARA DESARROLLADORES
## Bit Friends - Desktop Pet con IA

---

## ⚡ QUICK START

```bash
# Clonar
git clone https://github.com/FabianGallardo-coder/Bit-friends
cd Bit-friends

# Instalar dependencias
npm install

# Desarrollo
npm run tauri dev

# Build producción
npm run tauri build
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Bit-friends/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── Character.tsx         # Personajes animados (Merlin/Eve)
│   │   ├── ConfigPanel.tsx       # Panel de configuración
│   │   └── SpeechBubble.tsx      # Globo de diálogo
│   ├── services/
│   │   ├── ai.ts                 # Cliente IA híbrido
│   │   └── secureStore.ts        # Almacenamiento cifrado
│   ├── App.tsx                   # Componente principal
│   ├── index.css                 # Estilos globales
│   └── main.tsx                  # Entry point
├── src-tauri/                    # Backend Rust
│   ├── src/
│   │   ├── lib.rs                # Comandos Tauri
│   │   └── main.rs               # Entry point Rust
│   └── Cargo.toml                # Dependencias Rust
└── package.json                  # Dependencias npm
```

---

## 🎮 CÓMO USAR LA APP

| Acción | Resultado |
|--------|-----------|
| Click izquierdo en personaje | Abre/cierra chat |
| Click derecho | Abre panel de configuración |
| Arrastrar personaje | Mueve la ventana |
| Escribir + Enter | Envia mensaje a IA |
| Escribir `/bye` + Enter | Cierra la app |
| Cambiar personaje en config | Persiste automáticamente |

---

## 🔧 CONFIGURAR IA

### Opción 1: Ollama (Local, gratis)
1. Instalar desde https://ollama.com
2. Ejecutar `ollama pull llama3.2`
3. Ejecutar `ollama serve`
4. La app detecta automáticamente

### Opción 2: API Cloud ( pago)
1. Click derecho → Configuración
2. Seleccionar OpenAI o Claude
3. Ingresar API Key
4. Guardar

---

## 🐛 CÓMO REPORTAR BUGS

1. Verificar si es bug conocido (QA-REPORT.md)
2. Crear issue en GitHub con:
   - Pasos para reproducir
   - Comportamiento esperado
   - Comportamiento real
   - Screenshots si aplica

---

## 🔄 WORKFLOW DE DESARROLLO

```bash
# 1. Actualizar código
npm run build          # Verificar frontend
cargo check           # Verificar Rust
cargo test            # Ejecutar tests

# 2. Commit (usar conventional commits)
git add .
git commit -m "feat: nueva funcionalidad"
git push

# 3. El CI/CD corre automáticamente
# - Lint en Node.js
# - Tests en Rust
# - Build para Linux/Windows
```

---

## 📝 VARIABLES DE ENTORNO

No se requieren variables de entorno. La config se guarda en:
- Linux: `~/.config/com.fabian.bit-friends/`
- Windows: `%APPDATA%\com.fabian.bit-friends\`

---

## 🎯 FUNCIONALIDADES PRIORITARIAS PENDIENTES

1. Tests unitarios (coverage >60%)
2. Notificaciones del sistema
3. Iconos personalizados
4. Instaladores para distribución

---

## 📞 SOPORTE

- Issues: https://github.com/FabianGallador-coder/Bit-friends/issues
- Docs: Ver QA-REPORT.md para análisis completo

---

**Última actualización:** Mayo 2026  
**Versión:** 1.0.0