// ===================================================================
// AUTENTICAÇÃO
// Senhas com bcrypt; sessões como tokens HMAC (Bearer).
// Papéis: admin (secretaria) e usuario (só reivindicar / cadastrar).
// ===================================================================
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

const CUSTO_HASH = 10;
const DIAS_SESSAO = 7;
const PAPEIS = new Set(['admin', 'usuario']);

function segredo() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (!segredo._aviso) {
    console.warn('SESSION_SECRET ausente ou curto; usando valor temporário. Defina SESSION_SECRET no .env (mín. 16 caracteres).');
    segredo._aviso = true;
  }
  return 'dev-somente-local-mude-no-env';
}

function pareceHash(senha) {
  return typeof senha === 'string' && /^\$2[aby]\$\d{2}\$/.test(senha);
}

async function hashSenha(senha) {
  return bcrypt.hash(senha, CUSTO_HASH);
}

async function senhaConfere(senha, armazenada) {
  if (!armazenada) return false;
  if (pareceHash(armazenada)) return bcrypt.compare(senha, armazenada);
  // Migração: senhas antigas em texto claro
  return senha === armazenada;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function emitirToken(usuario) {
  const exp = Math.floor(Date.now() / 1000) + DIAS_SESSAO * 24 * 60 * 60;
  const payload = b64url(JSON.stringify({
    login: usuario.login,
    papel: usuario.papel,
    exp
  }));
  const assinatura = crypto.createHmac('sha256', segredo()).update(payload).digest('base64url');
  return payload + '.' + assinatura;
}

function lerToken(token) {
  if (!token || typeof token !== 'string') return null;
  const partes = token.split('.');
  if (partes.length !== 2) return null;
  const [payload, assinatura] = partes;
  const esperada = crypto.createHmac('sha256', segredo()).update(payload).digest('base64url');
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let dados;
  try {
    dados = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!dados || !dados.login || !PAPEIS.has(dados.papel)) return null;
  if (!dados.exp || dados.exp < Math.floor(Date.now() / 1000)) return null;
  return { login: dados.login, papel: dados.papel };
}

function tokenDoPedido(req) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (m) return m[1].trim();
  if (req.body && typeof req.body.token === 'string') return req.body.token.trim();
  return null;
}

function usuarioPublico(u) {
  return { login: u.login, papel: u.papel };
}

module.exports = {
  PAPEIS,
  hashSenha,
  senhaConfere,
  pareceHash,
  emitirToken,
  lerToken,
  tokenDoPedido,
  usuarioPublico
};
