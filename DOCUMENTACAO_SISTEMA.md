# Rede Inspire — Documentação do Sistema

**Última atualização:** Julho 2026

---

## 1. Visão Geral

A Plataforma Rede Inspire é um sistema de conteúdo, treinamento e gestão para igrejas. Permite que pastores, líderes e membros acessem materiais, vídeos, trilhas de aprendizado, mentorias, e ferramentas de planejamento ministerial.

### URLs

| Recurso | URL |
|---------|-----|
| Frontend (produção) | https://d38f9wnqgvzwjc.cloudfront.net |
| API Backend | https://h28wyjr7u7.execute-api.us-east-1.amazonaws.com |
| GitHub | https://github.com/recursos-redeinspire/redeinspire |

---

## 2. Infraestrutura AWS

| Serviço | Recurso | Region |
|---------|---------|--------|
| Lambda | `rede-inspire-api` | us-east-1 |
| S3 (Frontend) | `rede-inspire-platform-danilo` | us-east-1 |
| S3 (Uploads) | `rede-inspire-uploads-danilo` | us-east-1 |
| CloudFront | `E1JVLCNJ8N0DDH` | Global |
| DynamoDB | Múltiplas tabelas `RedeInspire-*` | us-east-1 |
| Bedrock (IA) | Llama 3.1 8B | us-east-1 |

**Profile AWS:** `--profile danilo`

---

## 3. Estrutura do Projeto

```
PlataformaRedeInspire/
├── frontend/                    # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── contexts/            # AuthContext, DataContext, ThemeContext
│   │   ├── i18n/                # Internacionalização (PT, EN, ES)
│   │   ├── pages/               # Páginas da aplicação
│   │   └── store/               # Local storage helpers
│   ├── capacitor.config.ts      # Config app mobile (Android/iOS)
│   ├── android/                 # Projeto Android (Capacitor)
│   └── ios/                     # Projeto iOS (Capacitor)
├── backend/                     # TypeScript source (referência)
├── backend-deploy/              # Lambda deploy (index.mjs único)
│   ├── index.mjs                # Todas as rotas e lógica
│   ├── node_modules/            # Dependências
│   └── package.json
├── APP_MOBILE.md                # Guia de publicação mobile
├── DIAGRAMA_TABELAS.md          # Esquema DynamoDB
└── DOCUMENTACAO_SISTEMA.md      # Este arquivo
```

---

## 4. Páginas do Sistema

### Públicas
| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | LoginPage | Autenticação + integração Conexa.app |

### Protegidas (requerem login)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | HomePage | Dashboard pessoal, vídeos em destaque, trilhas, ranking |
| `/catalogo` | CatalogPage | Catálogo Prime Video (hero + rows por categoria + player) |
| `/conteudo/:id` | ContentPlayerPage | Player de conteúdo específico |
| `/trilhas` | TrailsPage | Trilhas de aprendizado com progresso |
| `/mentorias` | MentoringPage | Webinars e sessões de mentoria |
| `/planejamento` | PlanningPage | Calendário + Monte sua Celebração + Plano Anual + Ministério |
| `/materiais` | MaterialsPage | Materiais Dropbox (hero, pastas, vídeos, preview, IA) |
| `/mapa` | MapPage | Mapa de igrejas da rede |
| `/dashboard` | DashboardPage | Métricas e analytics |
| `/mensagens` | MessagesPage | Sistema de mensagens |
| `/podcast` | PodcastPage | Podcast com progresso de escuta |
| `/lideres` | LeadersPage | Gestão de líderes (admin/pastor) |
| `/registro` | RegisterPage | Cadastro de novos usuários |
| `/gestao` | ManagementPage | Gestão de ministérios e igrejas |
| `/admin` | AdminPage | Painel administrativo |
| `/busca` | SearchPage | Busca global |

### Previews (temporárias)
| Rota | Descrição |
|------|-----------|
| `/preview-materiais-cards` | Nova visualização de pastas estilo Life.Church |
| `/preview-new` | Preview de UI |
| `/preview-dark` | Preview modo escuro |
| `/preview-editorial` | Preview editorial |

