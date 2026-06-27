import { execSync } from 'child_process';
import { puedeEnviar, esperar } from './_lid.js';

const handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) {
    await esperar(600);
    return conn.reply(m.chat, `❌ *THEELY-MD — ACCESO DENEGADO*\n\nSolo el propietario puede actualizar el sistema.`, m);
  }

  if (!await puedeEnviar(m.sender)) {
    return conn.reply(m.chat, `⏳ *THEELY-MD — ESPERA POR FAVOR*\n\nNo envíes comandos tan seguido para evitar errores.`, m);
  }

  try {
    await esperar(800);
    const mensajeInicio = `
╔══〔 🌼 *THEELY-MD* 〕══╗
║ 🔄 ACTUALIZACIÓN
╚══════════════════════╝

⏳ *Actualizando el sistema...*
Por favor espera un momento.
`.trim();

    await conn.reply(m.chat, mensajeInicio, m);

    await esperar(1200);
    const output = execSync(`git pull${args.length ? ' ' + args.join(' ') : ''}`, {
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 30000
    }).trim();

    const yaActualizado = output.includes('Already up to date');

    let txtFinal;

    if (yaActualizado) {
      txtFinal = `
╔══〔 🌼 *THEELY-MD* 〕══╗
║ ✅ SISTEMA ACTUALIZADO
╚══════════════════════╝

✅ *Ya estás en la última versión*
No hay cambios nuevos para aplicar.

💫 TheEly-MD 🌼
`.trim();
    } else {
      txtFinal = `
╔══〔 🌼 *THEELY-MD* 〕══╗
║ 🎉 ACTUALIZACIÓN LISTA
╚══════════════════════╝

✅ *Cambios aplicados correctamente:*

${output}

🔄 *Reinicia el bot con .restart*
para que todos los cambios funcionen.

💫 TheEly-MD 🌼
`.trim();
    }

    await esperar(1200);
    await conn.reply(m.chat, txtFinal, m);

  } catch (error) {
    let txtError = `
╔══〔 🌼 *THEELY-MD* 〕══╗
║ ❌ ERROR AL ACTUALIZAR
╚══════════════════════╝

❌ No se pudo completar la actualización.
`.trim();

    try {
      const estadoGit = execSync('git status --porcelain', {
        stdio: 'pipe',
        encoding: 'utf8'
      }).trim();

      if (estadoGit) {
        const archivosConflicto = estadoGit
          .split('\n')
          .map(linea => linea.slice(3).trim())
          .filter(archivo =>
            !archivo.startsWith('.npm/') &&
            !archivo.startsWith('Sessions/') &&
            !archivo.startsWith('sessions/') &&
            !archivo.startsWith('node_modules/') &&
            !archivo.startsWith('package-lock.json') &&
            !archivo.startsWith('database.json') &&
            !archivo.startsWith('.cache/') &&
            !archivo.startsWith('tmp/')
          );

        if (archivosConflicto.length > 0) {
          txtError = `
╔══〔 🌼 *THEELY-MD* 〕══╗
║ ⚠️ CONFLICTOS DETECTADOS
╚══════════════════════╝

⚠️ Se encontraron cambios locales que impiden actualizar:

${archivosConflicto.map(a => `• ${a}`).join('\n')}

💡 *Soluciones:*
• Ejecuta en Termux: \`git stash && git pull\`
• O reinstala el bot limpiamente.

💫 TheEly-MD 🌼
`.trim();
        }
      }
    } catch { /* Ignoramos error al leer estado */ }

    await esperar(1000);
    await conn.reply(m.chat, txtError, m);
  }
};

const palabrasClave = ['update', 'up', 'fix'];

handler.help    = ['update'];
handler.tags    = ['creador'];
handler.command = ['update', 'up', 'fix'];
handler.rowner  = true;
handler.desc    = 'Actualiza TheEly-MD desde el repositorio';

handler.all = async function (m) {
  if (!m.text || typeof m.text !== 'string') return;
  const texto = m.text.trim().toLowerCase();
  const esDueno = global.owner?.some(dueno => m.sender === dueno);

  if (palabrasClave.includes(texto)) {
    return handler(m, { conn: this, args: [], isOwner: esDueno });
  }
};

export default handler;
