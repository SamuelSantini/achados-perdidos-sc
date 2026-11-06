# Achados e Perdidos

Sistema web para a escola: quem encontra um objeto cadastra no site, e quem perdeu procura e vê como retirar.

**Problema:** objetos são encontrados na escola, mas os alunos não sabem onde procurar nem a quem pedir.
**Solução:** um sistema com cadastro, busca e controle de status de cada objeto.

## Tecnologias

| Parte | Tecnologia | O que faz |
|---|---|---|
| Frontend | HTML, CSS e JavaScript | As telas do site, os formulários e a busca |
| Backend | Node.js + Express | Recebe as requisições, aplica as regras e fala com o banco |
| API | REST com JSON | Comunicação entre o frontend e o backend |
| Banco de dados | Supabase (Postgres) | Projeto `uzvoxpooxbwbokxtfcpi` — tabelas `objetos` e `usuarios` |

## Como rodar

1. Instale o **Node.js** (versão 22.13 ou mais nova; a versão LTS do site nodejs.org serve).
2. Crie um arquivo `.env` nesta pasta (veja `.env.example`) apontando para o projeto Supabase **`uzvoxpooxbwbokxtfcpi`**, e um segredo de sessão:

   ```
   SUPABASE_URL=https://uzvoxpooxbwbokxtfcpi.supabase.co
   SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
   SESSION_SECRET=troque-por-um-segredo-longo
   ```

   A chave publishable/anon sai de **Project Settings → API Keys** no [dashboard](https://supabase.com/dashboard/project/uzvoxpooxbwbokxtfcpi/settings/api). Não commite a chave real.
3. No [SQL Editor](https://supabase.com/dashboard/project/uzvoxpooxbwbokxtfcpi/sql) desse projeto, rode `sql/schema.sql` (cria `objetos`, `usuarios`, coluna `papel` e políticas RLS básicas). Em banco que já tinha `usuarios`, basta `sql/usuarios-auth.sql`.
4. Abra o terminal nesta pasta e rode:

   ```
   npm install
   npm start
   ```

5. Abra **http://localhost:3000** no navegador.

### MCP Supabase (Cursor)

O arquivo `.cursor/mcp.json` aponta o servidor MCP do projeto `uzvoxpooxbwbokxtfcpi` (sem secrets). No Cursor IDE, aprove/conecte o MCP e, se pedir login: `agent mcp login supabase`. Só a config no repo **não** autentica cloud workers.

### Criar o primeiro admin (secretaria)

Com o `.env` configurado e a migração SQL aplicada:

```
npm run criar-admin -- secretaria senha-forte
```

Isso cria (ou atualiza) o login `secretaria` com papel `admin` e senha com hash bcrypt. Entre no site com esse login para ver o menu **Secretaria**.

Contas criadas pelo botão “Criar conta” no site são sempre `usuario` (podem cadastrar achados e reivindicar; não gerenciam).

## Estrutura

```
achados-e-perdidos/
├── server.js            → backend: servidor Express e rotas da API
├── db.js                → banco: objetos + usuarios no Supabase
├── auth.js              → hash de senha e tokens de sessão
├── package.json         → dependências e scripts
├── sql/schema.sql       → schema completo (objetos + usuarios + auth)
├── sql/usuarios-auth.sql→ migração incremental: coluna papel
├── scripts/criar-admin.js → seed do primeiro admin
└── public/              → frontend
    ├── index.html       → as 4 telas + modal de login
    ├── style.css        → o visual
    └── app.js           → lógica das telas e chamadas para a API
```

## Autenticação e papéis

| Papel | Pode |
|---|---|
| `usuario` | Entrar, cadastrar objeto encontrado, reivindicar (marcar como seu) |
| `admin` | Tudo do usuário + editar, excluir, desfazer reserva, confirmar retirada (tela Secretaria) |

- Login/registro: `POST /api/auth/login` e `POST /api/auth/registrar` → devolvem um token Bearer (válido ~7 dias).
- O frontend guarda o token em `localStorage` e manda `Authorization: Bearer …`.
- Senhas são salvas com **bcrypt**. Senhas antigas em texto claro são re-hasheadas no próximo login.

## Telas

- **Início:** apresentação, botões principais e objetos encontrados recentemente
- **Objetos encontrados:** lista com busca e filtros por categoria, local e status; reivindicar exige login
- **Cadastrar:** formulário com foto opcional (usuário logado). O objeto sempre entra disponível e sem dono
- **Secretaria:** só para admin — corrigir, excluir, desfazer reserva ou confirmar retirada

## API (CRUD)

| Método | Endereço | Quem | Resposta |
|---|---|---|---|
| POST | `/api/auth/registrar` | público | 201 |
| POST | `/api/auth/login` | público | 200 |
| GET | `/api/auth/me` | logado | 200 |
| GET | `/api/objetos` | público | 200 |
| GET | `/api/objetos/:id` | público | 200 ou 404 |
| POST | `/api/objetos` | logado | 201 ou 400 |
| PUT | `/api/objetos/:id` | admin | 200, 400, 403 ou 404 |
| POST | `/api/objetos/:id/reivindicar` | logado | 200, 400, 404 ou 409 |
| POST | `/api/objetos/:id/cancelar` | admin | 200, 400, 403, 404 ou 409 |
| POST | `/api/objetos/:id/retirar` | admin | 200, 400, 403, 404 ou 409 |
| DELETE | `/api/objetos/:id` | admin | 204, 403 ou 404 |

Regras: nome, local e data são obrigatórios; a data é real e não pode ser no futuro. Um objeto novo nasce `disponivel` e sem dono. Só um objeto disponível pode ser reservado, e a reserva exige nome e contato do dono. A retirada só é confirmada depois da reserva. Objeto devolvido não volta atrás e não é editado.

## Banco de dados — tabela `objetos`

| Campo | Tipo | Descrição |
|---|---|---|
| id | número (chave primária) | Número do registro, criado automaticamente |
| nome | TEXT | Nome do objeto |
| categoria | TEXT | mochila, garrafa, chaves, estojo, roupa, eletronico, livro ou outros |
| descricao | TEXT | Cor, marca e detalhes |
| local_encontrado | TEXT | Onde foi encontrado |
| data_encontrada | data | Data em que foi encontrado |
| status | TEXT | disponivel (sem dono), aguardando (reserva) ou devolvido (entrega confirmada) |
| dono_nome | TEXT | Nome de quem reservou a retirada. Vazio enquanto está disponível |
| dono_contato | TEXT | Turma ou contato do dono, para a entrega na biblioteca |
| foto | TEXT | Foto enviada no cadastro (opcional) |
| desenho | TEXT | Desenho usado nos objetos de exemplo |
| criado_em | data e hora | Data e hora do cadastro |

## Fluxo

1. Quem encontrou cadastra o objeto. Ele fica **disponível** e sem dono.
2. Quem perdeu abre os detalhes, informa nome e contato e marca a retirada. O objeto fica **aguardando**. A retirada física é sempre na **biblioteca**.
3. A tela Secretaria (admin) confirma a entrega. O objeto fica **devolvido** e o cadastro não muda mais.
4. Uma reserva errada pode ser desfeita, e o objeto volta a ficar disponível.

## Colocar online

O site e a API sobem juntos no **Render**, ligados ao repositório do GitHub. O banco continua no Supabase.

1. Entre em [dashboard.render.com](https://dashboard.render.com) e escolha **New → Blueprint**.
2. Conecte a conta do GitHub e selecione o repositório `achados-perdidos`.
3. O Render lê o arquivo `render.yaml`. Quando pedir, use `SUPABASE_URL=https://uzvoxpooxbwbokxtfcpi.supabase.co`, a chave publishable do dashboard e o `SESSION_SECRET` do `.env` local.
4. Confirme a criação. O endereço público fica no formato `https://achados-perdidos.onrender.com`.

Build: `npm install`. Start: `npm start`. A região é a Virgínia.

No plano grátis o serviço dorme sem visitas. A primeira abertura depois disso pode levar cerca de um minuto. Os objetos não se perdem, porque ficam no Supabase.

### Se a home mostrar “Não deu para carregar os objetos”

1. **Supabase:** no [SQL Editor](https://supabase.com/dashboard/project/uzvoxpooxbwbokxtfcpi/sql), rode `sql/schema.sql` (sem isso a tabela `objetos` não existe e a API responde erro).
2. **Render → Environment:** `SUPABASE_URL=https://uzvoxpooxbwbokxtfcpi.supabase.co`, `SUPABASE_PUBLISHABLE_KEY` = chave publishable/anon do dashboard (não a service_role), `SESSION_SECRET` ≥ 16 caracteres (`openssl rand -hex 32`).
3. **Redeploy** no Render depois de salvar as variáveis.
4. Abra de novo `/api/objetos`: lista JSON = ok; mensagem sobre schema/chave = siga o texto da API.
