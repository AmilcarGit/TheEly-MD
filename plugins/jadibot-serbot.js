const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

let rtx = `
╔══〔 🌼 *THEELY-MD — VINCULACIÓN QR* 〕══╗

✨ *Sigue estos pasos para conectarte:*

1️⃣ Abre *WhatsApp* en tu teléfono 📱
2️⃣ Pulsa ⋮ *Más opciones* → *Dispositivos vinculados* 🔗
3️⃣ Presiona *"Vincular un dispositivo"* 📲
4️⃣ Escanea el código QR que aparece aquí 🌼

╔══════════════════════════════════╗
  ⏳ *El código expira en 30 segundos*
  💫 *Powered by TheEly-MD 🌼*
╚══════════════════════════════════╝`.trim()

let rtx2 = `
╔══〔 🌼 *THEELY-MD — CÓDIGO DE EMPAREJAMIENTO* 〕══╗

✨ *Sigue estos pasos para conectarte:*

1️⃣ Abre *WhatsApp* en tu teléfono 📱
2️⃣ Pulsa ⋮ *Más opciones* → *Dispositivos vinculados* 🔗
3️⃣ Presiona *"Vincular un dispositivo"* 📲
4️⃣ Selecciona *"Con número de teléfono"* 🔢
5️⃣ Ingresa el código de 8 dígitos mostrado abajo 👇

╔══════════════════════════════════╗
  ⏳ *El código expira en 30 segundos*
  💫 *Powered by TheEly-MD 🌼*
  👑 *Mi creador AmilcarGit*
╚══════════════════════════════════╝`.trim()

const MAX_SUBBOTS = 15

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const yukiJBOptions = {}

if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  const subBots = [...new Set([
    ...global.conns
      .filter(c => c.user && c.ws?.socket?.readyState !== ws.CLOSED)
      .map(c => c)
  ])]

  if (subBots.length >= MAX_SUBBOTS) {
    return m.reply(`╔══〔 🌼 *THEELY-MD* 〕══╗\n║\n║ ❌ No hay espacios disponibles\n║ para Sub-Bots.\n║\n║ 💡 Intenta más tarde~\n║\n╚══════════════════════╝`)
  }

  let who = m.mentionedJid?.[0] ?? (m.fromMe ? conn.user.jid : m.sender)
  let id = who.split('@')[0]
  let pathYukiJadiBot = path.join(`./${jadi}/`, id)

  if (!fs.existsSync(pathYukiJadiBot)) {
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  }

  await m.reply(`╔══〔 🌼 *THEELY-MD — Sub-Bot* 〕══╗\n║\n║ ⚙️ Iniciando tu Sub-Bot...\n║ ✨ Por favor espera un momento\n║\n╚══════════════════════════════╝`)

  Object.assign(yukiJBOptions, {
    pathYukiJadiBot,
    m, conn, args,
    usedPrefix, command,
    fromCommand: true
  })

  yukiJadiBot(yukiJBOptions)
  global.db.data.users[m.sender].Subs = Date.now()
}

