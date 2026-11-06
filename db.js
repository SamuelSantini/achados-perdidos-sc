// ===================================================================
// BANCO DE DADOS
// Os objetos ficam na tabela "objetos" do projeto Supabase
// uzvoxpooxbwbokxtfcpi (https://uzvoxpooxbwbokxtfcpi.supabase.co).
// O frontend continua falando só com esta API.
//
// Situação de cada objeto:
//   disponivel → sem dono
//   aguardando → um dono reservou a retirada
//   devolvido  → a secretaria confirmou a entrega e o registro trava
//
// Usuários (tabela usuarios): login, senha (bcrypt), papel (admin|usuario).
// ===================================================================
const { createClient } = require('@supabase/supabase-js');
const auth = require('./auth');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Defina SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no arquivo .env.');
  process.exit(1);
}

const supabase = createClient(url, key);

function mensagemDoSupabase(error) {
  const codigo = error && error.code;
  const texto = String((error && error.message) || '');
  const detalhes = String((error && error.details) || '');
  const junto = (texto + ' ' + detalhes).toLowerCase();

  // Tabela/view ausente (schema ainda não aplicado no projeto)
  if (
    codigo === 'PGRST205' ||
    codigo === '42P01' ||
    /could not find the table|relation .* does not exist|schema cache/i.test(junto)
  ) {
    return (
      'Tabela ausente no Supabase. Rode sql/schema.sql no SQL Editor do projeto ' +
      'uzvoxpooxbwbokxtfcpi e tente de novo.'
    );
  }

  // Chave/URL inválida ou JWT rejeitado
  if (
    codigo === 'PGRST301' ||
    /jwt|invalid api key|invalid authentication|failed to parse/i.test(junto)
  ) {
    return (
      'Supabase rejeitou a chave ou a URL. Confira SUPABASE_URL e ' +
      'SUPABASE_PUBLISHABLE_KEY no Render (Project Settings → API Keys).'
    );
  }

  // Projeto pausado / rede / DNS
  if (/fetch failed|enotfound|econnrefused|etimedout|network/i.test(junto)) {
    return (
      'Não foi possível alcançar o Supabase. Confira SUPABASE_URL ' +
      '(https://uzvoxpooxbwbokxtfcpi.supabase.co) e se o projeto está ativo.'
    );
  }

  return 'Não foi possível falar com o Supabase.';
}

function falha(error) {
  console.error(error);
  const err = new Error(mensagemDoSupabase(error));
  err.cause = error;
  err.status = 503;
  throw err;
}

function normalizar(row) {
  if (!row) return row;
  return {
    ...row,
    id: Number(row.id),
    data_encontrada: String(row.data_encontrada).slice(0, 10)
  };
}

function normalizarUsuario(row) {
  if (!row) return null;
  const papel = row.papel === 'admin' ? 'admin' : 'usuario';
  return { login: row.login, papel, senha: row.senha };
}

async function buscarUsuario(login) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('login, senha, papel')
    .eq('login', login)
    .maybeSingle();
  if (error) {
    // Coluna papel ainda não existe: tenta só login/senha
    if (error.code === '42703' || /papel/i.test(error.message || '')) {
      const legado = await supabase
        .from('usuarios')
        .select('login, senha')
        .eq('login', login)
        .maybeSingle();
      if (legado.error) falha(legado.error);
      if (!legado.data) return null;
      return { login: legado.data.login, senha: legado.data.senha, papel: 'usuario' };
    }
    falha(error);
  }
  return normalizarUsuario(data);
}

async function atualizarSenhaHash(login, hash) {
  const { error } = await supabase.from('usuarios').update({ senha: hash }).eq('login', login);
  if (error) falha(error);
}

async function registrarUsuario(login, senha) {
  const existente = await buscarUsuario(login);
  if (existente) return { erro: 'Este login já está em uso. Escolha outro ou entre com a senha.' };

  const hash = await auth.hashSenha(senha);
  const inserir = await supabase
    .from('usuarios')
    .insert({ login, senha: hash, papel: 'usuario' })
    .select('login, papel')
    .maybeSingle();

  if (inserir.error) {
    if (inserir.error.code === '42703' || /papel/i.test(inserir.error.message || '')) {
      const legado = await supabase
        .from('usuarios')
        .insert({ login, senha: hash })
        .select('login')
        .maybeSingle();
      if (legado.error) {
        if (legado.error.code === '23505') return { erro: 'Este login já está em uso. Escolha outro ou entre com a senha.' };
        falha(legado.error);
      }
      return { login: legado.data.login, papel: 'usuario' };
    }
    if (inserir.error.code === '23505') return { erro: 'Este login já está em uso. Escolha outro ou entre com a senha.' };
    falha(inserir.error);
  }
  return { login: inserir.data.login, papel: inserir.data.papel === 'admin' ? 'admin' : 'usuario' };
}

