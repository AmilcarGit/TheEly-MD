import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require   = createRequire(__dirname)

// ══════════════════════════════════════════
// BANNER PRINCIPAL
// ══════════════════════════════════════════
const { say } = cfonts

function imprimirBanner() {
  console.clear()

  say('TheEly MD', {
    font: 'block',
    align: 'center',
    gradient: ['yellow', 'cyan'],
    space: false
  })

  say('Asistente Virtual', {
    font: 'console',
    align: 'center',
    gradient: ['#ffcc00', 'yellow']
  })

  const linea = '═'.repeat(46)

  console.log(chalk.yellow(` ╔${linea}╗`))
  console.log(chalk.yellow(' ║') + chalk.bold.white('             🌼  T H E E L Y - M D'.padEnd(46)) + chalk.yellow('║'))
  console.log(chalk.yellow(' ║') + chalk.gray('         Sistema de gestión y arranque'.padEnd(46)) + chalk.yellow('║'))
  console.log(chalk.yellow(` ╚${linea}╝`))
  console.log()
  console.log(chalk.gray('   Desarrollado con dedicación por ') + chalk.bold.cyan('AmilcarGit'))
  console.log()
}

imprimirBanner()

// ══════════════════════════════════════════
// LANZADOR
// ══════════════════════════════════════════
let isWorking    = false
let restartCount = 0

function logEstado(emoji, mensaje, color = 'white') {
  console.log(chalk[color](`  ${emoji}  ${mensaje}`))
}

async function launch(scripts) {
  if (isWorking) return
  isWorking = true
  restartCount++

  for (const script of scripts) {
    const args = [join(__dirname, script), ...process.argv.slice(2)]

    console.log(chalk.gray('  ╔══════════════════════════════════════'))
    logEstado('🚀', `Iniciando proceso  ·  intento #${restartCount}`, 'yellow')
    logEstado('⏳', 'Cargando módulos y conexiones...', 'cyan')
    console.log(chalk.gray('  ╚══════════════════════════════════════\n'))

    setupMaster({
      exec: args[0],
      args: args.slice(1),
    })

    const child = fork()

    child.on('exit', (code) => {
      console.log()
      if (code === 0) {
        logEstado('✅', 'Proceso finalizado correctamente', 'green')
        return
      }

      logEstado('⚠️', `Proceso interrumpido  ·  código ${code}`, 'red')
      isWorking = false
      logEstado('🔄', 'Reiniciando en unos segundos...\n', 'yellow')

      setTimeout(() => launch(scripts), 3000)

      watchFile(args[0], () => {
        unwatchFile(args[0])
        logEstado('📝', 'Cambios detectados en main.js  ·  reiniciando', 'cyan')
        launch(scripts)
      })
    })

    child.on('message', (msg) => {
      if (msg === 'ready') {
        console.log()
        logEstado('🌼', 'TheEly MD está en línea y operativa', 'green')
        console.log()
      }
      if (msg === 'reset') {
        logEstado('🔄', 'Solicitud de reinicio recibida', 'yellow')
        child.kill()
      }
    })
  }
}

// ══════════════════════════════════════════
// INICIO
// ══════════════════════════════════════════
launch(['main.js'])

// ══════════════════════════════════════════
// ERRORES GLOBALES
// ══════════════════════════════════════════
const IGNORAR = ['rate-overlimit', 'timed out', 'Connection Closed']

process.on('uncaughtException', (err) => {
  const msg = err?.message || ''
  if (IGNORAR.some(i => msg.includes(i))) return
  console.log()
  logEstado('💥', 'Excepción no controlada', 'red')
  console.error(chalk.gray('     ' + msg.slice(0, 150)))
})

process.on('unhandledRejection', (reason) => {
  const msg = String(reason?.message || reason || '')
  if (IGNORAR.some(i => msg.includes(i))) return
  console.log()
  logEstado('⚡', 'Promesa rechazada sin manejar', 'red')
  console.error(chalk.gray('     ' + msg.slice(0, 150)))
})
