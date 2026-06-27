// 🌼 THEELY-MD — MAIN BOT 🌼
import fs from 'fs'
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, mkdirSync, rmSync } from 'fs';
import yargs from 'yargs';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import lodash from 'lodash';
import readline from 'readline';
import NodeCache from 'node-cache';
import qrcode from 'qrcode-terminal';
import { spawn } from 'child_process';
import { setInterval } from 'timers';

// ══════════════════════════════════════════
// UTILIDAD DE LOGS — ESTILO THEELY-MD
// ══════════════════════════════════════════
function logEstado(emoji, mensaje, color = 'white') {
  console.log(chalk[color](`  ${emoji}  ${mensaje}`));
}

function logSeccion(titulo) {
  const linea = '═'.repeat(46);
  console.log(chalk.yellow(`\n ╔${linea}╗`));
  console.log(chalk.yellow(' ║') + chalk.bold.white(`   🌼  ${titulo}`.padEnd(46)) + chalk.yellow('║'));
  console.log(chalk.yellow(` ╚${linea}╝\n`));
}

// ══════════════════════════════════════════
// CONFIGURACIÓN INICIAL DEL ENTORNO
// ══════════════════════════════════════════
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
process.env.TMPDIR = path.join(process.cwd(), 'tmp');

if (!fs.existsSync(process.env.TMPDIR)) {
  fs.mkdirSync(process.env.TMPDIR, { recursive: true });
  logEstado('📁', 'Directorio temporal creado', 'green');
}

import './config.js';
import { createRequire } from 'module';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
} = await import('@whiskeysockets/baileys');

const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Serialización de prototipos
protoType();
serialize();

// ══════════════════════════════════════════
// UTILIDADES GLOBALES
// ══════════════════════════════════════════
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

// API helper
global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}),
        })
      )
    : '');

global.timestamp = { start: new Date() };

const __dirname = global.__dirname(import.meta.url);

// ══════════════════════════════════════════
// BANNER DE INICIO
// ══════════════════════════════════════════
logSeccion('THEELY-MD — SISTEMA PRINCIPAL');
logEstado('✨', 'Inicializando núcleo del bot...', 'cyan');

// ══════════════════════════════════════════
// PARSING DE ARGUMENTOS
// ══════════════════════════════════════════
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

// ══════════════════════════════════════════
// CONFIGURACIÓN DE BASE DE DATOS
// ══════════════════════════════════════════
global.db = new Low(new JSONFile(`storage/databases/database.json`));

global.isDatabaseModified = false;
global.markDatabaseModified = () => {
  global.isDatabaseModified = true;
};

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1 * 1000)
    );
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = lodash.chain(global.db.data);

  const originalSet = global.db.chain.set.bind(global.db.chain);
  global.db.chain.set = (...args) => {
    const result = originalSet(...args);
    global.markDatabaseModified();
    return result;
  };
};

await global.loadDatabase();
logEstado('💾', 'Base de datos cargada correctamente', 'green');

// ══════════════════════════════════════════
// CONFIGURACIÓN DE AUTENTICACIÓN
// ══════════════════════════════════════════
global.authFile = `sessions`;
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);

const { version } = await fetchLatestBaileysVersion();

// Interfaz de línea de comandos
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

// Logger configurado
const logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
}).child({ class: 'client' });
logger.level = 'fatal';

// ══════════════════════════════════════════
// OPCIONES DE CONEXIÓN
// ══════════════════════════════════════════
const connectionOptions = {
  version: version,
  logger,
  printQRInTerminal: false,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  browser: Browsers.ubuntu('Chrome'),
  markOnlineOnclientect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  retryRequestDelayMs: 10,
  transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
  maxMsgRetryCount: 15,
  appStateMacVerification: {
    patch: false,
    snapshot: false,
  },
  getMessage: async (key) => {
    const jid = jidNormalizedUser(key.remoteJid);
    return '';
  },
};

