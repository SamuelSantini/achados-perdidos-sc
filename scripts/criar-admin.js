#!/usr/bin/env node
// Cria ou atualiza o primeiro admin.
// Uso: node scripts/criar-admin.js <login> <senha>
// Requer .env com SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY.
const fs = require('node:fs');
const path = require('node:path');

const arquivoEnv = path.join(__dirname, '..', '.env');
if (fs.existsSync(arquivoEnv)) {
  process.loadEnvFile(arquivoEnv);
}

const login = String(process.argv[2] || '').trim();
const senha = String(process.argv[3] || '').trim();

if (login.length < 3 || /\s/.test(login) || senha.length < 4) {
  console.error('Uso: node scripts/criar-admin.js <login> <senha>');
  console.error('Login ≥ 3 letras sem espaço; senha ≥ 4 caracteres.');
  process.exit(1);
}

async function main() {
  const db = require('../db');
  const resultado = await db.definirAdmin(login, senha);
  console.log('Admin pronto:', resultado.login, '(' + resultado.papel + ')');
  console.log('Entre no site com esse login e senha para acessar Secretaria.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