---

## 5. Funcionalidades Principais

### 5.1 Catálogo de Vídeos (`/catalogo`)
- Visual estilo Prime Video (fundo escuro, hero rotativo)
- Rows horizontais por categoria com hover cards
- 10 categorias: Continue assistindo, Adicionados Recentemente, Mais assistidos, Treinamento de Boas-Vindas, Materiais Semanais, Materiais de Ministérios, Materiais para Liderança, Materiais para Igreja, Propósitos para Igreja, Fique por Dentro!
- Admin pode categorizar vídeos (múltiplas categorias por vídeo)
- Primeiros 6 de cada row não repetem os da row anterior
- Player com comentários, tags, indicações, thumbnail customizada
- Busca inteligente com keywords (smartSearch via Bedrock)

### 5.2 Materiais (`/materiais`)
- Integração com Dropbox (browse, download, busca)
- Hero banner com busca integrada
- Pastas com cards coloridos (gradientes temáticos)
- "Mais baixados" — top 5 pastas com thumbnails
- Split view: vídeo/preview à esquerda + lista à direita
- Admin pode vincular vídeos YouTube a pastas
- Resumo automático via IA (Bedrock) a partir do .docx
- Tags por pasta (admin)
- Thumbnails customizáveis por pasta
- Conteúdos relacionados (pastas irmãs) com thumbs

### 5.3 Planejamento (`/planejamento`)
- Calendário mensal interativo com eventos coloridos
- Navegação por mês/ano + botão "Hoje"
- Clique no dia → modal com detalhes completos
- Monte sua Celebração (louvor, mensagem, material vinculado)
- Busca de materiais por autocomplete (Dropbox)
- Visualização do documento vinculado (PDF/DOC/DOCX embutido)
- Impressão completa (info + documento)
- Plano Anual (metas, eventos, notas)
- Plano de Ministério (objetivos, recursos)
- Sidebar: próximos eventos + lista de planos

### 5.4 Sistema de Pontos e Gamificação
- Pontos por atividades (assistir, comentar, completar trilha)
- Ranking de usuários
- Exibição no header e na home

### 5.5 Integração Conexa.app
- Verificação de inadimplência no login
- Bloqueio de acesso para inadimplentes

### 5.6 Assistente IA (Bedrock)
- Chat flutuante em todas as páginas
- Recomendação de conteúdos baseada no contexto
- Resumo de mensagens a partir de documentos

---

## 6. API Backend — Endpoints

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login (email + senha) |
| POST | `/auth/register` | Registro de novo usuário |
| POST | `/auth/change-password` | Alterar senha |
| GET | `/auth/profile` | Perfil do usuário |
| GET | `/auth/leaders` | Listar líderes |

### Conteúdo
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/content` | Listar conteúdos |
| POST | `/content` | Criar conteúdo |
| GET | `/content/trending` | Trending |
| GET | `/content/top10` | Top 10 |
| GET | `/content/releases` | Recentes |

### YouTube
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/youtube/videos` | Listar vídeos do canal |
| GET | `/youtube/search` | Busca no canal |
| GET | `/youtube/smart-search` | Busca inteligente (Bedrock) |

### Tags e Categorias de Vídeo
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/video-tags` | Tags por vídeo |
| GET | `/video-tags/all` | Todas as tags |
| GET/POST | `/video-categories` | Categorias do catálogo (admin) |
| POST | `/video-thumbnail` | Thumbnail customizada |
| GET | `/video-thumbnails` | Todas as thumbnails |
| GET/POST | `/video-recs` | Indicações por vídeo |

### Materiais (Dropbox)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/dropbox/sync` | Sincronizar com Dropbox |
| GET | `/dropbox/browse` | Navegar pastas |
| POST | `/dropbox/download` | Link temporário de download |
| GET | `/dropbox/smart-search` | Busca inteligente |
| POST | `/dropbox/track-download` | Rastrear download |
| GET | `/dropbox/top-downloads` | Top pastas baixadas |
| POST | `/dropbox/file-text` | Extrair texto de doc/docx (+ resumo IA) |