// ══════════════════════════════════════════
// PROTECCIÓN ANTI RATE-OVERLIMIT (429)
// ══════════════════════════════════════════
function esRateLimitError(e) {
  const statusCode = e?.output?.statusCode || e?.data;
  const msg = String(e?.message || e?.output?.payload?.error || '');
  return statusCode === 429 || msg.includes('rate-overlimit');
}

function envolverAntiRateLimit(conn, etiqueta = 'Bot') {
  let pausado = false;
  const original = conn.sendMessage.bind(conn);

  conn.sendMessage = async (...args) => {
    if (pausado) {
      logEstado('⏸️', `[${etiqueta}] Envío omitido · en pausa por rate-limit`, 'yellow');
      return null;
    }
    try {
      return await original(...args);
    } catch (e) {
      if (esRateLimitError(e)) {
        pausado = true;
        logEstado('🛑', `[${etiqueta}] Rate-limit detectado · pausando envíos 90s`, 'red');
        setTimeout(() => {
          pausado = false;
          logEstado('▶️', `[${etiqueta}] Envíos reanudados`, 'green');
        }, 90 * 1000);
        return null;
      }
      throw e;
    }
  };

  return conn;
}

// Conexión principal
global.conn = makeWASocket(connectionOptions);
envolverAntiRateLimit(global.conn, 'Principal');
global.conns = global.conns || [];

// ══════════════════════════════════════════
// CARGAR HANDLER
// ══════════════════════════════════════════
let handler;
try {
  const handlerModule = await import('./handler.js');
  handler = handlerModule.handler;
  logEstado('✅', 'Handler principal cargado correctamente', 'green');
} catch (e) {
  logEstado('❌', 'No se pudo cargar el handler principal', 'red');
  console.error(e);
  process.exit(1);
}

// ══════════════════════════════════════════
// CONTROL DE REINTENTOS POR SUB-BOT
// ══════════════════════════════════════════
const MAX_REINTENTOS = 5;
const reintentosSubBot = {};

function calcularBackoff(intento) {
  return Math.min(10 * 1000 * Math.pow(2, intento), 5 * 60 * 1000);
}

