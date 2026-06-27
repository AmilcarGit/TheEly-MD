import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import * as ws from 'ws'
import { applyExp } from './lib/levelling.js'

// ══════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════
const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function() {
  clearTimeout(this)
  resolve()
}, ms))

const getRandom = list => list[Math.floor(Math.random() * list.length)]
const pickRandom = list => list[Math.floor(Math.random() * list.length)]

// ══════════════════════════════════════════
// CACHÉ ANTI RATE-OVERLIMIT (429)
// ══════════════════════════════════════════
const groupMetadataCache = new Map()
const lidCache           = new Map()
const GROUP_CACHE_TTL    = 60 * 1000
const LID_CACHE_TTL      = 5 * 60 * 1000

async function getGroupMetadataCached(conn, jid) {
  const cached = groupMetadataCache.get(jid)
  if (cached && (Date.now() - cached.time) < GROUP_CACHE_TTL) {
    return cached.data
  }
  try {
    const data = await conn.groupMetadata(jid)
    groupMetadataCache.set(jid, { data, time: Date.now() })
    return data
  } catch (e) {
    if (cached) return cached.data
    return null
  }
}

async function getLidFromJidCached(id, conn) {
  if (id.endsWith('@lid')) return id
  const cached = lidCache.get(id)
  if (cached && (Date.now() - cached.time) < LID_CACHE_TTL) {
    return cached.lid
  }
  try {
    const res = await conn.onWhatsApp(id).catch(() => [])
    const lid = res[0]?.lid || id
    lidCache.set(id, { lid, time: Date.now() })
    return lid
  } catch {
    return id
  }
}

