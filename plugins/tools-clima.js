import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply([
    `╔══〔 🌼 *THEELY-MD — CLIMA* 〕══╗`,
    `║`,
    `║ 💡 *Uso:*`,
    `║ ${usedPrefix + command} <ciudad>`,
    `║`,
    `║ 📌 *Ejemplo:*`,
    `║ ${usedPrefix + command} Lima`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))

  await m.react('☁️')

  try {
    const res  = await fetch(`https://wttr.in/${encodeURIComponent(text.trim())}?format=j1`)
    const json = await res.json()

    const actual = json.current_condition[0]
    const ciudad = json.nearest_area[0].areaName[0].value
    const pais   = json.nearest_area[0].country[0].value

    const temp     = actual.temp_C
    const sensacion = actual.FeelsLikeC
    const humedad  = actual.humidity
    const viento   = actual.windspeedKmph
    const desc     = actual.weatherDesc[0].value
    const uv       = actual.uvIndex

    const EMOJI_CLIMA = {
      'Sunny': '☀️', 'Clear': '🌙', 'Partly cloudy': '⛅',
      'Cloudy': '☁️', 'Overcast': '☁️', 'Mist': '🌫️',
      'Patchy rain possible': '🌦️', 'Light rain': '🌧️',
      'Moderate rain': '🌧️', 'Heavy rain': '⛈️',
      'Thunderstorm': '⛈️', 'Snow': '❄️', 'Fog': '🌫️'
    }
    const emoji = EMOJI_CLIMA[desc] || '🌤️'

    await conn.sendMessage(m.chat, {
      text: [
        `╔══〔 🌼 *THEELY-MD — CLIMA* 〕══╗`,
        `║`,
        `║ 📍 *${ciudad}, ${pais}*`,
        `║`,
        `║ ${emoji} *${desc}*`,
        `║`,
        `║ 🌡️ *Temperatura:* ${temp}°C`,
        `║ 🤔 *Sensación:*    ${sensacion}°C`,
        `║ 💧 *Humedad:*      ${humedad}%`,
        `║ 💨 *Viento:*       ${viento} km/h`,
        `║ ☀️ *Índice UV:*    ${uv}`,
        `║`,
        `╚══════════════════════════════════╝`
      ].join('\n')
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply([
      `╔══〔 🌼 *THEELY-MD — CLIMA* 〕══╗`,
      `║`,
      `║ ❌ *Ciudad no encontrada~*`,
      `║ Verifica el nombre e intenta`,
      `║ de nuevo~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.help    = ['clima <ciudad>']
handler.tags    = ['tools']
handler.command = ['clima', 'weather', 'tiempo']
handler.desc    = 'Consulta el clima de una ciudad'

export default handler