### Pastas (Materiais)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/folder-videos` | Vídeos vinculados a pastas |
| GET/POST | `/folder-thumbnails` | Thumbnails de pastas |
| GET/POST | `/folder-tags` | Tags de pastas |
| GET | `/folder-tags/all` | Todas as tags de pastas |

### Planejamento
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/planning` | Listar planos do usuário |
| POST | `/planning` | Salvar plano |
| PUT | `/planning/:id` | Atualizar plano |
| DELETE | `/planning/:id` | Excluir plano |

### Trilhas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/trails` | Listar trilhas |
| POST | `/trails` | Criar trilha |
| POST | `/trails/:id/enroll` | Inscrever-se |
| POST | `/trails/:id/start` | Iniciar |

### Mentorias e Webinars
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/mentoring/webinars` | Webinars |
| POST | `/mentoring/webinars/:id/enroll` | Inscrever-se |
| GET/POST | `/mentoring/sessions` | Sessões de mentoria |

### Mensagens
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/messages` | Listar mensagens |
| POST | `/messages` | Enviar mensagem |
| GET | `/messages/unread-count` | Contagem não lidas |
| POST | `/messages/read` | Marcar como lida |

### Dashboard e Pontos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dashboard/metrics` | Métricas |
| GET | `/dashboard/ranking` | Ranking |
| GET | `/points/me` | Meus pontos |
| GET | `/points/ranking` | Ranking de pontos |

### Admin
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/analytics` | Analytics |
| GET | `/admin/reports` | Relatórios |
| GET/POST | `/banner` | Banner de avisos |

### Notion (kanban interno da equipe)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/notion/status` | Testa a conexão com o token configurado |
| POST | `/notion/spaces` | Cria uma página dentro de um workspace já existente (admin/pastor/líder) |
| POST | `/notion/boards` | Cria um database Kanban (admin/pastor/líder) |
| GET | `/notion/boards/:databaseId/cards` | Lista os cards do board |
| POST | `/notion/boards/:databaseId/cards` | Cria um card no board |
| POST | `/notion/cards/:pageId/move` | Move o card entre colunas (atualiza Status) |
| PUT | `/notion/cards/:pageId` | Atualiza dados do card |
| DELETE | `/notion/cards/:pageId` | Arquiva o card (admin/pastor/líder) — Notion não suporta exclusão real via API |
| GET | `/notion/team` | Lista os membros do workspace conectado |

> A API do Notion não permite criar workspaces nem convidar/remover membros — ambas as operações são exclusivas da UI do Notion. `/notion/spaces` cria uma página dentro de um workspace já conectado à integração, e `/notion/team` apenas lista quem já faz parte dele.

---

## 7. Tabelas DynamoDB

| Tabela | Chave | Uso |
|--------|-------|-----|
| RedeInspire-Users | id | Usuários |
| RedeInspire-Content | contentId | Conteúdos |
| RedeInspire-Trails | id | Trilhas |
| RedeInspire-TrailProgress | id | Progresso nas trilhas |
| RedeInspire-Messages | id | Mensagens |
| RedeInspire-Churches | id | Igrejas |
| RedeInspire-Plans | id | Planejamentos |
| RedeInspire-Mentoring | id | Mentorias |
| RedeInspire-Podcast | id | Podcasts |
| RedeInspire-PodcastProgress | id | Progresso podcast |
| RedeInspire-Webinars | id | Webinars |
| RedeInspire-Timeline | id | Timeline |
| RedeInspire-Ministries | id | Ministérios |
| RedeInspire-Materials | id | Materiais |
| RedeInspire-Comments | id | Comentários |
| RedeInspire-VideoTags | videoId | Tags, categorias, thumbs, resumos |
| RedeInspire-VideoRecommendations | videoId | Indicações por vídeo |
| RedeInspire-Downloads | filePath | Tracking de downloads |
| RedeInspire-ConexaCache | id | Cache Conexa.app |