handler.help = ['qr', 'code']
handler.tags = ['jadibot']
handler.command = ['qr', 'code']
handler.desc = 'Crear tu propio Sub-Bot y reconecta'
export default handler

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options

  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }

  const mcode = args[0] && /(--code|code)/.test(args[0].trim())
    || args[1] && /(--code|code)/.test(args[1].trim())

  let txtCode, codeBot, txtQR

  if (mcode) {
    args[0] = args[0].replace(/^--code$|^code$/, '').trim() || undefined
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, '').trim()
  }

  const pathCreds = path.join(pathYukiJadiBot, 'creds.json')

  if (!fs.existsSync(pathYukiJadiBot)) {
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  }

  try {
    if (args[0]) {
      const parsed = JSON.parse(Buffer.from(args[0], 'base64').toString('utf-8'))
      fs.writeFileSync(pathCreds, JSON.stringify(parsed, null, '\t'))
    }
  } catch {
    conn.reply(m.chat,
      `╔══〔 🌼 *THEELY-MD* 〕══╗\n║\n║ ❌ Credenciales inválidas.\n║ 💡 Uso correcto:\n║ *${usedPrefix + command} code*\n║\n╚══════════════════════╝`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, 'base64')

  exec(comb.toString('utf-8'), async (err, stdout, stderr) => {
    let { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

    const connectionOptions = {
      logger: pino({ level: 'fatal' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetryCache,
      browser: mcode
        ? ['Ubuntu', 'Chrome', '110.0.5585.95']
        : ['TheEly-MD 🌼', 'Chrome', '2.0.0'],
      version,
      generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      if (qr && !mcode) {
        if (!m?.chat) return
        txtQR = await conn.sendMessage(m.chat, {
          image: await qrcode.toBuffer(qr, { scale: 8 }),
          caption: rtx
        }, { quoted: m })

        if (txtQR?.key) {
          setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
        }
        return
      }

      if (qr && mcode) {
        let secret = await sock.requestPairingCode(m.sender.split('@')[0])
        secret = secret.match(/.{1,4}/g)?.join('-')

        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await m.reply(`\n *${secret}*\n\n`)

        if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
        if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
      }

      const reason = lastDisconnect?.error?.output?.statusCode
        || lastDisconnect?.error?.output?.payload?.statusCode

      const logMsg = (msg) => console.log(chalk.bold.yellowBright(
        `\n╔══〔 🌼 THEELY-MD 〕══╗\n║ ${msg}\n╚══════════════════════╝`
      ))

      const numId = path.basename(pathYukiJadiBot)

      if (connection === 'close') {
        const reconectar = [408, 428, 500, 515]
        const cerrar = [401, 403, 405]

        if (reconectar.includes(reason)) {
          logMsg(`🔄 Reconectando Sub-Bot (+${numId})... Razón: ${reason}`)
          await creloadHandler(true).catch(console.error)
        }

        if (reason === 440) {
          logMsg(`⚠️ Sesión reemplazada (+${numId}). Otra sesión activa detectada.`)
        }

        if (cerrar.includes(reason)) {
          logMsg(`🔴 Sesión cerrada (+${numId}). Credenciales inválidas o desconexión manual.`)
          try { fs.rmdirSync(pathYukiJadiBot, { recursive: true }) } catch {}
        }

        sock.connectedAt = null
      }

      if (connection === 'open') {
        if (!global.db.data?.users) loadDatabase()

        const userName = sock.authState.creds.me?.name || 'Anónimo'
        const numBot = path.basename(pathYukiJadiBot)

        sock.connectedAt = Date.now()

        console.log(chalk.bold.yellowBright(
          `\n╔══〔 🌼 SUB-BOT CONECTADO 〕══╗\n║\n║  ✅ ${userName} (+${numBot})\n║  🌼 Sub-Bot activo y listo~\n║\n╚══════════════════════════════╝`
        ))

        sock.isInit = true

        global.conns = global.conns.filter(c => c.user?.jid !== sock.user?.jid)
        global.conns.push(sock)

        await joinChannels(sock)

        await conn.sendMessage(m.chat, {
          text: `╔══〔 🌼 *THEELY-MD — Sub-Bot* 〕══╗\n║\n║ ✅ *¡Sub-Bot conectado!*\n║\n║ 👤 Nombre: *${userName}*\n║ 📱 Número: *+${numBot}*\n║ 🌼 ¡Ya puedes usarlo~!\n║\n╚══════════════════════════════╝`
        }, { quoted: m })
      }

      if (global.db.data == null) loadDatabase()
    }

    setInterval(() => {
      if (!sock.user) {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        const i = global.conns.indexOf(sock)
        if (i < 0) return
        global.conns.splice(i, 1)
      }
    }, 60000)

    let handler = await import('../handler.js')

    let creloadHandler = async (restatConn) => {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('❌ Error en reload:', e)
      }

      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }

      if (!isInit) {
        sock.ev.off('messages.upsert', sock.handler)
        sock.ev.off('connection.update', sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)

      sock.ev.on('messages.upsert', sock.handler)
      sock.ev.on('connection.update', sock.connectionUpdate)
      sock.ev.on('creds.update', sock.credsUpdate)

      isInit = false
      return true
    }

    creloadHandler(false)
  })
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch)) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}
