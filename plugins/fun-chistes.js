const CHISTES = [
  '¿Por qué el libro de matemáticas está triste? Porque tiene muchos problemas~',
  '¿Qué le dijo el semáforo al auto? No me mires que me estoy cambiando~',
  '¿Cómo se llama el campeón de buceo japonés? Tokofuera~',
  '¿Qué hace una abeja en el gimnasio? ¡Zum-ba!~',
  '¿Por qué los pájaros vuelan hacia el sur? Porque caminar sería demasiado lejos~',
  '¿Qué le dijo un techo a otro techo? Nada, los techos no hablan~',
  '¿Cómo se dice pañuelo en japonés? Saka-moko~',
  '¿Qué le dijo el océano a la playa? Nada, solo la saludó~',
  '¿Por qué el espantapájaros ganó un premio? Porque era sobresaliente en su campo~',
  '¿Qué hace un pez cuando está aburrido? Nada~',
  '¿Cómo llaman a un boomerang que no vuelve? Palo~',
  '¿Por qué el sol no va a la universidad? Porque ya tiene millones de grados~',
  '¿Qué le dijo el 0 al 8? Bonito cinturón~',
  '¿Por qué los programadores confunden Halloween con Navidad? Porque OCT 31 = DEC 25~',
  '¿Qué hace una vaca con una calculadora? Cuenta lechera~'
]

const handler = async (m, { conn }) => {
  const chiste = CHISTES[Math.floor(Math.random() * CHISTES.length)]

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — CHISTE* 〕══╗`,
      `║`,
      `║ 😂 *Chiste del momento~*`,
      `║`,
      `║ ${chiste}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('😂')
}

handler.help    = ['chiste']
handler.tags    = ['fun']
handler.command = ['chiste', 'joke', 'humor']
handler.desc    = 'Chiste aleatorio'
export default handler
