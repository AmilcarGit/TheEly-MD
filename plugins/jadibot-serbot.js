cat > plugins/jadibot.js << 'EOFILE'
const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = await import("@whiskeysockets/baileys")
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import { exec } from "child_process"
import { CONNECTING } from "ws"
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"

const rtxQR = `
╔══〔 🌼 *THEELY-MD — VINCULACIÓN QR* 〕══╗
║
║ ✨ *Sigue estos pasos para conectarte:*
║
║ 1️⃣ Abre *WhatsApp* en tu celular 📱
║ 2️⃣ Toca ⋮ *Más opciones* → *Dispositivos vinculados* 🔗
║ 3️⃣ Selecciona *"Vincular un dispositivo"* 📲
║ 4️⃣ Escanea el código que aparece aquí 🌼
║
║ ⏳ *El código expira en 30 segundos*
║ 💫 *Powered by TheEly-MD*
╚══════════════════════════════════════════╝`.trim()

const rtxCode = `
╔══〔 🌼 *THEELY-MD — CÓDIGO DE EMPAREJAMIENTO* 〕══╗
║
║ ✨ *Sigue estos pasos para conectarte:*
║
║ 1️⃣ Abre *WhatsApp* en tu celular 📱
║ 2️⃣ Toca ⋮ *Más opciones* → *Dispositivos vinculados* 🔗
║ 3️⃣ Selecciona *"Vincular un dispositivo"* 📲
║ 4️⃣ Elige *"Con número de teléfono"* 🔢
║ 5️⃣ Ingresa el código de 8 dígitos abajo 👇
║
║ ⏳ *El código expira en 30 segundos*
║ 💫 *Powered by TheEly-MD*
║ 👑 *Creado por AmilcarGit*
╚══════════════════════════════════════════════════════╝`.trim()

const MAX_SUBBOTS = 15
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!global.conns) global.conns = []
if (!global.jadi) global.jadi = "./jadibot"