### Chaves especiais na tabela VideoTags
| videoId | Conteúdo |
|---------|----------|
| `__CATALOG_CATEGORIES__` | Atribuição de vídeos a categorias do catálogo |
| `__FOLDER_VIDEOS__` | Vídeos vinculados a pastas de materiais |
| `__FOLDER_THUMBNAILS__` | Thumbnails customizadas de pastas |
| `__FOLDER_TAGS__` | Tags de pastas de materiais |
| `__FOLDER_SUMMARIES__` | Resumos IA gerados das pastas |

---

## 8. Integrações Externas

| Serviço | Uso |
|---------|-----|
| YouTube Data API v3 | Listagem e busca de vídeos do canal |
| Dropbox API v2 | Materiais (browse, download, search) |
| Amazon Bedrock (Llama 3.1) | Busca inteligente, resumos, assistente |
| Conexa.app | Verificação de inadimplência |
| Google Docs Viewer | Preview de PDFs |
| Microsoft Office Online | Preview de DOC/DOCX/PPT |
| Notion API | Kanban interno da equipe (páginas, databases, cards) — token em `NOTION_API_TOKEN` |

---

## 9. Roles e Permissões

| Role | Acesso |
|------|--------|
| `admin` | Tudo (gerenciar usuários, categorias, conteúdo, configurações) |
| `pastor_presidente` | Gestão da igreja, líderes, planejamento |
| `lider` | Conteúdo liberado por permissões + planejamento |
| `membro` | Conteúdo básico, trilhas, podcast |

---

## 10. Deploy

### Backend
```bash
cd backend-deploy
rm -f function.zip
zip -r function.zip index.mjs node_modules/ package.json
aws lambda update-function-code --function-name rede-inspire-api \
  --zip-file fileb://function.zip --region us-east-1 --profile danilo
```

`update-function-code` não altera variáveis de ambiente, então é seguro para deploys do dia a dia. Para configurar o token do Notion (uma única vez, ou sempre que ele for rotacionado), use `update-function-configuration` **mesclando** as variáveis já existentes (Dropbox, YouTube, JWT_SECRET) com a nova — nunca substitua o mapa inteiro, como faz `deploy-backend.sh`, ou as demais integrações param de funcionar:
```bash
aws lambda get-function-configuration --function-name rede-inspire-api --region us-east-1 --profile danilo \
  --query 'Environment.Variables' > /tmp/env.json
# edite /tmp/env.json adicionando "NOTION_API_TOKEN": "...", "NOTION_PARENT_PAGE_ID": "..."
aws lambda update-function-configuration --function-name rede-inspire-api --region us-east-1 --profile danilo \
  --environment "Variables=$(cat /tmp/env.json)"
```

### Frontend
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://rede-inspire-platform-danilo/ --delete --profile danilo --region us-east-1
aws cloudfront create-invalidation --distribution-id E1JVLCNJ8N0DDH --paths "/*" --profile danilo --region us-east-1
```

### Git
```bash
git add -A && git commit -m "msg" && git push origin main
```

---

## 11. App Mobile (Capacitor)

O projeto está configurado com Capacitor para gerar apps Android e iOS a partir do mesmo código React.

```bash
cd frontend
npm run build:app      # Build + sync
npm run cap:android    # Abrir Android Studio
npm run cap:ios        # Abrir Xcode
```

Detalhes completos em `APP_MOBILE.md`.

---

## 12. Tecnologias

### Frontend
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS
- React Router DOM
- Lucide Icons
- Capacitor (mobile)

### Backend
- Node.js 20 (Lambda)
- AWS SDK v3 (DynamoDB, S3, Bedrock)
- JSZip (parsing de .docx)
- JWT (autenticação)
- UUID

### Infra
- AWS Lambda (single function)
- API Gateway HTTP
- DynamoDB (NoSQL)
- S3 + CloudFront (CDN)
- Amazon Bedrock (IA generativa)