async function reconnectSubBot(botPath, intento = 0) {
  const nombreBot = path.basename(botPath);

  if (intento === 0) {
    reintentosSubBot[nombreBot] = 0;
  }

  logEstado('🌀', `Reconectando sub-bot: ${nombreBot}${intento > 0 ? ` · intento ${intento + 1}/${MAX_REINTENTOS}` : ''}`, 'yellow');

  try {
    const { state: subBotState, saveCreds: saveSubBotCreds } = await useMultiFileAuthState(botPath);

    if (!subBotState.creds.registered) {
      logEstado('⚠️', `Sub-bot ${nombreBot} no está registrado`, 'yellow');
      return;
    }

    if (!existsSync(botPath)) {
      logEstado('🧹', `Sub-bot ${nombreBot} ya no existe, se cancela el reintento`, 'gray');
      return;
    }

    const subBotConn = makeWASocket({
      version: version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: subBotState.creds,
        keys: makeCacheableSignalKeyStore(subBotState.keys, logger),
      },
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnclientect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: true,
      retryRequestDelayMs: 10,
      transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
      maxMsgRetryCount: 15,
      appStateMacVerification: {
        patch: false,
        snapshot: false,
      },
      getMessage: async (key) => '',
    });

    envolverAntiRateLimit(subBotConn, `Sub-bot:${nombreBot}`);

    const intentarDeNuevo = (motivo) => {
      const intentoActual = reintentosSubBot[nombreBot] || 0;

      if (intentoActual >= MAX_REINTENTOS) {
        logEstado('🛑', `Sub-bot ${nombreBot} agotó sus ${MAX_REINTENTOS} reintentos · ${motivo}`, 'red');
        logEstado('💡', `Usa el comando para reconectarlo manualmente o revisa su sesión`, 'yellow');
        return;
      }

      reintentosSubBot[nombreBot] = intentoActual + 1;
      const espera = calcularBackoff(intentoActual);

      logEstado('🔁', `Sub-bot ${nombreBot} reintentará en ${Math.round(espera / 1000)}s · ${motivo}`, 'yellow');

      setTimeout(() => {
        reconnectSubBot(botPath, reintentosSubBot[nombreBot]).catch(console.error);
      }, espera);
    };

    let conectado = false;
    const timeoutColgado = setTimeout(() => {
      if (!conectado) {
        logEstado('⏱️', `Sub-bot ${nombreBot} no respondió en 45s · puede estar bajo rate-limit`, 'red');
        try { subBotConn.ws?.close(); } catch {}
        intentarDeNuevo('sin respuesta (timeout)');
      }
    }, 45 * 1000);

    subBotConn.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        conectado = true;
        clearTimeout(timeoutColgado);
        reintentosSubBot[nombreBot] = 0;
        subBotConn.connectedAt = Date.now();
        logEstado('🌼', `Sub-bot conectado: ${nombreBot}`, 'green');
        global.conns = global.conns.filter(c => c.user?.jid !== subBotConn.user?.jid);
        global.conns.push(subBotConn);
        logEstado('⚡', `Sub-bot añadido a la lista: ${subBotConn.user?.jid}`, 'cyan');

      } else if (connection === 'close') {
        conectado = true;
        clearTimeout(timeoutColgado);
        subBotConn.connectedAt = null;
        global.conns = global.conns.filter(c => c.user?.jid !== subBotConn.user?.jid);

        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        logEstado('💥', `Sub-bot desconectado en ${nombreBot} · razón ${reason}`, 'red');

        if (reason === DisconnectReason.loggedOut || reason === 401) {
          logEstado('❌', `Eliminando sesión inválida: ${nombreBot}`, 'red');
          try {
            rmSync(botPath, { recursive: true, force: true });
            logEstado('🧹', `Sesión eliminada correctamente: ${botPath}`, 'green');
          } catch (e) {
            logEstado('❌', `No se pudo eliminar la sesión ${botPath}`, 'red');
            console.error(e);
          }
          return;
        }

        intentarDeNuevo(`código ${reason || 'desconocido'}`);
      }
    });

    subBotConn.ev.on('creds.update', saveSubBotCreds);
    subBotConn.handler = handler.bind(subBotConn);
    subBotConn.ev.on('messages.upsert', subBotConn.handler);
    logEstado('🔗', `Manejador asignado a sub-bot: ${nombreBot}`, 'blue');

    if (!global.subBots) {
      global.subBots = {};
    }
    global.subBots[nombreBot] = subBotConn;

  } catch (e) {
    logEstado('💥', `Error al reconectar sub-bot en ${nombreBot}`, 'red');
    console.error(e);
    intentarDeNuevoSeguro(nombreBot, botPath, 'error al iniciar');
  }
}

function intentarDeNuevoSeguro(nombreBot, botPath, motivo) {
  const intentoActual = reintentosSubBot[nombreBot] || 0;
  if (intentoActual >= MAX_REINTENTOS) {
    logEstado('🛑', `Sub-bot ${nombreBot} agotó sus ${MAX_REINTENTOS} reintentos · ${motivo}`, 'red');
    return;
  }
  reintentosSubBot[nombreBot] = intentoActual + 1;
  const espera = calcularBackoff(intentoActual);
  logEstado('🔁', `Sub-bot ${nombreBot} reintentará en ${Math.round(espera / 1000)}s · ${motivo}`, 'yellow');
  setTimeout(() => {
    reconnectSubBot(botPath, reintentosSubBot[nombreBot]).catch(console.error);
  }, espera);
}

