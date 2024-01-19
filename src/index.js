const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const strings = loadStrings(chooseLanguage());

  clearConsole();

  const content = "module.exports = require('./core.asar');";
  const regex = [/app-1\.\d\.\d/i, /discord_desktop_core-\d/i];
  const local = process.env.LOCALAPPDATA;

  console.log(strings.confirmRestart);
  
  const input = readLineSync();

  if (input.toLowerCase() === 'y') {
    main2(local, content, regex, strings);
  } else if (input.toLowerCase() === 'n') {
    console.log(strings.closingProgram);
    process.exit(0);
  } else {
    console.log(strings.invalidResponse);
    process.exit(1);
  }
}

function main2(local, content, regex, strings) {
  fs.readdirSync(local).forEach(e => {
    if (e.includes("iscord")) {
      const path = `${local}/${e}`;
      console.log(`${strings.finding} ${e}! ${strings.verificationInProgress}...`);
      check(path, content, regex, e, strings);
    }
  });
}

function check(path, content, regex, entry, strings) {
  let currentPath = path;
  const discord = entry;
  const local = process.env.LOCALAPPDATA;

  fs.readdirSync(currentPath).forEach(e => {
    if (regex[0].test(e)) {
      currentPath = `${currentPath}/${e}/modules`;
    } else {
      return;
    }

    fs.readdirSync(currentPath).forEach(m => {
      if (regex[1].test(m)) {
        currentPath = `${currentPath}/${m}/discord_desktop_core/index.js`;
      } else {
        return;
      }

      if (fs.readFileSync(currentPath, 'utf8') !== content) {
        fs.copyFileSync(currentPath, `./file/${discord.charAt(0).toLowerCase() + discord.slice(1)}_index_export.js`);
        console.log(`${strings.suspiciousContent} ${discord} /file/${discord}_index.js`);
        console.log(strings.changeIndex);
        fs.writeFileSync(currentPath, content);
        console.log(`${strings.discordSafe} ${discord} ${strings.restarting}....`);
        redem(discord, local, strings);
      } else {
        console.log(`${strings.normalContent} ${discord} x)`);
      }
    });
  });
}

function redem(discord, local, strings) {
  if (execSync('tasklist').toString().split("\r\n").includes(`${discord}.exe`)) {
    execSync(`taskkill /IM ${discord}.exe /F`);
  } else {
    console.log(`${discord} ${strings.notInProcessList}...`);
  }
  console.log(`${strings.starting} ${discord}`);
  execSync(`${local}/${discord}/Update.exe --processStart ${discord}.exe`);
}

function clearConsole() {
  if (process.platform === "win32") {
    execSync('cmd /c cls');
  } else {
    console.clear();
  }
}

function readLineSync() {
  return require('readline-sync').question();
}

function chooseLanguage() {
  console.log('Choose language / Elija idioma:\n1. English\n2. Español');
  const choice = readLineSync();
  if (choice === '1')
    return 'en';
  else if (choice === '2')
    return 'es';
  else
    console.log('Invalid choice. Using default language: English');
  return 'en';
}

function loadStrings(lang) {
  try {
    return JSON.parse(fs.readFileSync(`./src/lang/${lang}.json`, 'utf8'));
  } catch (e) {
    console.error(`Error loading language strings: ${e.message}`);
    process.exit(1);
  }
}

main();
