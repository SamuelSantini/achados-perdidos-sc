// ===================================================================
// FRONTEND (JavaScript)
// Mostra as telas, lê os formulários e conversa com o backend pela API.
// Toda leitura e gravação passa pela API em /api/objetos.
// ===================================================================
(function () {
  const API = '/api/objetos';
  const AUTH_API = '/api/auth';
  const TOKEN_KEY = 'achados_token';

  // -----------------------------------------------------------------
  // DESENHOS (ícones das categorias e desenhos dos objetos de exemplo)
  // -----------------------------------------------------------------
  const ICONS = {
    mochila: '<path class="f" d="M18 24c0-7 6-12 14-12s14 5 14 12v26a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z"/><path class="n" d="M26 12v-2a6 6 0 0 1 12 0v2"/><rect class="a" x="24" y="34" width="16" height="12" rx="3"/><path class="n" d="M24 39h16"/>',
    garrafa: '<rect class="a" x="27" y="6" width="10" height="7" rx="2"/><path class="f" d="M26 13h12v6c4 2 6 6 6 10v23a5 5 0 0 1-5 5H25a5 5 0 0 1-5-5V29c0-4 2-8 6-10z"/><path class="n" d="M20 34h24M20 44h24"/>',
    chaves: '<circle class="f" cx="22" cy="24" r="12"/><circle class="n" cx="22" cy="24" r="4"/><path class="n" d="M31 32l20 20M43 44l5-5M48 49l4-4"/>',
    estojo: '<rect class="f" x="8" y="22" width="48" height="22" rx="11"/><path class="n" d="M16 30h32"/><circle class="a" cx="50" cy="30" r="3"/>',
    roupa: '<path class="f" d="M22 10l-14 8 6 12 6-3v27h24V27l6 3 6-12-14-8c-2 4-6 6-10 6s-8-2-10-6z"/>',
    eletronico: '<path class="n" d="M12 38v-6a20 20 0 0 1 40 0v6"/><rect class="a" x="8" y="36" width="12" height="18" rx="4"/><rect class="a" x="44" y="36" width="12" height="18" rx="4"/>',
    livro: '<path class="f" d="M14 10h30a6 6 0 0 1 6 6v38H20a6 6 0 0 1-6-6z"/><path class="n" d="M14 48a6 6 0 0 1 6-6h30"/><path class="n" d="M24 20h16M24 27h12"/>',
    outros: '<path class="f" d="M8 30V12a4 4 0 0 1 4-4h18l26 26-22 22z"/><circle class="a" cx="20" cy="20" r="4"/>'
  };
  const SHADOW = '<ellipse cx="120" cy="164" rx="66" ry="8" fill="#000" opacity=".13"/>';
  const ART = {
    'mochila-preta': SHADOW +
      '<path d="M84 58 C70 80 70 130 80 156" stroke="#141417" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      '<path d="M156 58 C170 80 170 130 160 156" stroke="#141417" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      '<path d="M106 42 Q120 18 134 42" stroke="#26262b" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<rect x="74" y="38" width="92" height="122" rx="32" fill="url(#gBlack)"/>' +
      '<path d="M82 74 Q120 46 158 74" stroke="#55555e" stroke-width="2.5" fill="none"/>' +
      '<rect x="152" y="70" width="5" height="12" rx="2" fill="#8a8a94"/>' +
      '<rect x="88" y="100" width="64" height="50" rx="15" fill="#2a2a30" stroke="#3d3d45" stroke-width="2"/>' +
      '<path d="M94 110 H146" stroke="#5c5c66" stroke-width="2"/>' +
      '<rect x="138" y="108" width="4" height="10" rx="2" fill="#8a8a94"/>' +
      '<path d="M140 118 V124" stroke="#c9a27a" stroke-width="1.5"/>' +
      '<circle cx="136" cy="125" r="4" fill="#a8774a"/><circle cx="144" cy="125" r="4" fill="#a8774a"/>' +
      '<circle cx="140" cy="133" r="9" fill="url(#gBrown)"/>' +
      '<circle cx="137" cy="131" r="1.4" fill="#2a1a10"/><circle cx="143" cy="131" r="1.4" fill="#2a1a10"/>' +
      '<ellipse cx="140" cy="136" rx="3.5" ry="2.5" fill="#e8c9a3"/>' +
      '<path d="M84 60 Q86 46 100 42" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none" stroke-linecap="round"/>',

    'garrafa-azul': SHADOW +
      '<rect x="104" y="16" width="32" height="24" rx="7" fill="#1d3a86"/>' +
      '<rect x="104" y="16" width="32" height="6" rx="3" fill="#2b4ea6"/>' +
      '<rect x="108" y="38" width="24" height="10" fill="#2a50ae"/>' +
      '<rect x="92" y="46" width="56" height="114" rx="22" fill="url(#gBlue)"/>' +
      '<rect x="101" y="58" width="9" height="90" rx="4.5" fill="#fff" opacity=".28"/>' +
      '<path d="M126 88 L130.7 97.5 L141 99 L133.5 106.3 L135.3 116.7 L126 111.8 L116.7 116.7 L118.5 106.3 L111 99 L121.3 97.5 Z" fill="#ffd84d" stroke="#e2b200" stroke-width="2" stroke-linejoin="round"/>',

    'chaveiro': SHADOW +
      '<circle cx="104" cy="64" r="20" fill="none" stroke="url(#gSilver)" stroke-width="5"/>' +
      '<path d="M90 80 L80 98" stroke="#b9bcc4" stroke-width="3"/>' +
      '<g transform="translate(116 84) rotate(28)">' +
        '<rect x="8" y="-5" width="60" height="10" rx="3" fill="url(#gSilver)"/>' +
        '<path d="M44 5 V12 H50 V5 M56 5 V14 H62 V5" fill="url(#gSilver)"/>' +
        '<circle cx="0" cy="0" r="16" fill="url(#gSilver)"/><circle cx="-5" cy="0" r="4.5" fill="#8d9099"/>' +
      '</g>' +
      '<g transform="translate(114 80) rotate(72)">' +
        '<rect x="8" y="-4.5" width="54" height="9" rx="3" fill="url(#gGold)"/>' +
        '<path d="M40 4.5 V11 H46 V4.5 M52 4.5 V13 H58 V4.5" fill="url(#gGold)"/>' +
        '<rect x="-14" y="-12" width="24" height="24" rx="7" fill="url(#gGold)"/><circle cx="-6" cy="0" r="4" fill="#9c7a22"/>' +
      '</g>' +
      '<g fill="#f47fb2">' +
        '<circle cx="76" cy="118" r="22"/><circle cx="58" cy="112" r="8"/><circle cx="64" cy="134" r="8"/><circle cx="80" cy="140" r="8"/>' +
        '<circle cx="96" cy="130" r="8"/><circle cx="96" cy="108" r="8"/><circle cx="82" cy="96" r="8"/><circle cx="62" cy="98" r="7"/>' +
      '</g>' +
      '<circle cx="70" cy="110" r="9" fill="#fff" opacity=".25"/>',

    'estojo-rosa': SHADOW +
      '<rect x="84" y="50" width="9" height="40" rx="2" fill="#4c8df5" transform="rotate(-12 88 70)"/>' +
      '<path d="M82 52 L88.5 38 L93 53 Z" fill="#f2d7b0" transform="rotate(-12 88 70)"/>' +
      '<rect x="104" y="42" width="9" height="46" rx="2" fill="#ffcf3d"/>' +
      '<path d="M104 43 L108.5 30 L113 43 Z" fill="#f2d7b0"/><path d="M106.6 35 L108.5 30 L110.4 35 Z" fill="#333"/>' +
      '<rect x="124" y="46" width="9" height="42" rx="2" fill="#3cc28a" transform="rotate(9 128 66)"/>' +
      '<rect x="124" y="40" width="9" height="8" rx="2" fill="#2a8f64" transform="rotate(9 128 66)"/>' +
      '<rect x="142" y="54" width="9" height="36" rx="2" fill="#a46cf0" transform="rotate(16 146 72)"/>' +
      '<rect x="54" y="80" width="132" height="70" rx="32" fill="url(#gPink)"/>' +
      '<path d="M70 94 H170" stroke="#c4407d" stroke-width="3" stroke-dasharray="4 3"/>' +
      '<rect x="168" y="89" width="14" height="10" rx="3" fill="#d9d9df"/><circle cx="186" cy="94" r="4" fill="none" stroke="#d9d9df" stroke-width="2.5"/>' +
      '<path d="M66 108 Q72 96 86 94" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M196 142 Q186 132 192 124 Q198 120 204 124 Q210 132 200 142 Z" fill="#ff4d6d"/>' +
      '<path d="M192 124 L198 118 L204 124" fill="#3cb371"/>' +
      '<circle cx="195" cy="130" r="1" fill="#ffe08a"/><circle cx="201" cy="131" r="1" fill="#ffe08a"/><circle cx="198" cy="136" r="1" fill="#ffe08a"/>',

    'moletom-cinza': SHADOW +
      '<path d="M68 62 L98 46 Q120 60 142 46 L172 62 L200 110 L180 120 L164 96 L164 160 L76 160 L76 96 L60 120 L40 110 Z" fill="url(#gGray)"/>' +
      '<path d="M92 52 Q120 8 148 52 Q140 72 120 74 Q100 72 92 52 Z" fill="#a3a6af"/>' +
      '<ellipse cx="120" cy="56" rx="17" ry="10" fill="#6c6f78"/>' +
      '<path d="M111 66 Q109 80 111 94" stroke="#f0f0f3" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M129 66 Q131 80 129 94" stroke="#f0f0f3" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M94 124 H146 L154 154 H86 Z" fill="#878a93"/>' +
      '<rect x="76" y="152" width="88" height="8" fill="#80838c"/>' +
      '<path d="M42 110 L60 120" stroke="#80838c" stroke-width="6"/><path d="M198 110 L180 120" stroke="#80838c" stroke-width="6"/>',

    'fone-branco': SHADOW +
      '<path d="M96 108 C96 132 116 130 120 140 C124 130 144 132 144 108" stroke="#c9ccd3" stroke-width="6" fill="none"/>' +
      '<path d="M96 108 C96 132 116 130 120 140 C124 130 144 132 144 108" stroke="#f6f6f8" stroke-width="3.5" fill="none"/>' +
      '<path d="M120 140 C120 152 140 156 156 150" stroke="#c9ccd3" stroke-width="6" fill="none"/>' +
      '<path d="M120 140 C120 152 140 156 156 150" stroke="#f6f6f8" stroke-width="3.5" fill="none"/>' +
      '<rect x="154" y="144" width="20" height="11" rx="4" fill="#e9eaee" stroke="#c9ccd3" stroke-width="1.5" transform="rotate(-12 164 150)"/>' +
      '<rect x="172" y="146" width="12" height="4" rx="2" fill="url(#gSilver)" transform="rotate(-12 164 150)"/>' +
      '<rect x="88" y="62" width="16" height="48" rx="8" fill="url(#gWhite)" stroke="#d3d6dd" stroke-width="1.5"/>' +
      '<circle cx="90" cy="56" r="20" fill="url(#gWhite)" stroke="#d3d6dd" stroke-width="1.5"/>' +
      '<circle cx="84" cy="52" r="6" fill="#3a3d45"/>' +
      '<rect x="136" y="62" width="16" height="48" rx="8" fill="url(#gWhite)" stroke="#d3d6dd" stroke-width="1.5"/>' +
      '<circle cx="150" cy="56" r="20" fill="url(#gWhite)" stroke="#d3d6dd" stroke-width="1.5"/>' +
      '<circle cx="156" cy="52" r="6" fill="#3a3d45"/>',

    'caderno-roxo': SHADOW +
      '<rect x="74" y="34" width="104" height="128" rx="6" fill="#efeadf"/>' +
      '<path d="M80 40 H176 M80 46 H176" stroke="#ddd5c4" stroke-width="1"/>' +
      '<rect x="66" y="28" width="106" height="130" rx="8" fill="url(#gPurple)"/>' +
      '<rect x="94" y="54" width="60" height="30" rx="5" fill="#fff" opacity=".92"/>' +
      '<path d="M102 64 H146 M102 74 H140" stroke="#cbbfe6" stroke-width="1.5"/>' +
      '<path d="M104 68 q4 -6 8 0 t8 0 t8 0 t8 0 t8 0" stroke="#4a1f86" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<g fill="none" stroke="#7d818b" stroke-width="3.5" stroke-linecap="round">' +
        '<path d="M60 40 h12"/><path d="M60 52 h12"/><path d="M60 64 h12"/><path d="M60 76 h12"/><path d="M60 88 h12"/>' +
        '<path d="M60 100 h12"/><path d="M60 112 h12"/><path d="M60 124 h12"/><path d="M60 136 h12"/><path d="M60 148 h12"/>' +
      '</g>' +
      '<rect x="150" y="28" width="8" height="130" fill="#4a2490" opacity=".35"/>',

    'guarda-chuva': SHADOW +
      '<rect x="118" y="16" width="4" height="16" rx="2" fill="#2a2a2f"/>' +
      '<path d="M36 104 Q120 0 204 104 Q183 90 162 104 Q141 90 120 104 Q99 90 78 104 Q57 90 36 104 Z" fill="url(#gBlack)"/>' +
      '<path d="M120 30 L78 104 M120 30 L120 104 M120 30 L162 104" stroke="#4a4a54" stroke-width="2" fill="none"/>' +
      '<path d="M120 30 L57 98 M120 30 L183 98" stroke="#3a3a42" stroke-width="1.5" fill="none"/>' +
      '<path d="M66 82 Q86 46 116 36" stroke="#fff" stroke-opacity=".14" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M120 104 V148" stroke="#2a2a2f" stroke-width="4"/>' +
      '<path d="M120 146 Q120 164 106 164 Q94 164 94 152" stroke="#9b6a3c" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<path d="M119 148 Q118 160 108 160" stroke="#c48f5c" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
  };
  function artSvg(k) {
    return '<svg class="art" viewBox="0 0 240 180" aria-hidden="true">' + ART[k] + '</svg>';
  }
  const CATS = {
    mochila: { label: 'Mochila', tint: 'pink' },
    garrafa: { label: 'Garrafa', tint: 'lilac' },
    chaves: { label: 'Chaves', tint: 'mint' },
    estojo: { label: 'Estojo', tint: 'pink' },
    roupa: { label: 'Roupa', tint: 'lilac' },
    eletronico: { label: 'Eletrônico', tint: 'mint' },
    livro: { label: 'Livro ou caderno', tint: 'pink' },
    outros: { label: 'Outros', tint: 'lilac' }
  };
  const STATUS = {
    disponivel: 'Disponível',
    aguardando: 'Aguardando retirada',
    devolvido: 'Devolvido'
  };
  const BASE_LOCAIS = ['Sala 203', 'Sala 105', 'Biblioteca', 'Quadra', 'Pátio', 'Cantina', 'Laboratório', 'Auditório', 'Secretaria'];

  // Dados que vieram do backend
  let objetos = [];
  let sessao = null; // { login, papel } ou null
  let authModo = 'login'; // login | registrar
  let authDepois = null; // callback após login bem-sucedido

  let editingId = null;
  let editingObj = null;
  let confirmingId = null;
  let retirarId = null;
  let formFoto = null;

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const fmtDate = (d) => { if (!d) return ''; const [y, m, dd] = d.split('-'); return dd + '/' + m + '/' + y; };
  const today = () => { const t = new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); };
  const pad4 = (n) => String(n).padStart(4, '0');
  const ehAdmin = () => !!(sessao && sessao.papel === 'admin');
  const estaLogado = () => !!sessao;

  function lerToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
  }
  function salvarToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) { /* storage indisponível */ }
  }

  // -----------------------------------------------------------------
  // COMUNICAÇÃO COM A API
  // -----------------------------------------------------------------
  async function pedido(url, metodo, corpo) {
    let resposta;
    const headers = {};
    const token = lerToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    if (corpo) headers['Content-Type'] = 'application/json';
    try {
      resposta = await fetch(url, {
        method: metodo,
        headers,
        body: corpo ? JSON.stringify(corpo) : undefined
      });
    } catch (e) {
      $('#offline').hidden = false;
      throw new Error('Sem conexão. Tente de novo.');
    }
    $('#offline').hidden = true;
    const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);
    if (!resposta.ok) {
      if (resposta.status === 401 && token) {
        salvarToken('');
        sessao = null;
        atualizarAuthBar();
      }
      throw new Error((dados && dados.erro) || 'Erro ' + resposta.status);
    }
    return dados;
  }

  async function api(metodo, caminho, corpo) {
    return pedido(API + caminho, metodo, corpo);
  }

  async function authApi(metodo, caminho, corpo) {
    return pedido(AUTH_API + caminho, metodo, corpo);
  }

  async function carregarObjetos() {
    objetos = await api('GET', '');
  }

  async function restaurarSessao() {
    const token = lerToken();
    if (!token) {
      sessao = null;
      atualizarAuthBar();
      return;
    }
    try {
      const dados = await authApi('GET', '/me');
      sessao = dados.usuario;
    } catch (e) {
      salvarToken('');
      sessao = null;
    }
    atualizarAuthBar();
  }

  function atualizarAuthBar() {
    const bar = $('#authBar');
    const navSec = $('#navSecretaria');
    if (navSec) navSec.hidden = !ehAdmin();
    if (!bar) return;
    if (!sessao) {
      bar.innerHTML = '<button type="button" class="btn soft small" id="btnEntrar">Entrar</button>';
      return;
    }
    const papel = sessao.papel === 'admin' ? 'admin' : 'usuário';
    bar.innerHTML =
      '<span class="auth-user" title="' + esc(papel) + '">' + esc(sessao.login) + '</span>' +
      '<button type="button" class="btn ghost small" id="btnSair">Sair</button>';
  }

  function abrirAuth(depois) {
    authDepois = typeof depois === 'function' ? depois : null;
    authModo = 'login';
    pintarAuthModal();
    $('#authOverlay').hidden = false;
    $('#aLogin').focus();
  }
  function fecharAuth() {
    $('#authOverlay').hidden = true;
    authDepois = null;
  }
  function pintarAuthModal() {
    const registrar = authModo === 'registrar';
    $('#authTitle').textContent = registrar ? 'Criar conta' : 'Entrar';
    $('#authSub').textContent = registrar
      ? 'Crie um login para reivindicar objetos ou cadastrar achados. Contas novas são de usuário comum.'
      : 'Use seu login para reivindicar um objeto ou cadastrar um achado.';
    $('#authSubmit').textContent = registrar ? 'Criar conta' : 'Entrar';
    $('#authToggle').textContent = registrar ? 'Já tenho conta' : 'Criar conta';
    $('#eALogin').hidden = true;
    $('#eASenha').hidden = true;
    $('#eAuth').hidden = true;
    $('#aLogin').classList.remove('bad');
    $('#aSenha').classList.remove('bad');
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#btnEntrar') || e.target.closest('#btnEntrarCadastro')) {
      e.preventDefault();
      abrirAuth();
    }
    if (e.target.closest('#btnSair')) {
      e.preventDefault();
      salvarToken('');
      sessao = null;
      atualizarAuthBar();
      toast('Você saiu da conta.');
      const v = location.hash.slice(1) || 'inicio';
      if (v === 'gerenciar') go('inicio');
      else route();
    }
  });
  $('#authClose').addEventListener('click', fecharAuth);
  $('#authOverlay').addEventListener('click', (e) => { if (e.target.id === 'authOverlay') fecharAuth(); });
  $('#authToggle').addEventListener('click', () => {
    authModo = authModo === 'login' ? 'registrar' : 'login';
    pintarAuthModal();
  });
  $('#authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const login = $('#aLogin').value.trim();
    const senha = $('#aSenha').value.trim();
    let ruim = false;
    $('#eALogin').hidden = true;
    $('#eASenha').hidden = true;
    $('#eAuth').hidden = true;
    $('#aLogin').classList.remove('bad');
    $('#aSenha').classList.remove('bad');
    if (login.length < 3 || /\s/.test(login)) {
      $('#eALogin').hidden = false; $('#aLogin').classList.add('bad'); ruim = true;
    }
    if (senha.length < 4) {
      $('#eASenha').hidden = false; $('#aSenha').classList.add('bad'); ruim = true;
    }
    if (ruim) return;
    const btn = $('#authSubmit');
    btn.disabled = true;
    const eraRegistro = authModo === 'registrar';
    try {
      const caminho = eraRegistro ? '/registrar' : '/login';
      const dados = await authApi('POST', caminho, { login, senha });
      salvarToken(dados.token);
      sessao = dados.usuario;
      atualizarAuthBar();
      fecharAuth();
      toast(eraRegistro ? 'Conta criada. Bem-vindo, ' + sessao.login + '!' : 'Olá, ' + sessao.login + '!');
      const depois = authDepois;
      authDepois = null;
      if (depois) depois();
      else route();
    } catch (err) {
      $('#eAuth').textContent = err.message;
      $('#eAuth').hidden = false;
    } finally {
      btn.disabled = false;
    }
  });

  // -----------------------------------------------------------------
  // PEDAÇOS DE TELA
  // -----------------------------------------------------------------
  function icon(cat) {
    return '<svg viewBox="0 0 64 64" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' + (ICONS[cat] || ICONS.outros) + '</svg>';
  }
  function picInner(o) {
    if (o.foto) return '<img src="' + esc(o.foto) + '" alt="Foto de ' + esc(o.nome) + '">';
    return o.desenho && ART[o.desenho] ? artSvg(o.desenho) : icon(o.categoria);
  }
  function tint(cat) { return 't-' + ((CATS[cat] || CATS.outros).tint); }
  function catLabel(cat) { return (CATS[cat] || CATS.outros).label; }
  function pill(st) { return '<span class="pill s-' + st + '">' + STATUS[st] + '</span>'; }
  const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';

  function cardHTML(o, opts) {
    const btn = opts && opts.preview ? '<span class="btn primary small" aria-hidden="true">Ver detalhes</span>' : '<button type="button" class="btn primary small" data-detail="' + o.id + '">Ver detalhes</button>';
    return '<article class="card">' +
      '<div class="pic ' + tint(o.categoria) + '">' + picInner(o) + '</div>' +
      '<div class="card-body">' +
        '<span class="cat">' + esc(catLabel(o.categoria)) + '</span>' +
        '<h3>' + esc(o.nome || 'Nome do objeto') + '</h3>' +
        (o.dono_nome && o.status !== 'disponivel'
          ? '<p class="owner">' + (o.status === 'devolvido' ? 'Devolvido para ' : 'Reservado para ') + esc(o.dono_nome) + '</p>'
          : '') +
        '<dl class="meta">' +
          '<div>' + PIN + '<dt>Local</dt><dd>' + esc(o.local_encontrado || 'Local') + '</dd></div>' +
          '<div>' + CAL + '<dt>Data</dt><dd>' + esc(fmtDate(o.data_encontrada) || '--/--/----') + '</dd></div>' +
        '</dl>' +
        '<div class="card-foot">' + pill(o.status) + btn + '</div>' +
      '</div></article>';
  }
  function counts() {
    const c = { total: objetos.length, disponivel: 0, aguardando: 0, devolvido: 0 };
    objetos.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }
  function locais() {
    const set = new Set(BASE_LOCAIS);
    objetos.forEach((o) => o.local_encontrado && set.add(o.local_encontrado));
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
  }
  function erroLista(msg) {
    return '<div class="empty"><b>Não deu para carregar os objetos</b>' + esc(msg) + '</div>';
  }

  // -----------------------------------------------------------------
  // TELA: INÍCIO
  // -----------------------------------------------------------------
  function renderHome() {
    const c = counts();
    $('#tagStats').innerHTML =
      '<div><b>' + c.disponivel + '</b><span>esperando o dono</span></div>' +
      '<div><b>' + c.aguardando + '</b><span>aguardando retirada</span></div>' +
      '<div><b>' + c.devolvido + '</b><span>já devolvidos</span></div>';
    const recent = objetos.filter((o) => o.status !== 'devolvido').slice(0, 4);
    $('#recentGrid').innerHTML = recent.length ? recent.map((o) => cardHTML(o)).join('') :
      '<div class="empty"><b>Nenhum objeto esperando o dono</b>Quando alguém cadastrar um objeto encontrado, ele aparece aqui.</div>';
  }

  // -----------------------------------------------------------------
  // TELA: OBJETOS ENCONTRADOS (consulta)
  // -----------------------------------------------------------------
  function fillFilterSelects() {
    const cat = $('#fCat'), loc = $('#fLocal');
    const cv = cat.value, lv = loc.value;
    cat.innerHTML = '<option value="">Todas</option>' + Object.entries(CATS).map(([k, v]) => '<option value="' + k + '">' + v.label + '</option>').join('');
    const used = [...new Set(objetos.map((o) => o.local_encontrado).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
    loc.innerHTML = '<option value="">Todos</option>' + used.map((l) => '<option value="' + esc(l) + '">' + esc(l) + '</option>').join('');
    cat.value = cv; loc.value = used.includes(lv) ? lv : '';
  }
  function renderAll() {
    const q = norm($('#fBusca').value), cat = $('#fCat').value, loc = $('#fLocal').value, st = $('#fStatus').value;
    const list = objetos.filter((o) =>
      (!q || norm(o.nome).includes(q) || norm(o.descricao).includes(q) || norm(o.dono_nome).includes(q)) &&
      (!cat || o.categoria === cat) && (!loc || o.local_encontrado === loc) && (!st || o.status === st)
    );
    $('#resultCount').textContent = list.length === 1 ? '1 objeto encontrado' : list.length + ' objetos encontrados';
    $('#allGrid').innerHTML = list.length ? list.map((o) => cardHTML(o)).join('') :
      '<div class="empty"><b>Nada por aqui com esses filtros</b>Tente outra palavra ou limpe os filtros. <button type="button" class="linkbtn" id="clearF">Limpar filtros</button></div>';
  }
  ['#fBusca', '#fCat', '#fLocal', '#fStatus'].forEach((s) => $(s).addEventListener('input', renderAll));
  document.addEventListener('click', (e) => {
    if (e.target.id === 'clearF') { $('#fBusca').value = ''; $('#fCat').value = ''; $('#fLocal').value = ''; $('#fStatus').value = ''; renderAll(); }
  });

  // -----------------------------------------------------------------
  // TELA: CADASTRAR / EDITAR (cadastro e alteração)
  // -----------------------------------------------------------------
  $('#iCat').innerHTML = Object.entries(CATS).map(([k, v]) => '<option value="' + k + '">' + v.label + '</option>').join('');

  function formData() {
    return {
      nome: $('#iNome').value.trim(),
      categoria: $('#iCat').value,
      data_encontrada: $('#iData').value,
      local_encontrado: $('#iLocal').value.trim(),
      descricao: $('#iDesc').value.trim(),
      foto: formFoto
    };
  }
  function previewData() {
    const d = formData();
    d.status = editingObj ? editingObj.status : 'disponivel';
    d.dono_nome = editingObj ? editingObj.dono_nome : null;
    return d;
  }
  function currentArt(cat) {
    return editingObj && editingObj.desenho && editingObj.categoria === cat ? editingObj.desenho : null;
  }
  function renderPhotoPrev() {
    const d = previewData();
    const box = $('#photoPrev');
    box.className = 'photo-prev ' + tint(d.categoria);
    const art = currentArt(d.categoria);
    box.innerHTML = formFoto ? '<img src="' + esc(formFoto) + '" alt="Foto escolhida">' : (art ? artSvg(art) : icon(d.categoria));
    $('#rmFoto').hidden = !formFoto;
  }
  function renderLivePreview() {
    const d = previewData();
    $('#livePreview').innerHTML = cardHTML({ ...d, id: 0, desenho: currentArt(d.categoria) }, { preview: true });
    renderPhotoPrev();
  }
  function clearErrors() {
    ['Nome', 'Data', 'Local'].forEach((k) => { $('#e' + k).hidden = true; $('#i' + k).classList.remove('bad'); });
    $('#eData').textContent = 'Escolha a data.';
  }
  function fillForm() {
    clearErrors();
    $('#locais').innerHTML = locais().map((l) => '<option value="' + esc(l) + '"></option>').join('');
    const o = editingObj;
    if (o) {
      $('#formTitle').textContent = 'Editar objeto';
      $('#acesso').hidden = true;
      $('#formSub').textContent = 'Corrija o nome, o lugar ou a descrição.';
      $('#iNome').value = o.nome; $('#iCat').value = o.categoria; $('#iData').value = o.data_encontrada;
      $('#iLocal').value = o.local_encontrado; $('#iDesc').value = o.descricao || '';
      formFoto = o.foto || null;
      $('#submitBtn').textContent = 'Salvar alterações';
      $('#submitBtn').disabled = !ehAdmin();
      $('#cancelEdit').hidden = false;
    } else {
      $('#formTitle').textContent = 'Cadastrar objeto encontrado';
      if (!estaLogado()) {
        $('#acesso').hidden = false;
        $('#acessoHint').textContent = 'Entre com sua conta para cadastrar um objeto encontrado.';
      } else {
        $('#acesso').hidden = true;
      }
      $('#formSub').textContent = estaLogado()
        ? 'Encontrou alguma coisa? Preencha os dados para o dono conseguir achar.'
        : 'Encontrou alguma coisa? Entre na sua conta para cadastrar o objeto.';
      $('#objForm').reset();
      $('#iCat').value = 'mochila';
      $('#iData').value = today();
      formFoto = null;
      $('#submitBtn').textContent = 'Cadastrar objeto';
      $('#submitBtn').disabled = !estaLogado();
      $('#cancelEdit').hidden = true;
    }
    $('#iFoto').value = '';
    $('#iData').max = today();
    renderLivePreview();
  }
  $('#objForm').addEventListener('input', renderLivePreview);
  $('#objForm').addEventListener('change', renderLivePreview);

  // Diminui a foto antes de mandar para o servidor
  function readPhoto(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 640, s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = reject;
        img.src = r.result;
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  $('#iFoto').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try { formFoto = await readPhoto(f); renderLivePreview(); }
    catch (err) { toast('Não deu para abrir essa imagem. Tente uma foto em JPG ou PNG.'); }
  });
  $('#rmFoto').addEventListener('click', () => { formFoto = null; $('#iFoto').value = ''; renderLivePreview(); });
  $('#cancelEdit').addEventListener('click', () => { editingId = null; go('gerenciar'); });

  $('#objForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const d = formData();
    let firstBad = null;
    [['Nome', d.nome], ['Data', d.data_encontrada], ['Local', d.local_encontrado]].forEach(([k, v]) => {
      if (!v) { $('#e' + k).hidden = false; $('#i' + k).classList.add('bad'); firstBad = firstBad || $('#i' + k); }
    });
    if (d.data_encontrada && d.data_encontrada > today()) {
      $('#eData').textContent = 'A data não pode ser no futuro.';
      $('#eData').hidden = false;
      $('#iData').classList.add('bad');
      firstBad = firstBad || $('#iData');
    }
    if (editingId != null && !ehAdmin()) {
      toast('Só a secretaria pode editar objetos.');
      return;
    }
    if (editingId == null && !estaLogado()) {
      abrirAuth(() => { $('#objForm').requestSubmit(); });
      return;
    }
    if (firstBad) { firstBad.focus(); return; }

    const btn = $('#submitBtn');
    btn.disabled = true;
    try {
      if (editingId != null) {
        await api('PUT', '/' + editingId, d);
        toast('Alterações salvas em “' + d.nome + '”.');
        editingId = null;
        go('gerenciar');
      } else {
        await api('POST', '', d);
        toast('“' + d.nome + '” foi cadastrado e já aparece nos achados.');
        go('achados');
      }
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
      if (editingId == null) fillForm();
    }
  });

  // -----------------------------------------------------------------
  // TELA: GERENCIAR (alteração de status e exclusão)
  // -----------------------------------------------------------------
  function renderManage() {
    if (!ehAdmin()) {
      $('#summary').innerHTML = '';
      $('#manageList').innerHTML =
        '<div class="empty" style="margin:16px"><b>Acesso só para a secretaria</b>Entre com uma conta admin para gerenciar objetos.' +
        ' <button type="button" class="linkbtn" id="btnEntrar">Entrar</button></div>';
      return;
    }
    const c = counts();
    $('#summary').innerHTML =
      '<div><b>' + c.total + '</b><span>cadastrados</span></div>' +
      '<div class="k-ok"><b>' + c.disponivel + '</b><span>disponíveis</span></div>' +
      '<div class="k-wait"><b>' + c.aguardando + '</b><span>aguardando retirada</span></div>' +
      '<div class="k-done"><b>' + c.devolvido + '</b><span>devolvidos</span></div>';
    const head = '<div class="list-head"><span></span><span>Objeto</span><span>Local</span><span>Data</span><span>Situação</span><span>Ações</span></div>';
    const rows = objetos.map((o) => {
      const dono = o.dono_nome
        ? '<span class="dono">Dono: ' + esc(o.dono_nome) + ' · ' + esc(o.dono_contato) + '</span>'
        : '<span class="dono">Ainda sem dono</span>';
      const reserva = o.status === 'aguardando'
        ? '<div class="status-actions"><button type="button" class="btn primary small" data-retirar="' + o.id + '">Confirmar retirada</button><button type="button" class="btn ghost small" data-cancelar="' + o.id + '">Desfazer reserva</button></div>'
        : '';
      const confirm = confirmingId === o.id ?
        '<div class="confirm"><span>Excluir <b>' + esc(o.nome) + '</b>? Essa ação não pode ser desfeita.</span><div>' +
        '<button type="button" class="btn danger small" data-del-yes="' + o.id + '">Excluir</button>' +
        '<button type="button" class="btn ghost small" data-del-no>Cancelar</button></div></div>' : '';
      const confirmarRetirada = retirarId === o.id ?
        '<div class="confirm"><span>Confirmar que <b>' + esc(o.dono_nome) + '</b> já retirou <b>' + esc(o.nome) + '</b>?</span><div>' +
        '<button type="button" class="btn primary small" data-retirar-yes="' + o.id + '">Confirmar</button>' +
        '<button type="button" class="btn ghost small" data-retirar-no>Voltar</button></div></div>' : '';
      const editar = o.status === 'devolvido' ? '' :
        '<button type="button" class="icon-btn" data-edit="' + o.id + '" aria-label="Editar ' + esc(o.nome) + '" title="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button>';
      return '<div class="item">' +
        '<div class="thumb ' + tint(o.categoria) + '">' + picInner(o) + '</div>' +
        '<div class="name"><b>' + esc(o.nome) + '</b><span>#' + pad4(o.id) + ' · ' + esc(catLabel(o.categoria)) + '</span></div>' +
        '<div class="meta-line"><span>' + esc(o.local_encontrado) + '</span><span>' + fmtDate(o.data_encontrada) + '</span></div>' +
        '<div class="local">' + esc(o.local_encontrado) + '</div>' +
        '<div class="date">' + fmtDate(o.data_encontrada) + '</div>' +
        '<div class="status">' + pill(o.status) + dono + reserva + '</div>' +
        '<div class="acts">' +
          '<button type="button" class="icon-btn" data-detail="' + o.id + '" aria-label="Ver ' + esc(o.nome) + '" title="Ver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
          editar +
          '<button type="button" class="icon-btn del" data-del="' + o.id + '" aria-label="Excluir ' + esc(o.nome) + '" title="Excluir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg></button>' +
        '</div>' + confirm + confirmarRetirada +
      '</div>';
    }).join('');
    $('#manageList').innerHTML = objetos.length ? head + rows :
      '<div class="empty" style="margin:16px"><b>Nenhum objeto cadastrado</b>Use a página Cadastrar para adicionar o primeiro.</div>';
  }
  async function recarregar(mensagem) {
    await carregarObjetos();
    const v = location.hash.slice(1) || 'inicio';
    if (v === 'inicio') renderHome();
    if (v === 'achados') { fillFilterSelects(); renderAll(); }
    if (v === 'gerenciar') renderManage();
    if (mensagem) toast(mensagem);
  }

  // -----------------------------------------------------------------
  // CLIQUES (ver, editar, reservar, retirar, excluir)
  // -----------------------------------------------------------------
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-detail],[data-edit],[data-del],[data-del-yes],[data-del-no],[data-reset],[data-retirar],[data-retirar-yes],[data-retirar-no],[data-cancelar]');
    if (!t) return;
    if (t.hasAttribute('data-reset')) {
      editingId = null;
      if (t.getAttribute('href') === location.hash || (t.getAttribute('href') === '#inicio' && !location.hash)) { e.preventDefault(); route(); }
      return;
    }
    if (t.dataset.detail) openDetail(+t.dataset.detail);
    else if (t.dataset.edit) {
      if (!ehAdmin()) { toast('Só a secretaria pode editar objetos.'); return; }
      const o = objetos.find((x) => x.id === +t.dataset.edit);
      if (o && o.status === 'devolvido') { toast('Objeto já devolvido não pode ser alterado.'); return; }
      editingId = +t.dataset.edit;
      confirmingId = null;
      retirarId = null;
      go('cadastrar');
    }
    else if (t.dataset.del) {
      if (!ehAdmin()) { toast('Só a secretaria pode excluir objetos.'); return; }
      confirmarId(+t.dataset.del);
    }
    else if (t.hasAttribute('data-del-no')) { const id = confirmingId; confirmingId = null; renderManage(); const b = document.querySelector('[data-del="' + id + '"]'); if (b) b.focus(); }
    else if (t.dataset.delYes) {
      const id = +t.dataset.delYes;
      const o = objetos.find((x) => x.id === id);
      t.disabled = true;
      try {
        await api('DELETE', '/' + id);
        await carregarObjetos();
        toast('“' + (o ? o.nome : 'Objeto') + '” foi excluído.');
      } catch (err) {
        toast(err.message);
      }
      confirmingId = null;
      renderManage();
    }
    else if (t.dataset.retirar) { confirmarRetirada(+t.dataset.retirar); }
    else if (t.hasAttribute('data-retirar-no')) { const id = retirarId; retirarId = null; renderManage(); const b = document.querySelector('[data-retirar="' + id + '"]'); if (b) b.focus(); }
    else if (t.dataset.retirarYes) {
      const id = +t.dataset.retirarYes;
      const o = objetos.find((x) => x.id === id);
      retirarId = null;
      t.disabled = true;
      try {
        await api('POST', '/' + id + '/retirar');
        await recarregar('Retirada de “' + (o ? o.nome : 'objeto') + '” confirmada' + (o && o.dono_nome ? ' para ' + o.dono_nome : '') + '.');
        if (!$('#overlay').hidden) openDetail(id);
      } catch (err) {
        toast(err.message);
        renderManage();
      }
    }
    else if (t.dataset.cancelar) {
      const id = +t.dataset.cancelar;
      const o = objetos.find((x) => x.id === id);
      t.disabled = true;
      try {
        await api('POST', '/' + id + '/cancelar');
        await recarregar('A reserva de “' + (o ? o.nome : 'objeto') + '” foi desfeita.');
        if (!$('#overlay').hidden) openDetail(id);
      } catch (err) {
        toast(err.message);
        if (!$('#overlay').hidden) openDetail(id);
      }
    }
  });

  function confirmarId(id) {
    confirmingId = id;
    retirarId = null;
    renderManage();
    const y = document.querySelector('[data-del-yes]');
    if (y) y.focus();
  }
  function confirmarRetirada(id) {
    retirarId = id;
    confirmingId = null;
    renderManage();
    const y = document.querySelector('[data-retirar-yes]');
    if (y) y.focus();
  }

  // -----------------------------------------------------------------
  // JANELA DE DETALHES
  // -----------------------------------------------------------------
  let lastFocus = null;
  function blocoDono(o) {
    if (o.status === 'disponivel') {
      if (!estaLogado()) {
        return '<div class="claim">' +
          '<p class="retirada">É seu? Entre na sua conta para reivindicar e marcar a retirada na secretaria.</p>' +
          '<button type="button" class="btn primary" id="btnEntrarClaim">Entrar para reivindicar</button>' +
        '</div>';
      }
      return '<form class="claim" id="claimForm">' +
        '<p class="retirada">É seu? Diga seu nome e um contato. O objeto fica reservado para você retirar na secretaria.</p>' +
        '<div class="field"><label for="cNome">Seu nome <span class="req">*</span></label><input class="input" id="cNome" maxlength="60" autocomplete="name" value="' + esc(sessao.login) + '"><span class="err" id="eDono" hidden>Escreva seu nome.</span></div>' +
        '<div class="field"><label for="cContato">Contato ou turma <span class="req">*</span></label><input class="input" id="cContato" maxlength="80" placeholder="Ex.: 8º ano B"><span class="err" id="eContato" hidden>Diga um contato para a secretaria.</span></div>' +
        '<button type="submit" class="btn primary" id="claimBtn">Sou o dono e quero retirar</button>' +
      '</form>';
    }
    if (o.status === 'aguardando') {
      const desfazer = ehAdmin()
        ? '<button type="button" class="btn ghost small" data-cancelar="' + o.id + '">Desfazer esta reserva</button>'
        : '';
      return '<p class="retirada">Reservado para <b>' + esc(o.dono_nome) + '</b>. A retirada é na secretaria.</p>' + desfazer;
    }
    return '<p class="retirada">Este objeto foi devolvido para <b>' + esc(o.dono_nome) + '</b>.</p>';
  }
  function openDetail(id) {
    const o = objetos.find((x) => x.id === id);
    if (!o) return;
    if ($('#overlay').hidden && document.activeElement && document.activeElement !== document.body) lastFocus = document.activeElement;
    $('#modal').innerHTML =
      '<div class="pic ' + tint(o.categoria) + '">' + picInner(o) + '</div>' +
      '<div class="modal-body">' +
        '<button type="button" class="icon-btn close" id="mClose" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<span class="cat">' + esc(catLabel(o.categoria)) + '</span>' +
        '<h2 id="mTitle">' + esc(o.nome) + '</h2>' +
        pill(o.status).replace('class="pill', 'style="justify-self:start" class="pill') +
        (o.descricao ? '<p class="desc">' + esc(o.descricao) + '</p>' : '') +
        '<dl class="meta">' +
          '<div>' + PIN + '<dt>Local</dt><dd>Encontrado em ' + esc(o.local_encontrado) + '</dd></div>' +
          '<div>' + CAL + '<dt>Data</dt><dd>' + fmtDate(o.data_encontrada) + '</dd></div>' +
        '</dl>' +
        blocoDono(o) +
        '<span class="code">Registro #' + pad4(o.id) + '</span>' +
      '</div>';
    $('#overlay').hidden = false;
    $('#mClose').addEventListener('click', closeDetail);
    const form = $('#claimForm');
    const btnClaim = $('#btnEntrarClaim');
    if (form) {
      form.addEventListener('submit', (e) => enviarReserva(e, o.id));
      $('#cNome').focus();
    } else if (btnClaim) {
      btnClaim.addEventListener('click', () => {
        abrirAuth(() => openDetail(o.id));
      });
      btnClaim.focus();
    } else {
      $('#mClose').focus();
    }
  }
  async function enviarReserva(e, id) {
    e.preventDefault();
    const nome = $('#cNome').value.trim();
    const contato = $('#cContato').value.trim();
    let ruim = false;
    $('#eDono').hidden = !!nome;
    $('#cNome').classList.toggle('bad', !nome);
    $('#eContato').hidden = !!contato;
    $('#cContato').classList.toggle('bad', !contato);
    if (!nome) ruim = true;
    if (!contato) ruim = true;
    if (ruim) { (nome ? $('#cContato') : $('#cNome')).focus(); return; }
    const alvo = objetos.find((x) => x.id === id);
    const btn = $('#claimBtn');
    btn.disabled = true;
    try {
      await api('POST', '/' + id + '/reivindicar', { dono_nome: nome, dono_contato: contato });
      await recarregar('“' + (alvo ? alvo.nome : 'Objeto') + '” ficou reservado para ' + nome + '. A retirada é na secretaria.');
      openDetail(id);
    } catch (err) {
      toast(err.message);
      try { await recarregar(); openDetail(id); } catch (e2) { /* a lista antiga continua na tela */ }
    }
  }
  function closeDetail() {
    $('#overlay').hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#overlay').addEventListener('click', (e) => { if (e.target.id === 'overlay') closeDetail(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#authOverlay').hidden) fecharAuth();
    else if (!$('#overlay').hidden) closeDetail();
  });

  // -----------------------------------------------------------------
  // AVISO RÁPIDO (toast)
  // -----------------------------------------------------------------
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.hidden = true; }, 3200);
  }

  // -----------------------------------------------------------------
  // NAVEGAÇÃO ENTRE AS TELAS
  // Cada tela busca os dados atualizados no backend antes de aparecer.
  // -----------------------------------------------------------------
  const VIEWS = ['inicio', 'achados', 'cadastrar', 'gerenciar'];
  function go(v) {
    if (location.hash.slice(1) === v) route(); else location.hash = v;
  }
  async function route() {
    let v = location.hash.slice(1);
    if (!VIEWS.includes(v)) v = 'inicio';
    if (v === 'gerenciar' && !ehAdmin()) {
      toast('A Secretaria é só para contas admin.');
      if ((location.hash.slice(1) || 'inicio') !== 'inicio') location.hash = 'inicio';
      return;
    }
    if (v !== 'cadastrar') { editingId = null; editingObj = null; }
    if (v !== 'gerenciar') { confirmingId = null; retirarId = null; }
    document.querySelectorAll('[data-view]').forEach((s) => { s.hidden = s.dataset.view !== v; });
    document.querySelectorAll('.nav a').forEach((a) => {
      if (a.getAttribute('href') === '#' + v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (!$('#overlay').hidden) closeDetail();
    window.scrollTo(0, 0);

    if (v === 'cadastrar') {
      editingObj = null;
      if (editingId != null) {
        if (!ehAdmin()) {
          toast('Só a secretaria pode editar objetos.');
          editingId = null;
          go('inicio');
          return;
        }
        try { editingObj = await api('GET', '/' + editingId); }
        catch (err) { toast(err.message); editingId = null; }
        if (editingObj && editingObj.status === 'devolvido') {
          toast('Objeto já devolvido não pode ser alterado.');
          editingId = null;
          editingObj = null;
          go('gerenciar');
          return;
        }
      }
      fillForm();
      return;
    }

    const alvo = { inicio: '#recentGrid', achados: '#allGrid', gerenciar: '#manageList' }[v];
    try {
      await carregarObjetos();
    } catch (err) {
      $(alvo).innerHTML = erroLista(err.message);
      return;
    }
    if (v === 'inicio') renderHome();
    if (v === 'achados') { fillFilterSelects(); renderAll(); }
    if (v === 'gerenciar') renderManage();
  }
  window.addEventListener('hashchange', route);
  restaurarSessao().then(route);
})();
