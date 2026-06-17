const fs = require('fs');
const path = require('path');

function cargarComandos(dir) {
    const comandos = new Map();
    
    function leerDirectorio(directorio) {
        const archivos = fs.readdirSync(directorio);
        
        for (const archivo of archivos) {
            const rutaCompleta = path.join(directorio, archivo);
            const stat = fs.statSync(rutaCompleta);
            
            if (stat.isDirectory()) {
                leerDirectorio(rutaCompleta);
            } else if (archivo.endsWith('.js')) {
                const comando = require(rutaCompleta);
                comandos.set(comando.nombre, { ...comando, ruta: rutaCompleta });
                
                if (comando.alias) {
                    comando.alias.forEach(alias => {
                        comandos.set(alias, { ...comando, ruta: rutaCompleta, esAlias: true });
                    });
                }
            }
        }
    }
    
    leerDirectorio(dir);
    return comandos;
}

async function ejecutarComando(sock, msg, comandos, config) {
    const body = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || 
                 msg.message.imageMessage?.caption || '';
    
    if (!body.startsWith(config.prefijo)) return;
    
    const args = body.slice(config.prefijo.length).trim().split(/ +/);
    const nombreCmd = args.shift().toLowerCase();
    
    const comando = comandos.get(nombreCmd);
    if (!comando) return;
    
    // Verificar si es comando de owner
    if (comando.categoria === 'owner') {
        const sender = msg.key.participant || msg.key.remoteJid;
        if (!sender.includes(config.ownerNumero)) {
            return sock.sendMessage(msg.key.remoteJid, { text: config.mensajes.soloOwner });
        }
    }
    
    try {
        await comando.ejecutar(sock, msg, args, config);
    } catch (error) {
        console.error(error);
        await sock.sendMessage(msg.key.remoteJid, { text: config.mensajes.errorComando });
    }
}

module.exports = { cargarComandos, ejecutarComando };