async function autenticar(login, senha) {
  const usuario = await buscarUsuario(login);
  if (!usuario) return { erro: 'Login ou senha incorretos.' };
  const ok = await auth.senhaConfere(senha, usuario.senha);
  if (!ok) return { erro: 'Login ou senha incorretos.' };

  // Migra senha em texto claro para bcrypt no próximo login bem-sucedido
  if (!auth.pareceHash(usuario.senha)) {
    try {
      await atualizarSenhaHash(login, await auth.hashSenha(senha));
    } catch (e) {
      console.error('Não foi possível re-hashear a senha de', login, e);
    }
  }

  return { login: usuario.login, papel: usuario.papel };
}

async function definirAdmin(login, senha) {
  const hash = await auth.hashSenha(senha);
  const existente = await buscarUsuario(login);

  if (existente) {
    const comPapel = await supabase
      .from('usuarios')
      .update({ senha: hash, papel: 'admin' })
      .eq('login', login)
      .select('login, papel')
      .maybeSingle();
    if (comPapel.error) {
      if (comPapel.error.code === '42703' || /papel/i.test(comPapel.error.message || '')) {
        throw new Error(
          'A coluna "papel" ainda não existe. Rode sql/usuarios-auth.sql no SQL Editor do Supabase e tente de novo.'
        );
      }
      falha(comPapel.error);
    }
    return { login: comPapel.data.login, papel: 'admin' };
  }

  const criado = await supabase
    .from('usuarios')
    .insert({ login, senha: hash, papel: 'admin' })
    .select('login, papel')
    .maybeSingle();
  if (criado.error) {
    if (criado.error.code === '42703' || /papel/i.test(criado.error.message || '')) {
      throw new Error(
        'A coluna "papel" ainda não existe. Rode sql/usuarios-auth.sql no SQL Editor do Supabase e tente de novo.'
      );
    }
    falha(criado.error);
  }
  return { login: criado.data.login, papel: 'admin' };
}

async function listarObjetos() {
  const { data, error } = await supabase
    .from('objetos')
    .select('*')
    .order('data_encontrada', { ascending: false })
    .order('id', { ascending: false });
  if (error) falha(error);
  return data.map(normalizar);
}

async function buscarObjeto(id) {
  const { data, error } = await supabase
    .from('objetos')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) falha(error);
  return normalizar(data);
}

async function criarObjeto(objeto) {
  const { data, error } = await supabase
    .from('objetos')
    .insert({
      nome: objeto.nome,
      categoria: objeto.categoria,
      descricao: objeto.descricao,
      local_encontrado: objeto.local_encontrado,
      data_encontrada: objeto.data_encontrada,
      foto: objeto.foto || null
    })
    .select()
    .single();
  if (error) falha(error);
  return normalizar(data);
}

async function atualizarObjeto(id, objeto) {
  const { data, error } = await supabase
    .from('objetos')
    .update({
      nome: objeto.nome,
      categoria: objeto.categoria,
      descricao: objeto.descricao,
      local_encontrado: objeto.local_encontrado,
      data_encontrada: objeto.data_encontrada,
      foto: objeto.foto || null,
      desenho: objeto.desenho || null
    })
    .eq('id', id)
    .neq('status', 'devolvido')
    .select()
    .maybeSingle();
  if (error) falha(error);
  return normalizar(data);
}

async function reivindicarObjeto(id, dono) {
  const { data, error } = await supabase
    .from('objetos')
    .update({
      status: 'aguardando',
      dono_nome: dono.nome,
      dono_contato: dono.contato
    })
    .eq('id', id)
    .eq('status', 'disponivel')
    .select()
    .maybeSingle();
  if (error) falha(error);
  return normalizar(data);
}

async function cancelarReserva(id) {
  const { data, error } = await supabase
    .from('objetos')
    .update({
      status: 'disponivel',
      dono_nome: null,
      dono_contato: null
    })
    .eq('id', id)
    .eq('status', 'aguardando')
    .select()
    .maybeSingle();
  if (error) falha(error);
  return normalizar(data);
}

async function confirmarRetirada(id) {
  const { data, error } = await supabase
    .from('objetos')
    .update({ status: 'devolvido' })
    .eq('id', id)
    .eq('status', 'aguardando')
    .select()
    .maybeSingle();
  if (error) falha(error);
  return normalizar(data);
}

async function excluirObjeto(id) {
  const { data, error } = await supabase
    .from('objetos')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) falha(error);
  return data.length > 0;
}

module.exports = {
  listarObjetos,
  buscarObjeto,
  buscarUsuario,
  registrarUsuario,
  autenticar,
  definirAdmin,
  criarObjeto,
  atualizarObjeto,
  reivindicarObjeto,
  cancelarReserva,
  confirmarRetirada,
  excluirObjeto
};
