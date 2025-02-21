import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import icon from '../../resources/icon.png?asset';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');
  
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.handle('open-directory-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return result;
  });

  ipcMain.on('create-project', async (event, { projectData, path: projectPath }) => {
    try {
      await fs.ensureDir(projectPath);
      const discordBotCode = `
      import { Client, GatewayIntentBits } from 'discord.js';
      import 'dotenv/config';
      
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ]
      });
      
      client.on('ready', () => {
        console.log(\`Logged in as \${client.user?.tag}!\`);
      });
      
      client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
      
        if (message.content === 'ping') {
          await message.reply('pong!');
        }
      });
      
      client.login(process.env.DISCORD_TOKEN);
          `.trim();
      const packageJsonPath = join(projectPath, 'package.json');
      const tsconfigPath = join(projectPath, 'tsconfig.json');
      const srcDir = join(projectPath, 'src');
      const envPath = join(projectPath, '.env');

      const dependencies = await Promise.all(
        projectData.libraries.map(async lib => {
          const packageName = lib.trim();
          const version = await getLatestPackageVersion(packageName);
          return { [packageName]: `^${version}` };
        })
      ).then(results => Object.assign({}, ...results));
      await Promise.all([
        fs.writeJSON(packageJsonPath, {
          name: projectData.name,
          version: '1.0.0',
          main: 'dist/index.js',
          scripts: {
            build: 'tsc',
            start: 'node dist/index.js'
          },
          dependencies: {
            'discord.js': `^${await getLatestPackageVersion('discord.js')}`,
            dotenv: '^16.3.1',
            ...dependencies
          },
          devDependencies: {
            typescript: '^5.0.4',
            '@types/node': '^20.11.7'
          }
        }, { spaces: 2 }),
  
        fs.writeJSON(tsconfigPath, {
          compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            outDir: "dist",
            rootDir: "src"
          },
          include: ["src/**/*.ts"],
          exclude: ["node_modules"]
        }, { spaces: 2 }),
  
        fs.ensureDir(srcDir),
        fs.writeFile(envPath, 'DISCORD_TOKEN=your_token_here\n'),
        
        fs.writeFile(
          join(srcDir, 'index.ts'),
          `import { Client, GatewayIntentBits } from 'discord.js';\nimport 'dotenv/config';\n\n${discordBotCode}`
        )
      ]);
  
      event.sender.send('project-created', true);
      
    } catch (error: any) {
      event.sender.send('project-error', error.message);
    }
  });
  
  async function getLatestPackageVersion(packageName: string) {
    const { execSync } = require('child_process');
    try {
      return execSync(`npm view ${packageName} version`).toString().trim();
    } catch (error) {
      console.error(`Failed to get version for ${packageName}`, error);
      return '14.13.0'
    }
  }


  ipcMain.on('install-dependencies', async (event, projectPath) => {
    const packageJsonPath = join(projectPath, 'package.json');
    
    const waitForFile = async (retries = 5, delay = 1000): Promise<boolean> => {
      for (let i = 0; i < retries; i++) {
        if (fs.existsSync(packageJsonPath)) return true;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return false;
    };
  
    try {
      const fileExists = await waitForFile();
      
      if (!fileExists) {
        throw new Error('فشل إنشاء package.json! تأكد من صلاحيات الكتابة');
      }
  
      const shellConfig = process.platform === 'win32' 
        ? { shell: true, stdio: 'inherit' } 
        : { shell: '/bin/bash', stdio: 'inherit' };
  
      const child : any= spawn('npm', ['install'], {
        cwd: projectPath as any,
        ...shellConfig  as any,
        env: process.env  as any,
      });
  
      child.stdout?.on('data', (data) => {
        event.sender.send('install-progress', data.toString());
      });
  
      child.stderr?.on('data', (data) => {
        event.sender.send('install-progress', data.toString());
      });
  
      child.on('error', (err) => {
        event.sender.send('install-error', `خطأ في التنفيذ: ${err.message}`);
      });
  
      child.on('close', (code) => {
        if (code === 0) {
          event.sender.send('install-complete', true);
        } else {
          event.sender.send('install-error', `فشل التثبيت مع الرمز: ${code}`);
        }
      });
  
    } catch (error: any) {
      event.sender.send('install-error', error.message);
    }
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});