import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}/api/v1/clientes`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForServer(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const online = await isServerRunning();
      if (online) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error('Timeout aguardando inicialização do servidor HTTP'));
      }
    }, 1000);
  });
}

async function main() {
  let serverProcess = null;
  const alreadyRunning = await isServerRunning();

  if (!alreadyRunning) {
    console.log(`🌐 Inicializando servidor Next.js na porta ${PORT} para execução dos testes Newman...`);
    serverProcess = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['next', 'start', '-p', String(PORT)], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
    });

    try {
      await waitForServer();
      console.log('✅ Servidor Next.js pronto e respondendo!');
    } catch (err) {
      if (serverProcess) serverProcess.kill();
      console.error('Falha ao subir o servidor:', err.message);
      process.exit(1);
    }
  } else {
    console.log(`✅ Servidor já em execução em ${BASE_URL}`);
  }

  console.log('\n🚀 Disparando Newman (Postman Collection Runner)...');
  const newmanArgs = [
    'newman',
    'run',
    'tests/newman/santa-mps.postman_collection.json',
    '--env-var',
    `baseUrl=${BASE_URL}`,
    '--reporters',
    'cli',
  ];

  const newman = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', newmanArgs, {
    stdio: 'inherit',
    shell: true,
  });

  newman.on('close', (code) => {
    if (serverProcess) {
      console.log('\n🧹 Encerrando servidor de teste...');
      serverProcess.kill();
    }
    process.exit(code);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