async function startSubBots() {
  const rutaJadiBot = join(__dirname, './JadiBots');
  const DELAY_ENTRE_BOTS = 5 * 1000;

  if (!existsSync(rutaJadiBot)) {
    mkdirSync(rutaJadiBot, { recursive: true });
    logEstado('📁', `Carpeta de sub-bots creada: ${rutaJadiBot}`, 'cyan');
  } else {
    logEstado('📁', `Carpeta de sub-bots detectada: ${rutaJadiBot}`, 'cyan');
  }

  const readRutaJadiBot = readdirSync(rutaJadiBot);
  if (readRutaJadiBot.length > 0) {
    const credsFile = 'creds.json';
    logEstado('🔍', `Buscando sub-bots disponibles · total: ${readRutaJadiBot.length}`, 'yellow');

    let indice = 0;
    for (const subBotDir of readRutaJadiBot) {
      const botPath = join(rutaJadiBot, subBotDir);
      if (statSync(botPath).isDirectory()) {
        const readBotPath = readdirSync(botPath);
        if (readBotPath.includes(credsFile)) {
          logEstado('⚡', `Sesión encontrada en ${subBotDir} · reconectando (${indice + 1}/${readRutaJadiBot.length})`, 'yellow');
          await reconnectSubBot(botPath);

          indice++;
          if (indice < readRutaJadiBot.length) {
            await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_BOTS));
          }
        } else {
          logEstado('⚠️', `Carpeta ${subBotDir} sin sesión válida (creds.json)`, 'yellow');
        }
      }
    }
    logEstado('✅', 'Proceso de reconexión de sub-bots completado', 'green');
  } else {
    logEstado('🌙', 'No hay sub-bots para reconectar', 'gray');
  }
}

global.startSubBots = startSubBots;
global.reconnectSubBot = reconnectSubBot;
await startSubBots();

// ══════════════════════════════════════════
// MANEJAR LOGIN DEL BOT PRINCIPAL
// ══════════════════════════════════════════
async function handleLogin() {
  if (conn.authState.creds.registered) {
    logEstado('✅', 'El bot principal ya está registrado', 'green');
    return;
  }

  const linea = '═'.repeat(40);
  let loginMethod = await question(
    chalk.yellow(`\n ╔${linea}╗\n`) +
    chalk.yellow(' ║') + chalk.bold.white('   🌼  THEELY-MD — VINCULACIÓN'.padEnd(40)) + chalk.yellow('║\n') +
    chalk.yellow(` ╠${linea}╣\n`) +
    chalk.white('   ¿Cómo deseas iniciar sesión?\n\n') +
    chalk.white('   📱  Escribe "code" para usar\n') +
    chalk.white('       código de emparejamiento\n\n') +
    chalk.white('   🔳  Presiona Enter para usar QR\n') +
    chalk.yellow(` ╚${linea}╝\n\n`) +
    chalk.cyan('  > ')
  );

  loginMethod = loginMethod.toLowerCase().trim();

  if (loginMethod === 'code') {
    let phoneNumber = await question(chalk.cyan('\n  📱 Ingresa tu número con código de país (ej: 5215551234567):\n  > '));
    phoneNumber = phoneNumber.replace(/\D/g, '');

    if (phoneNumber.startsWith('52') && phoneNumber.length === 12) {
      phoneNumber = `521${phoneNumber.slice(2)}`;
    } else if (phoneNumber.startsWith('52') && phoneNumber.length === 10) {
      phoneNumber = `521${phoneNumber}`;
    } else if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.replace(/^0/, '');
    }

    if (typeof conn.requestPairingCode === 'function') {
      try {
        if (conn.ws.readyState === ws.OPEN) {
          logEstado('⏳', 'Generando código de emparejamiento...', 'yellow');
          let code = await conn.requestPairingCode(phoneNumber);
          code = code?.match(/.{1,4}/g)?.join('-') || code;

          const linea2 = '═'.repeat(40);
          console.log(chalk.yellow(`\n ╔${linea2}╗`));
          console.log(chalk.yellow(' ║') + chalk.bold.white('   🔐  CÓDIGO DE EMPAREJAMIENTO'.padEnd(40)) + chalk.yellow('║'));
          console.log(chalk.yellow(` ╠${linea2}╣`));
          console.log(chalk.yellow(' ║') + chalk.bold.cyan(`      ${code}`.padEnd(40)) + chalk.yellow('║'));
          console.log(chalk.yellow(` ╚${linea2}╝\n`));
        } else {
          logEstado('❌', 'La conexión principal no está abierta, intenta de nuevo', 'red');
        }
      } catch (e) {
        logEstado('❌', 'Error al solicitar el código de emparejamiento', 'red');
        console.log(chalk.gray('     ' + (e.message || e)));
      }
    } else {
      logEstado('❌', 'Tu versión de Baileys no soporta emparejamiento por código', 'red');
    }
  } else {
    logEstado('🔳', 'Generando código QR, escanéalo con tu WhatsApp...', 'yellow');
    conn.ev.on('connection.update', ({ qr }) => {
      if (qr) {
        console.log(chalk.yellow('\n  📱 Escanea este código QR:\n'));
        qrcode.generate(qr, { small: true });
        console.log(chalk.cyan('\n  ⏳ Esperando escaneo...\n'));
      }
    });
  }
}