const tiempoTranscurrido = (ms) => {
  const segundos = Math.floor((ms / 1000) % 60)
  const minutos = Math.floor((ms / (1000 * 60)) % 60)
  const horas = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const activos = global.conns.filter(c => c.user && [CONNECTING, 1].includes(c.ws?.readyState))

  if (activos.length >= MAX_SUBBOTS) {
    return conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ❌ LÍMITE ALCANZADO
╚══════════════════════╝

💫 No hay espacios disponibles para nuevos Sub-Bots.
🔄 Inténtalo más tarde.`
    }, { quoted: m })
  }

  const idUsuario = (m.mentionedJid?.[0] || m.sender).split('@')[0]
  const rutaSesion = path.join(global.jadi, idUsuario)

  if (!fs.existsSync(rutaSesion)) fs.mkdirSync(rutaSesion, { recursive: true })

  await conn.sendMessage(m.chat, {
    text: `╔══〔 🌼 *THEELY-MD — SUB-BOT* 〕══╗
║ ⚙️ INICIANDO CONEXIÓN
╚══════════════════════════╝

💫 Preparando tu Sub-Bot...
⏳ Espera un momento por favor.`
  }, { quoted: m })

  yukiJadiBot({ rutaSesion, m, conn, args, usedPrefix, command })

  if (global.db?.data?.users?.[m.sender]) {
    global.db.data.users[m.sender].Subs = Date.now()
  }
}

async function yukiJadiBot({ rutaSesion, m, conn, args, usedPrefix, command }) {
  const usarCodigo = /--code|code/.test(args.join(' '))
  const rutaCreds = path.join(rutaSesion, "creds.json")

  if (args[0] && !usarCodigo) {
    try {
      const datos = JSON.parse(Buffer.from(args[0], "base64").toString("utf-8"))
      fs.writeFileSync(rutaCreds, JSON.stringify(datos, null, 2))
    } catch {
      return conn.sendMessage(m.chat, {
        text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ❌ CREDENCIALES INVÁLIDAS
╚══════════════════════╝

💡 Formato incorrecto.
✨ Usa: *${usedPrefix}qr* o *${usedPrefix}code*`
      }, { quoted: m })
    }
  }

  const comandoCarga = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64").toString("utf-8")
  exec(comandoCarga, async () => {
    const { version } = await fetchLatestBaileysVersion()
    const cache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(rutaSesion)

    const opcionesConexion = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      msgRetryCache: cache,
      browser: usarCodigo ? ["Linux", "Chrome", "126.0.0.0"] : ["TheEly-MD 🌼", "Web", "2.1.0"],
      version,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false
    }

    const sock = makeWASocket(opcionesConexion)
    sock.connectedAt = null

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr && !usarCodigo) {
        const imgQR = await qrcode.toBuffer(qr, { scale: 9, margin: 2 })
        const msgQR = await conn.sendMessage(m.chat, { image: imgQR, caption: rtxQR }, { quoted: m })
        setTimeout(() => conn.sendMessage(m.chat, { delete: msgQR.key }).catch(() => {}), 30000)
        return
      }

      if (qr && usarCodigo) {
        const codigo = await sock.requestPairingCode(m.sender.split('@')[0])
        const codigoFormateado = codigo.match(/.{1,4}/g).join(" - ")
        const msgInfo = await conn.sendMessage(m.chat, { text: rtxCode }, { quoted: m })
        const msgCodigo = await conn.sendMessage(m.chat, {
          text: `╔══〔 🔢 *CÓDIGO DE VINCULACIÓN* 〕══╗\n\n✨ *${codigoFormateado}*\n\n⏳ Expira en 30 segundos`
        }, { quoted: m })
        setTimeout(() => {
          conn.sendMessage(m.chat, { delete: msgInfo.key }).catch(() => {})
          conn.sendMessage(m.chat, { delete: msgCodigo.key }).catch(() => {})
        }, 30000)
        return
      }

      if (connection === "open") {
        const nombre = sock.authState.creds.me.name || "Sin nombre"
        const numero = sock.authState.creds.me.id.split('@')[0]
        sock.connectedAt = Date.now()

        global.conns = global.conns.filter(c => c.user?.jid !== sock.user.jid)
        global.conns.push(sock)

        console.log(chalk.cyanBright(`✅ Sub-Bot conectado: +${numero} | ${nombre}`))

        return conn.sendMessage(m.chat, {
          text: `╔══〔 🌼 *THEELY-MD — SUB-BOT ACTIVO* 〕══╗
║
║ ✅ *CONEXIÓN EXITOSA*
║
║ 👤 Nombre: ${nombre}
║ 📱 Número: +${numero}
║ ⏱️ Conectado: ${tiempoTranscurrido(0)}
║
╚══════════════════════════════════════════════╝`
        }, { quoted: m })
      }

      if (connection === "close") {
        const codigoError = lastDisconnect?.error?.output?.statusCode || 500
        const numero = path.basename(rutaSesion)

        if ([408, 428, 500, 515].includes(codigoError)) {
          console.log(chalk.yellow(`🔄 Reconectando Sub-Bot +${numero}...`))
          return setTimeout(() => yukiJadiBot({ rutaSesion, m, conn, args, usedPrefix, command }), 5000)
        }

        if ([401, 403, 405].includes(codigoError)) {
          console.log(chalk.red(`❌ Sub-Bot +${numero} desconectado permanentemente`))
          global.conns = global.conns.filter(c => c.user?.jid !== sock.user?.jid)
          try { fs.rmSync(rutaSesion, { recursive: true, force: true }) } catch {}
        }
      }
    })

    sock.ev.on("creds.update", saveCreds)

    const handlerNuevo = await import(`../handler.js?update=${Date.now()}`)
    sock.ev.on("messages.upsert", handlerNuevo.handler.bind(sock))
  })
}

handler.help     = ['qr', 'code']
handler.tags     = ['jadibot']
handler.command  = /^(qr|code|reconecsub)$/i
handler.group    = false
handler.admin    = false
handler.owner    = false
handler.desc     = 'crear tu Sub-Bot'

export default handler
