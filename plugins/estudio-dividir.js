const handler = async (m, { conn, args }) => {
  if (args.length < 2) {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — DIVIDIR* 〕══╗`,
      `║`,
      `║  📝 *Divide dos números*`,
      `║`,
      `║  💡 *Uso:* .dividir <n1> <n2>`,
      `║  📌 *Ejemplo:* .dividir 20 5`,
      `║  🟢 *Resultado:* 4`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const n1 = parseFloat(args[0])
  const n2 = parseFloat(args[1])

  if (isNaN(n1) || isNaN(n2)) return m.reply('❌ *Todos los valores deben ser números*')
  if (n2 === 0) return m.reply('❌ *No se puede dividir entre 0*')

  const resultado = n1 / n2

  await m.react('➗')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — DIVIDIR* 〕══╗`,
    `║`,
    `║  📝 *Operación:*`,
    `║  ${n1} ÷ ${n2} = ${resultado}`,
    `║`,
    `║  ✅ *Resultado:* ${resultado}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help = ['dividir <n1> <n2>']
handler.tags = ['estudio']
handler.command = ['dividir', 'division', '÷', '/']
handler.register = false
handler.desc = 'Divide dos números'
export default handler