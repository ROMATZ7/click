import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4'

const config = {
  theme: 'dark',
  muted: false,
  exploded: false,
  platform: 'macos',
  one: {
    travel: 26,
    text: 'ok',
    keys: ['Meta', '1'],
    hue: 114,
    saturation: 1.4,
    brightness: 1.2,
    buttonElement: document.querySelector('#one'),
    textElement: document.querySelector('#one .key__text'),
  },
  two: {
    travel: 26,
    text: 'Tab',
    keys: ['Tab', '2'],
    hue: 0,
    saturation: 0,
    brightness: 1.4,
    buttonElement: document.querySelector('#two'),
    textElement: document.querySelector('#two .key__text'),
  },
  three: {
    travel: 18,
    text: 'create.',
    keys: ['c', '3'],
    hue: 0,
    saturation: 0,
    brightness: 0.4,
    buttonElement: document.querySelector('#three'),
    textElement: document.querySelector('#three .key__text'),
  },
  four: {
    travel: 18,
    text: 'create.',
    keys: ['v', '4'],
    hue: 0,
    saturation: 0,
    brightness: 0.4,
    buttonElement: document.querySelector('#four'),
    textElement: document.querySelector('#four .key__text'),
  },
  five: {
    travel: 18,
    text: 'create.',
    keys: ['Escape', '5'],
    hue: 0,
    saturation: 0,
    brightness: 0.4,
    buttonElement: document.querySelector('#five'),
    textElement: document.querySelector('#five .key__text'),
  },
}

const clickAudio = new Audio(
  'https://cdn.freesound.org/previews/378/378085_6260145-lq.mp3'
)
clickAudio.muted = config.muted
clickAudio.volume = 0.6
clickAudio.playbackRate = 0.9

document.addEventListener('DOMContentLoaded', () => clickAudio.load())

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.platform = config.platform
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'platform', {
  options: {
    macos: 'macos',
    gemini: 'gemini',
    claude: 'claude',
    perplexity: 'perplexity',
  },
})

ctrl
  .addBinding(config, 'muted')
  .on('change', () => (clickAudio.muted = config.muted))

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})

const ids = ['one', 'two', 'three', 'four', 'five']

for (const id of ids) {
  const btn = config[id].buttonElement

  btn.style.setProperty('--travel', config[id].travel)
  btn.style.setProperty('--saturate', config[id].saturation)
  btn.style.setProperty('--hue', config[id].hue)
  btn.style.setProperty('--brightness', config[id].brightness)

  btn.addEventListener('pointerdown', () => {
    btn.dataset.pressed = true
    playClick()
    addToSequence(id)
    changeBackgroundRandomColor()
  })

  btn.addEventListener('pointerup', () => {
    btn.dataset.pressed = false
  })
  btn.addEventListener('pointerleave', () => {
    btn.dataset.pressed = false
  })
}

function playClick() {
  if (config.muted) return
  try {
    clickAudio.pause()
    clickAudio.currentTime = 0
    clickAudio.play().catch(() => {})
  } catch (e) {
    console.warn('Error reproduciendo sonido:', e)
  }
}

/* === NUEVO: lógica de conteo "en su lugar" === */
const secretSequence = ['three', 'two', 'three', 'four', 'four', 'two', 'one', 'five']
let currentSequence = []

const banner = document.querySelector('.message-banner')

function updateBanner(text, type = 'info') {
  if (!banner) return
  banner.textContent = text
  banner.dataset.type = type
  banner.style.opacity = '1'
}

function countInPlace(seq, secret) {
  let count = 0
  const max = Math.min(seq.length, secret.length)
  for (let i = 0; i < max; i++) {
    if (seq[i] === secret[i]) count++
  }
  return count
}

function addToSequence(id) {
  currentSequence.push(id)

  // Ventana deslizante del tamaño del secreto
  if (currentSequence.length > secretSequence.length) {
    currentSequence.shift()
  }

  // Mostrar progreso en tiempo real (cuántas están en su lugar)
  const inPlace = countInPlace(currentSequence, secretSequence)
  updateBanner(
    `En su lugar: ${inPlace} / ${currentSequence.length} (objetivo: ${secretSequence.length})`,
    inPlace === secretSequence.length && currentSequence.length === secretSequence.length ? 'success' : 'info'
  )

  // Cuando la longitud coincide con el secreto, validamos
  if (currentSequence.length === secretSequence.length) {
    if (inPlace === secretSequence.length) {
      showSecretMessage()
      updateBanner('¡Todas en su lugar! 🔓', 'success')
      currentSequence = []
    } else {
      updateBanner(`Coincidencias exactas: ${inPlace} / ${secretSequence.length}. Sigue probando…`, 'warn')
    }
  }
}
/* === FIN NUEVO === */

function showSecretMessage() {
  const msg = document.createElement('div')
  msg.innerText = '¡Secuencia secreta activada, la palabra es TE! 🚀'
  msg.style.position = 'fixed'
  msg.style.top = '50%'
  msg.style.left = '50%'
  msg.style.transform = 'translate(-50%, -50%)'
  msg.style.background = 'black'
  msg.style.color = 'white'
  msg.style.padding = '1rem 2rem'
  msg.style.borderRadius = '12px'
  msg.style.zIndex = '9999'
  msg.style.fontSize = '1.5rem'
  msg.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)'
  msg.style.transition = 'opacity 0.4s ease'
  msg.style.opacity = '1'
  document.body.appendChild(msg)

  setTimeout(() => {
    msg.style.opacity = '0'
    setTimeout(() => msg.remove(), 400)
  }, 3000)
}

function changeBackgroundRandomColor() {
  const hue = Math.floor(Math.random() * 360)
  const saturation = Math.floor(Math.random() * 60) + 40
  const lightness = Math.floor(Math.random() * 30) + 50
  document.body.style.transition = 'background 0.5s ease'
  document.body.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Teclado físico
window.addEventListener('keydown', (event) => {
  for (const id of ids) {
    const keys = config[id].keys.map(k => k.toLowerCase())
    if (keys.includes(event.key.toLowerCase())) {
      const btn = config[id].buttonElement
      btn.dataset.pressed = true
      playClick()
      addToSequence(id)
      changeBackgroundRandomColor()
    }
  }
})

window.addEventListener('keyup', (event) => {
  for (const id of ids) {
    if (config[id].keys.includes(event.key) || event.key === 'Meta') {
      config[id].buttonElement.dataset.pressed = false
    }
  }
})

ctrl.on('change', sync)
update()

// Desbloqueo móvil
function unlockAudio() {
  clickAudio.play().then(() => clickAudio.pause()).catch(() => {})
  document.removeEventListener('pointerdown', unlockAudio)
}
document.addEventListener('pointerdown', unlockAudio)