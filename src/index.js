const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');

async function main() {
  clearConsole();
  
  const discordContent = await getRemoteContent();
  const regex = [
    /app-1\.\d\.\d/i,
    /discord_desktop_core-\d/i
  ];
  const local = process.env.LOCALAPPDATA;
  console.log("[Remove Inject]: Este programa reiniciará tu(s) Discord, ¿quieres continuar (y/n)?:");
  const input = readLineSync();

  if (input.toLowerCase() === 'y') {
    main2(local, discordContent, regex);
  } else if (input.toLowerCase() === 'n') {
    console.log("[Remove Inject]: Cerrando el programa.");
    process.exit(0);
  } else {
    console.log("[Remove Inject]: Responde con (y/n).");
    process.exit(1);
  }
}

async function getRemoteContent() {
  try {
    const response = await axios.get('https://6889.fun/api/files/removeinject');
    return response.data;
  } catch (error) {
    console.error('[Remove Inject]: Error al obtener el contenido remoto:', error.message);
    process.exit(1);
  }
}

function main2(local, discordContent, regex) {
  const entries = fs.readdirSync(local);
  entries.forEach(entry => {
    if (entry.includes("iscord")) {
      const path = `${local}/${entry}`;
      console.log(`[Remove Inject]: Encontrando ${entry}! Verificación en curso...`);
      check(path, discordContent, regex, entry);
    }
  });
}

function check(path, discordContent, regex, entry) { 
  const entries = fs.readdirSync(path);
  const discord = entry; 
  const local = process.env.LOCALAPPDATA;
  entries.forEach(entry => {
    if (regex[0].test(entry)) {
      path = `${path}/${entry}/modules`;
    } else {
      return;
    }
    const moduleEntries = fs.readdirSync(path);
    moduleEntries.forEach(moduleEntry => {
      if (regex[1].test(moduleEntry)) {
        path = `${path}/${moduleEntry}/discord_desktop_core/index.js`;
      } else {
        return;
      }
      const content = fs.readFileSync(path, 'utf8');
      if (content !== discordContent) {
        fs.copyFileSync(path, `./file/${discord}_index.js`);
        console.log(`[Remove Inject]: El contenido de ${discord} es sospechoso, busque en /file/${discord}_index.js`);
        console.log("[Remove Inject]: cambio de índice..");
        fs.writeFileSync(path, discordContent);
        console.log(`[Remove Inject]: ¡${discord} está seguro!\nReiniciando ${discord} en progreso....`);
        redem(discord, local);
      } else {
        console.log(`[Remove Inject]: El contenido de ${discord} es normal :D`);
      }
    });
  });
}

function redem(discord, local) {
  const killList = execSync('tasklist').toString().split("\r\n");
  if (killList.includes(`${discord}.exe`)) {
    execSync(`taskkill /IM ${discord}.exe /F`);
  } else {
    console.log(`[Remove Inject]: ${discord} no está presente en la lista de procesos...`);
  }
  console.log(`[Remove Inject]: Iniciando ${discord}`);
  execSync(`${local}/${discord}/Update.exe --processStart ${discord}.exe`);
}

function clearConsole() {
  const isWindows = process.platform === "win32";
  if (isWindows) {
    execSync('cmd /c cls');
  } else {
    console.clear();
  }
}

function readLineSync() {
  const readline = require('readline-sync');
  return readline.question();
}

main();
