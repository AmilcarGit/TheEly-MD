import os from 'os'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function clockString(ms) {
  const h   = Math.floor(ms / 3600000)
  const min = Math.floor(ms / 60000) % 60
  const s   = Math.floor(ms / 1000) % 60
  return `${String(h).padStart(2,'0')}h ${String(min).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`
}

function barras(usado, total, bloques = 12) {
  const pct   = Math.min(usado / total, 1)
  const lleno = Math.round(pct * bloques)
  return '█'.repeat(lleno) + '░'.repeat(bloques - lleno) + ` ${Math.round(pct * 100)}%`
}

const handler = async (m, { conn }) => {
  const uptime   = process.uptime() * 1000
  const memTotal = os.totalmem()
  const memFree  = os.freemem()
  const memUsed  = memTotal - memFree
  const cpuModel = os.cpus()[0]?.model?.split(' ').slice(0,3).join(' ') || 'Desconocido'
  const platform = os.platform()
  const nodeVer  = process.version

  const totalGrupos   = Object.keys(global.db.data?.chats || {}).filter(id => id.endsWith('@g.us')).length
  const totalUsuarios = Object.keys(global.db.data?.users || {}).length
  const totalPlugins  = Object.keys(global.plugins || {}).length
  const totalSubBots  = (global.conns || []).filter(c => c?.user).length

  const ahora    = new Date()
  const horaPeru = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Lima' }))
  const fecha    = horaPeru.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
  const hora     = horaPeru.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — STATUS* 〕══╗`,
      `║`,
      `║ 🤖 *Bot:*       TheEly-MD`,
      `║ 👤 *Dueño:*     AmilcarGit`,
      `║ 📅 *Fecha:*     ${fecha}`,
      `║ 🕐 *Hora:*      ${hora}`,
      `║ ⏱️  *Actividad:* ${clockString(uptime)}`,
      `║`,
      `╠══〔 💻 *SISTEMA* 〕══════════════╣`,
      `║`,
      `║ 🖥️  *OS:*       ${platform}`,
      `║ 🟢 *Node:*     ${nodeVer}`,
      `║ ⚙️  *CPU:*      ${cpuModel}`,
      `║`,
      `║ 🧠 *RAM:*`,
      `║  ${barras(memUsed, memTotal)}`,
      `║  ${formatBytes(memUsed)} / ${formatBytes(memTotal)}`,
      `║`,
      `╠══〔 📊 *ESTADÍSTICAS* 〕══════════╣`,
      `║`,
      `║ 👥 *Grupos:*    ${totalGrupos}`,
      `║ 👤 *Usuarios:*  ${totalUsuarios}`,
      `║ 🔌 *Plugins:*   ${totalPlugins}`,
      `║ 🤖 *Sub-Bots:*  ${totalSubBots}`,
      `║`,
      `║ 💫 *Powered by TheEly-MD 🌼*`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('🌼')
}

handler.help    = ['status']
handler.tags    = ['info']
handler.command = ['status', 'stats', 'estado', 'info']
handler.desc    = 'Muestra el estado completo del bot'

export default handler