// ══════════════════════════════════════════
// HANDLER PRINCIPAL
// ══════════════════════════════════════════
export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime    = this.uptime    || Date.now()

  if (!chatUpdate) return

  this.pushMessage(chatUpdate.messages).catch(console.error)

  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return

    m.exp  = 0
    m.coin = false

    // ══════════════════════════════════════════
    // INICIALIZAR USUARIO
    // ══════════════════════════════════════════
    try {
      let user = global.db.data.users[m.sender]

      if (typeof user !== 'object') {
        global.db.data.users[m.sender] = {}
        user = global.db.data.users[m.sender]
      }

      if (user) {
        if (!isNumber(user.exp))           user.exp           = 0
        if (!isNumber(user.coin))          user.coin          = 10
        if (!isNumber(user.joincount))     user.joincount     = 1
        if (!isNumber(user.diamond))       user.diamond       = 3
        if (!isNumber(user.lastadventure)) user.lastadventure = 0
        if (!isNumber(user.lastclaim))     user.lastclaim     = 0
        if (!isNumber(user.health))        user.health        = 100
        if (!isNumber(user.crime))         user.crime         = 0
        if (!isNumber(user.lastcofre))     user.lastcofre     = 0
        if (!isNumber(user.lastdiamantes)) user.lastdiamantes = 0
        if (!isNumber(user.lastpago))      user.lastpago      = 0
        if (!isNumber(user.lastcode))      user.lastcode      = 0
        if (!isNumber(user.lastcodereg))   user.lastcodereg   = 0
        if (!isNumber(user.lastduel))      user.lastduel      = 0
        if (!isNumber(user.lastmining))    user.lastmining    = 0
        if (!isNumber(user.bank))          user.bank          = 0
        if (!isNumber(user.level))         user.level         = 0
        if (!isNumber(user.warn))          user.warn          = 0
        if (!isNumber(user.afk))           user.afk           = -1
        if (!('muto'         in user))  user.muto         = false
        if (!('premium'      in user))  user.premium      = false
        if (!('registered'   in user))  user.registered   = false
        if (!('genre'        in user))  user.genre        = ''
        if (!('birth'        in user))  user.birth        = ''
        if (!('marry'        in user))  user.marry        = ''
        if (!('description'  in user))  user.description  = ''
        if (!('packstickers' in user))  user.packstickers = null
        if (!('afkReason'    in user))  user.afkReason    = ''
        if (!('role'         in user))  user.role         = 'Nuv'
        if (!('banned'       in user))  user.banned       = false
        if (!('useDocument'  in user))  user.useDocument  = false

        if (!user.registered) {
          if (!('name' in user))     user.name    = m.name
          if (!isNumber(user.age))   user.age     = -1
          if (!isNumber(user.regTime)) user.regTime = -1
        }

        if (!user.premium) user.premiumTime = 0

      } else {
        global.db.data.users[m.sender] = {
          exp: 0, coin: 10, joincount: 1, diamond: 3,
          lastadventure: 0, health: 100, lastclaim: 0,
          lastcofre: 0, lastdiamantes: 0, lastcode: 0,
          lastduel: 0, lastpago: 0, lastmining: 0, lastcodereg: 0,
          muto: false, registered: false, genre: '', birth: '',
          marry: '', description: '', packstickers: null,
          name: m.name, age: -1, regTime: -1,
          afk: -1, afkReason: '', banned: false,
          useDocument: false, bank: 0, level: 0,
          role: 'Nuv', premium: false, premiumTime: 0,
          warn: 0, crime: 0
        }
      }

      // ══════════════════════════════════════════
      // INICIALIZAR CHAT
      // ══════════════════════════════════════════
      let chat = global.db.data.chats[m.chat]

      if (typeof chat !== 'object') {
        global.db.data.chats[m.chat] = {}
        chat = global.db.data.chats[m.chat]
      }

      if (chat) {
        if (!('isBanned'       in chat)) chat.isBanned       = false
        if (!('sAutoresponder' in chat)) chat.sAutoresponder = ''
        if (!('welcome'        in chat)) chat.welcome        = true
        if (!('autolevelup'    in chat)) chat.autolevelup    = false
        if (!('autoAceptar'    in chat)) chat.autoAceptar    = false
        if (!('autosticker'    in chat)) chat.autosticker    = false
        if (!('autoRechazar'   in chat)) chat.autoRechazar   = false
        if (!('autoresponder'  in chat)) chat.autoresponder  = false
        if (!('detect'         in chat)) chat.detect         = true
        if (!('antiBot'        in chat)) chat.antiBot        = false
        if (!('antiBot2'       in chat)) chat.antiBot2       = false
        if (!('modoadmin'      in chat)) chat.modoadmin      = false
        if (!('antiLink'       in chat)) chat.antiLink       = true
        if (!('reaction'       in chat)) chat.reaction       = false
        if (!('nsfw'           in chat)) chat.nsfw           = false
        if (!('antifake'       in chat)) chat.antifake       = false
        if (!('delete'         in chat)) chat.delete         = false
        if (!('antiLag'        in chat)) chat.antiLag        = false
        if (!('per'            in chat)) chat.per            = []
        if (!isNumber(chat.expired))     chat.expired        = 0
      } else {
        global.db.data.chats[m.chat] = {
          isBanned: false, sAutoresponder: '', welcome: true,
          autolevelup: false, autoresponder: false, delete: false,
          autoAceptar: false, autoRechazar: false, detect: true,
          antiBot: false, antiBot2: false, modoadmin: false,
          antiLink: true, antifake: false, reaction: false,
          nsfw: false, expired: 0, antiLag: false, per: []
        }
      }

      // ══════════════════════════════════════════
      // INICIALIZAR SETTINGS
      // ══════════════════════════════════════════
      let settings = global.db.data.settings[this.user.jid]

      if (typeof settings !== 'object') {
        global.db.data.settings[this.user.jid] = {}
        settings = global.db.data.settings[this.user.jid]
      }

      if (settings) {
        if (!('self'         in settings)) settings.self         = false
        if (!('restrict'     in settings)) settings.restrict     = true
        if (!('jadibotmd'    in settings)) settings.jadibotmd    = true
        if (!('antiPrivate'  in settings)) settings.antiPrivate  = false
        if (!('autoread'     in settings)) settings.autoread     = false
        if (!isNumber(settings.status))    settings.status       = 0
      } else {
        global.db.data.settings[this.user.jid] = {
          self: false, restrict: true, jadibotmd: true,
          antiPrivate: false, autoread: false, status: 0
        }
      }

    } catch (e) {
      console.error('❌ Error inicializando DB:', e)
    }

    // ══════════════════════════════════════════
    // VERIFICACIONES GLOBALES
    // ══════════════════════════════════════════
    const _user = global.db.data?.users?.[m.sender]

    const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'
    const isROwner   = [...global.owner.map(([number]) => number)]
      .map(v => v.replace(/[^0-9]/g, '') + detectwhat)
      .includes(m.sender)
    const isOwner  = isROwner || m.fromMe
    const isMods   = isROwner || global.mods
      .map(v => v.replace(/[^0-9]/g, '') + detectwhat)
      .includes(m.sender)
    const isPrems  = isROwner ||
      global.prems.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender) ||
      _user?.premium === true

    if (m.isBaileys)              return
    if (opts['nyimak'])           return
    if (!isROwner && opts['self']) return
    if (opts['swonly'] && m.chat !== 'status@broadcast') return
    if (typeof m.text !== 'string') m.text = ''

    // ══════════════════════════════════════════
    // SISTEMA DE BOT PRINCIPAL POR GRUPO
    // ══════════════════════════════════════════
    if (m.isGroup) {
      const chatData = global.db.data.chats[m.chat]
      if (chatData?.primaryBot && this?.user?.jid !== chatData.primaryBot) return
    }

    // ══════════════════════════════════════════
    // SISTEMA DE QUEUE
    // ══════════════════════════════════════════
    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      let queque = this.msgqueque, time = 1000 * 5
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      setInterval(async function() {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    m.exp += Math.ceil(Math.random() * 10)

    // ══════════════════════════════════════════
    // OBTENER LID Y METADATA (CON CACHÉ — fix 429)
    // ══════════════════════════════════════════
    const senderLid = await getLidFromJidCached(m.sender, this)
    const botLid    = await getLidFromJidCached(this.user.jid, this)
    const senderJid = m.sender
    const botJid    = this.user.jid

    const groupMetadata = m.isGroup
      ? ((this.chats[m.chat] || {}).metadata || await getGroupMetadataCached(this, m.chat))
      : {}
    const participants  = m.isGroup ? (groupMetadata?.participants || []) : []
    const user          = participants.find(p => p.id === senderLid || p.id === senderJid) || {}
    const bot           = participants.find(p => p.id === botLid || p.id === botJid) || {}
    const isRAdmin      = user?.admin === 'superadmin'
    const isAdmin        = isRAdmin || user?.admin === 'admin'
    const isBotAdmin    = !!bot?.admin

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
    let usedPrefix = ''

    // ══════════════════════════════════════════
    // LOOP DE PLUGINS
    // ══════════════════════════════════════════
    for (let name in global.plugins) {
      let plugin = global.plugins[name]
      if (!plugin)         continue
      if (plugin.disabled) continue

      const __filename = join(___dirname, name)

      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
        } catch (e) {
          console.error(`❌ Error en plugin.all [${name}]:`, e)
        }
      }

      if (!opts['restrict']) {
        if (plugin.tags && plugin.tags.includes('admin')) continue
      }

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
      let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix

      let match = (_prefix instanceof RegExp
        ? [[_prefix.exec(m.text), _prefix]]
        : Array.isArray(_prefix)
          ? _prefix.map(p => {
              let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
              return [re.exec(m.text), re]
            })
          : typeof _prefix === 'string'
            ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
            : [[[], new RegExp]]
      ).find(p => p[1])

      if (typeof plugin.before === 'function') {
        try {
          if (await plugin.before.call(this, m, {
            match, conn: this, participants, groupMetadata,
            user, bot, isROwner, isOwner, isRAdmin, isAdmin,
            isBotAdmin, isPrems, chatUpdate,
            __dirname: ___dirname, __filename
          })) continue
        } catch (e) {
          console.error(`❌ Error en plugin.before [${name}]:`, e)
        }
      }

      if (typeof plugin !== 'function') continue

      if (m.id?.startsWith('NJX-') ||
         (m.id?.startsWith('BAE5') && m.id.length === 16) ||
         (m.id?.startsWith('B24E') && m.id.length === 20)) return

      if (!(usedPrefix = (match?.[0] || '')[0])) continue

      let noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
      let _args = noPrefix.trim().split` `.slice(1)
      let text  = _args.join` `
      args = args || []
      command = (command || '').toLowerCase()

      let fail = plugin.fail || global.dfail

      let isAccept = plugin.command instanceof RegExp
        ? plugin.command.test(command)
        : Array.isArray(plugin.command)
          ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command)
          : typeof plugin.command === 'string'
            ? plugin.command === command
            : false

      global.comando = command

      if (!isAccept) continue

      m.plugin = name

      // ══════════════════════════════════════════
      // VERIFICACIONES DE CHAT/USUARIO
      // ══════════════════════════════════════════
      if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
        const chatDB = global.db.data.chats[m.chat]
        const userDB = global.db.data.users[m.sender]

        if (name !== 'grupo-unbanchat.js' &&
            name !== 'owner-exec.js' &&
            name !== 'owner-exec2.js' &&
            name !== 'grupo-delete.js' &&
            chatDB?.isBanned && !isROwner) return

        if (m.text && userDB?.banned && !isROwner) {
          m.reply([
            `╔══〔 🌼 *THEELY-MD* 〕══╗`,
            `║`,
            `║ 🔴 *Estás baneado/a~*`,
            `║ No puedes usar comandos.`,
            `║`,
            `║ 📌 *Motivo:*`,
            `║ ${userDB.bannedReason || 'Sin especificar'}`,
            `║`,
            `║ 💡 Si crees que es un error,`,
            `║ contacta a un moderador~`,
            `║`,
            `╚══════════════════════╝`
          ].join('\n'))
          return
        }
      }

      // ══════════════════════════════════════════
      // MODO ADMIN DEL GRUPO
      // ══════════════════════════════════════════
      const adminMode = global.db.data.chats[m.chat]?.modoadmin
      const esComando = !!(plugin.botAdmin || plugin.admin || plugin.group || usedPrefix)
      if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && esComando) return

      // ══════════════════════════════════════════
      // VERIFICACIONES DE PERMISOS
      // ══════════════════════════════════════════
      if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
        fail('owner', m, this, usedPrefix, command); continue
      }
      if (plugin.rowner && !isROwner) {
        fail('rowner', m, this, usedPrefix, command); continue
      }
      if (plugin.owner && !isOwner) {
        fail('owner', m, this, usedPrefix, command); continue
      }
      if (plugin.mods && !isMods) {
        fail('mods', m, this, usedPrefix, command); continue
      }
      if (plugin.premium && !isPrems) {
        fail('premium', m, this, usedPrefix, command); continue
      }
      if (plugin.group && !m.isGroup) {
        fail('group', m, this, usedPrefix, command); continue
      } else if (plugin.botAdmin && !isBotAdmin) {
        fail('botAdmin', m, this, usedPrefix, command); continue
      } else if (plugin.admin && !isAdmin) {
        fail('admin', m, this, usedPrefix, command); continue
      }
      if (plugin.private && m.isGroup) {
        fail('private', m, this, usedPrefix, command); continue
      }
      if (plugin.register === true && _user?.registered === false) {
        fail('unreg', m, this, usedPrefix, command); continue
      }

      m.isCommand = true
      let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
      m.exp += xp

      const moneda = global.moneda || 'coins'

      if (!isPrems && plugin.coin && global.db.data.users[m.sender].coin < plugin.coin * 1) {
        this.reply(m.chat, `❮✦❯ Se agotaron tus ${moneda}`, m)
        continue
      }

      if (plugin.level > _user?.level) {
        this.reply(m.chat, [
          `╔══〔 🌼 *THEELY-MD* 〕══╗`,
          `║`,
          `║ ⭐ *Nivel insuficiente~*`,
          `║ Necesitas nivel: *${plugin.level}*`,
          `║ Tu nivel: *${_user?.level || 0}*`,
          `║`,
          `║ 💡 Usa *${usedPrefix}levelup*`,
          `║`,
          `╚══════════════════════╝`
        ].join('\n'), m)
        continue
      }

      let extra = {
        match, usedPrefix, noPrefix, _args, args,
        command, text, conn: this, participants, groupMetadata,
        user, bot, isROwner, isOwner, isRAdmin, isAdmin,
        isBotAdmin, isPrems, chatUpdate,
        __dirname: ___dirname, __filename
      }

      try {
        await plugin.call(this, m, extra)
        if (!isPrems) m.coin = m.coin || plugin.coin || false
      } catch (e) {
        m.error = e
        console.error(`❌ Error en plugin [${name}]:`, e)
        if (e) {
          let errText = format(e)
          for (let key of Object.values(global.APIKeys || {})) {
            errText = errText.replace(new RegExp(key, 'g'), '***')
          }
          m.reply([
            `╔══〔 🌼 *THEELY-MD — ERROR* 〕══╗`,
            `║`,
            `║ ❌ *Error en comando~*`,
            `║ ${errText.slice(0, 200)}`,
            `║`,
            `║ 💡 Usa *.report* para informarlo`,
            `║`,
            `╚════════════════════════════╝`
          ].join('\n'))
        }
      } finally {
        if (typeof plugin.after === 'function') {
          try {
            await plugin.after.call(this, m, extra)
          } catch (e) {
            console.error(`❌ Error en plugin.after [${name}]:`, e)
          }
        }
        if (m.coin) this.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} ${moneda}`, m)
      }
      break
    }

  } catch (e) {
    console.error('❌ Error en handler:', e)
  } finally {
    // ══════════════════════════════════════════
    // FINALLY — LIMPIEZA Y STATS
    // ══════════════════════════════════════════
    if (opts['queque'] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
      if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
    }

    if (m) {
      const utente = global.db.data?.users?.[m.sender]

      if (utente?.muto === true) {
        try {
          await this.sendMessage(m.chat, {
            delete: {
              remoteJid:   m.chat,
              fromMe:      false,
              id:          m.key.id,
              participant: m.key.participant
            }
          })
        } catch {}
      }

      const userFinal = global.db.data?.users?.[m.sender]
      if (m.sender && userFinal) {
        userFinal.coin = (userFinal.coin || 0) - (m.coin ? m.coin * 1 : 0)

        if (m.isCommand) {
          userFinal.lastSeen = Date.now()

          if (m.exp > 0) {
            const { leveledUp, oldLevel, newLevel } = applyExp(
              userFinal,
              m.exp,
              global.multiplier || 1
            )

            if (leveledUp) {
              try {
                await this.sendMessage(m.chat, {
                  text: [
                    `╔══〔 🌼 *THEELY-MD — NIVEL* 〕══╗`,
                    `║`,
                    `║ 🎉 *¡Subiste de nivel!*`,
                    `║`,
                    `║ 👤 @${m.sender.split('@')[0]}`,
                    `║ ⭐ *Nivel anterior:* ${oldLevel}`,
                    `║ 🌟 *Nivel actual:*   ${newLevel}`,
                    `║`,
                    `║ 💡 Sigue usando comandos para`,
                    `║ seguir subiendo de nivel~`,
                    `║`,
                    `╚════════════════════════════╝`
                  ].join('\n'),
                  mentions: [m.sender]
                }, { quoted: m })
              } catch (e) {
                console.error('❌ Error al avisar subida de nivel:', e)
              }
            }
          }
        }
      }

      let stats = global.db.data?.stats
      if (stats && m.plugin) {
        let now  = Date.now()
        let stat = stats[m.plugin]

        if (stat) {
          if (!isNumber(stat.total))       stat.total       = 1
          if (!isNumber(stat.success))     stat.success     = m.error != null ? 0 : 1
          if (!isNumber(stat.last))        stat.last        = now
          if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
        } else {
          stat = stats[m.plugin] = {
            total:       1,
            success:     m.error != null ? 0 : 1,
            last:        now,
            lastSuccess: m.error != null ? 0 : now
          }
        }

        stat.total += 1
        stat.last   = now
        if (m.error == null) {
          stat.success      += 1
          stat.lastSuccess   = now
        }
      }
    }

    try {
      if (!opts['noprint']) await (await import('./lib/print.js')).default(m, this)
    } catch (e) {
      console.error('❌ Error en print:', e)
    }

    const settingsREAD = global.db.data?.settings?.[this.user.jid] || {}
    if (settingsREAD.autoread || opts['autoread']) {
      await this.readMessages([m.key]).catch(() => {})
    }

    const chatData = global.db.data?.chats?.[m.chat]
    if (chatData?.reaction && m.text?.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
      if (!m.fromMe) {
        const emot = pickRandom([
          '🌼','😃','😄','😁','😆','🍓','😅','😂','🤣','🥲','☺️','😊','😇',
          '🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','🌺','🌸','😚','😋',
          '😛','😝','😜','🤪','🤨','🌟','🤓','😎','🥸','🤩','🥳','😏','💫',
          '✨','⚡','🔥','🌈','🩷','❤️','💙','💜','💎','👑','🌼'
        ])
        try {
          await this.sendMessage(m.chat, { react: { text: emot, key: m.key } })
        } catch {}
      }
    }
  }
}

// ══════════════════════════════════════════
// DFAIL — MENSAJES DE ERROR DE PERMISOS
// ══════════════════════════════════════════
global.dfail = (type, m, conn, usedPrefix, command) => {
  const edadaleatoria   = getRandom(['10','28','20','40','18','21','15','11','9','17','25'])
  const user2           = m.pushName || 'Anónimo'
  const verifyaleatorio = getRandom(['registrar','reg','verificar','verify','register'])

  const msg = {
    rowner:   '🔐 Solo el Creador del Bot puede usar este comando.',
    owner:    '👑 Solo el Creador y Sub Bots pueden usar este comando.',
    mods:     '🛡️ Solo los Moderadores pueden usar este comando.',
    premium:  '💎 Solo usuarios Premium pueden usar este comando.',
    group:    '「✧」 Este comando es sólo para grupos.',
    private:  '🔒 Solo en Chat Privado puedes usar este comando.',
    admin:    '⚔️ Solo los Admins del Grupo pueden usar este comando.',
    botAdmin: '🤖 El bot debe ser Admin para ejecutar esto.',
    unreg:    `> 🔰 Debes estar Registrado.\n\n Ejemplo : #reg ${user2}.${edadaleatoria}`,
    restrict: '⛔ Esta función está deshabilitada.'
  }[type]

  if (msg) {
    const ctx = global.rcanal || {}
    return conn.reply(m.chat, msg, m, { contextInfo: ctx })
      .then(() => conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } }))
      .catch(console.error)
  }

  let file = global.__filename(import.meta.url, true)
  watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.yellowBright("🌼 Se actualizó 'handler.js'"))

    if (global.conns?.length > 0) {
      const activeBots = global.conns.filter(c =>
        c?.user && c?.ws?.socket &&
        c.ws.socket.readyState !== ws.OPEN
      )
      for (const bot of activeBots) {
        try { bot.subreloadHandler?.(false) } catch {}
      }
    }
  })
}