await handleLogin();

conn.isInit = false;
conn.well = false;

// ══════════════════════════════════════════
// INTERVALO DE OPTIMIZACIÓN DE BASE DE DATOS
// ══════════════════════════════════════════
if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data && global.isDatabaseModified) {
        await global.db.write();
        global.isDatabaseModified = false;
        console.log(chalk.gray('  💾  Base de datos guardada'));
      }
      if (opts['autocleartmp']) {
        const tmp = [tmpdir(), 'tmp', 'serbot'];
        tmp.forEach((filename) => {
          spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']);
        });
      }
    }, 30 * 1000);
  }
}

function clearTmp() {
  const tmp = [join(__dirname, './tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 1) return unlinkSync(file);
    return false;
  });
}

setInterval(() => {
  if (global.stopped === 'close' || !conn || !conn.user) return;
  clearTmp();
  console.log(chalk.gray('  🧹  Limpieza temporal completada'));
}, 180000);

if (typeof global.gc === 'function') {
  setInterval(() => {
    console.log(chalk.gray('  🧠  Optimizando memoria...'));
    global.gc();
  }, 180000);
} else {
  logEstado('⚠️', 'Ejecuta con --expose-gc para optimizar memoria', 'yellow');
}

// ══════════════════════════════════════════
// MANEJAR ACTUALIZACIONES DE CONEXIÓN
// ══════════════════════════════════════════
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update;
  global.stopped = connection;

  if (isNewLogin) {
    conn.isInit = true;
    logEstado('✅', 'Nuevo inicio de sesión detectado', 'green');
  }

  const code =
    lastDisconnect?.error?.output?.statusCode ||
    lastDisconnect?.error?.output?.payload?.statusCode;

  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date();
  }

  if (global.db.data == null) await loadDatabase();

  if (connection === 'open') {
    const linea = '═'.repeat(40);
    console.log(chalk.yellow(`\n ╔${linea}╗`));
    console.log(chalk.yellow(' ║') + chalk.bold.white('   🌼  THEELY-MD CONECTADA'.padEnd(40)) + chalk.yellow('║'));
    console.log(chalk.yellow(` ╠${linea}╣`));
    console.log(chalk.yellow(' ║') + chalk.white(`   👤  ${(conn.user?.name || 'TheEly MD')}`.padEnd(40)) + chalk.yellow('║'));
    console.log(chalk.yellow(' ║') + chalk.white(`   📱  +${(conn.user?.id?.split(':')[0] || 'Desconocido')}`.padEnd(40)) + chalk.yellow('║'));
    console.log(chalk.yellow(` ╚${linea}╝\n`));
  }

  const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

  if (reason === 405) {
    if (existsSync('./sessions/creds.json')) unlinkSync('./sessions/creds.json');
    logEstado('⚠️', 'Conexión reemplazada, reiniciando el proceso...', 'red');
    process.send('reset');
  }

  if (connection === 'close') {
    switch (reason) {
      case DisconnectReason.badSession:
        conn.logger.error(`❌ Sesión incorrecta, elimina la carpeta ${global.authFile}`);
        break;
      case DisconnectReason.connectionClosed:
      case DisconnectReason.connectionLost:
      case DisconnectReason.timedOut:
        conn.logger.warn(`⚠️ Conexión perdida, reconectando...`);
        await global.reloadHandler(true).catch(console.error);
        break;
      case DisconnectReason.connectionReplaced:
        conn.logger.error(`⚠️ Conexión reemplazada, se abrió otra sesión`);
        break;
      case DisconnectReason.loggedOut:
        conn.logger.error(`❌ Sesión cerrada, elimina la carpeta ${global.authFile}`);
        break;
      case DisconnectReason.restartRequired:
        conn.logger.info(`🔄 Reinicio necesario`);
        await global.reloadHandler(true).catch(console.error);
        break;
      default:
        conn.logger.warn(`❓ Desconexión desconocida: ${reason || ''}`);
        await global.reloadHandler(true).catch(console.error);
        break;
    }
  }
}

