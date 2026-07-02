const handler = async (m, { conn, args }) => {
  if (args.length < 2) {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — MULTIPLICAR* 〕══╗`,
      `║`,
      `║  📝 *Multiplica dos o más números*`,
      `║`,
      `║  💡 *Uso:* .multiplicar <n1> <n2> <n3...>`,
      `║  📌 *Ejemplo:* .multiplicar 5 10 2`,
      `║  🟢 *Resultado:* 100`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const numeros = args.map(Number)
  if (numeros.some(isNaN)) return m.reply('❌ *Todos los valores deben ser números*')

  const total = numeros.reduce((a, b) => a * b, 1)
  const operacion = numeros.join(' × ')

  await m.react('✖️')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — MULTIPLICAR* 〕══╗`,
    `║`,
    `║  📝 *Operación:*`,
    `║  ${operacion} = ${total}`,
    `║`,
    `║  ✅ *Resultado:* ${total}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help = ['multiplicar <n1> <n2> ...']
handler.tags = ['estudio']
handler.command = ['multiplicar', 'multiplica', '×', '*']
handler.register = false
handler.desc = 'Multiplica dos o más números'
export default handler