process.on('uncaughtException', (err) => {
  logEstado('💥', 'Error no capturado en el proceso principal', 'red');
  console.error(err);
});

let isInit = true;

// ══════════════════════════════════════════
// RECARGAR EL HANDLER
// ══════════════════════════════════════════
global.reloadHandler = async function (restartConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Handler && Handler.handler) handler = Handler.handler;
  } catch (e) {
    logEstado('❌', 'Fallo al recargar handler.js', 'red');
    console.error(e);
  }

  if (restartConn) {
    try {
      if (global.conn.ws) global.conn.ws.close();
    } catch {}
    global.conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions);
    envolverAntiRateLimit(global.conn, 'Principal');
    isInit = true;
  }

  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.handler = handler.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);

  isInit = false;
  return true;
};

// ══════════════════════════════════════════
// CARGAR PLUGINS
// ══════════════════════════════════════════
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  logEstado('📂', 'Cargando plugins del sistema...', 'blue');
  let loaded = 0;
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
      loaded++;
    } catch (e) {
      conn.logger.error(`Error al cargar el plugin '${filename}': ${e}`);
      delete global.plugins[filename];
    }
  }
  logEstado('✅', `${loaded} plugins cargados correctamente`, 'green');
}

await filesInit();

// ══════════════════════════════════════════
// WATCH DE PLUGINS
// ══════════════════════════════════════════
global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`🔄 Plugin actualizado - '${filename}'`);
      else {
        conn.logger.warn(`🗑️ Plugin eliminado - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`✨ Nuevo plugin - '${filename}'`);

    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`❌ Error de sintaxis en '${filename}':\n${format(err)}`);
    else {
      try {
        const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`❌ Error al cargar plugin '${filename}':\n${format(e)}`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);

watch(pluginFolder, global.reload);
await global.reloadHandler();

// ══════════════════════════════════════════
// MENSAJE FINAL
// ══════════════════════════════════════════
const lineaFinal = '═'.repeat(46);
console.log(chalk.yellow(`\n ╔${lineaFinal}╗`));
console.log(chalk.yellow(' ║') + chalk.bold.white('         🌼  T H E E L Y - M D'.padEnd(46)) + chalk.yellow('║'));
console.log(chalk.yellow(' ║') + chalk.gray('       Lista y operativa  ·  ¡Bienvenido!'.padEnd(46)) + chalk.yellow('║'));
console.log(chalk.yellow(` ╚${lineaFinal}╝\n`));

if (process.send) process.send('ready');
