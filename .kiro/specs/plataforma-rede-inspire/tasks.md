# Plano de Implementação: Plataforma Rede Inspire

## Visão Geral

Implementação incremental da Plataforma Rede Inspire usando React/TypeScript no frontend e AWS Lambda/DynamoDB no backend. Cada tarefa constrói sobre as anteriores, com testes integrados ao longo do processo.

## Tarefas

- [x] 1. Configurar estrutura do projeto e infraestrutura base
  - [x] 1.1 Criar projeto React com TypeScript, configurar ESLint, Prettier e estrutura de pastas (src/components, src/pages, src/services, src/types, src/utils)
    - Configurar React Router para SPA
    - Configurar Tailwind CSS para responsividade
    - _Requisitos: 12.1, 12.2, 12.3_
  - [x] 1.2 Criar projeto backend com estrutura de Lambdas (src/lambdas, src/models, src/services, src/utils)
    - Configurar TypeScript, Jest e fast-check
    - Criar template SAM/CDK para deploy na AWS
    - _Requisitos: todos_
  - [x] 1.3 Definir todas as interfaces TypeScript compartilhadas (types/index.ts)
    - Interfaces: UserProfile, Content, Category, Trail, TrailProgress, Certificate, Webinar, MentoringSession, Message, ChurchPin, Plan, PodcastEpisode, ErrorResponse
    - DTOs: CreateLeaderDTO, LoginDTO, ContentFilterDTO, SearchFilterDTO, PaginationDTO, ReportFilterDTO
    - _Requisitos: todos_

- [x] 2. Implementar módulo de autenticação e controle de acesso
  - [x] 2.1 Implementar AuthService no backend (Lambda)
    - Funções: registerLeader, login, deactivateLeader, getUserProfile
    - Integração com AWS Cognito para criação de usuários e autenticação
    - Criar Lambda Authorizer para API Gateway com validação de roles
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ]* 2.2 Escrever teste de propriedade para registro de líder
    - **Property 1: Registro de líder com associação à igreja**
    - **Validates: Requirements 1.1**
  - [ ]* 2.3 Escrever teste de propriedade para controle de acesso por perfil
    - **Property 5: Controle de acesso por perfil**
    - **Validates: Requirements 1.5**
  - [ ]* 2.4 Escrever teste de propriedade para desativação revoga acesso
    - **Property 4: Desativação revoga acesso**
    - **Validates: Requirements 1.4**
  - [ ]* 2.5 Escrever testes unitários para AuthService
    - Testar login com credenciais válidas e inválidas
    - Testar registro com dados duplicados
    - Testar bloqueio Conexa
    - _Requisitos: 1.2, 1.3, 1.6_
  - [x] 2.6 Implementar páginas de login e registro no frontend
    - Tela de login com validação de campos
    - Tela de cadastro de líder (acesso pastor)
    - Gerenciamento de sessão com tokens Cognito
    - _Requisitos: 1.1, 1.2, 1.3_

- [x] 3. Implementar módulo de conteúdos e categorias
  - [x] 3.1 Criar tabelas DynamoDB (Content, Categories) e implementar ContentService
    - Funções: listByCategory, getContent, getCategories, applyFilters, getTrending, getNewReleases, getTop10
    - Configurar GSIs para consultas por categoria e data
    - Popular categorias iniciais conforme especificação (24+ categorias)
    - _Requisitos: 3.1, 3.2, 3.3, 3.4_
  - [ ]* 3.2 Escrever teste de propriedade para conteúdo pertence a categoria válida
    - **Property 11: Conteúdo pertence a categoria válida**
    - **Validates: Requirements 3.1**
  - [ ]* 3.3 Escrever teste de propriedade para listagem por categoria é completa
    - **Property 12: Listagem por categoria é completa**
    - **Validates: Requirements 3.2**
  - [ ]* 3.4 Escrever teste de propriedade para filtros retornam apenas conteúdos correspondentes
    - **Property 14: Filtros retornam apenas conteúdos correspondentes**
    - **Validates: Requirements 3.4**
  - [x] 3.5 Implementar páginas de catálogo no frontend
    - Página de listagem de categorias com descrições
    - Página de conteúdos por categoria com filtros
    - Componente de card de conteúdo com descrição, duração e tipo
    - Componente de filtros (tipo, categoria, data, popularidade)
    - _Requisitos: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Checkpoint - Verificar testes e funcionalidades base
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [x] 5. Implementar módulo de busca avançada
  - [x] 5.1 Configurar OpenSearch e implementar SearchService
    - Criar índice content-index com analyzer português e sinônimos
    - Implementar busca full-text com Busca_Difusa (fuzziness)
    - Implementar autocomplete com edge n-gram
    - Implementar sugestões alternativas quando sem resultados
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 5.2 Escrever teste de propriedade para autocompletar ativa após terceiro caractere
    - **Property 17: Autocompletar ativa após terceiro caractere**
    - **Validates: Requirements 4.4**
  - [ ]* 5.3 Escrever teste de propriedade para resultados de busca respeitam ordenação
    - **Property 16: Resultados de busca respeitam ordenação**
    - **Validates: Requirements 4.3**
  - [x] 5.4 Implementar componente de busca no frontend
    - Barra de busca com autocompletar
    - Página de resultados com ordenação e filtros
    - Mensagem "Está procurando mais? Tente estas sugestões" quando sem resultados
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Implementar módulo de recomendações com IA
  - [x] 6.1 Configurar Amazon Personalize e implementar RecommendationService
    - Criar dataset de interações e configurar solution
    - Implementar registro de interações (view, complete, download)
    - Implementar endpoint de recomendações com fallback para conteúdos populares
    - _Requisitos: 5.1, 5.2, 5.3_
  - [ ]* 6.2 Escrever teste de propriedade para interação registrada atualiza recomendações
    - **Property 18: Interação registrada atualiza recomendações**
    - **Validates: Requirements 5.2**
  - [x] 6.3 Implementar seção de recomendações no frontend
    - Seção "Recomendado para você" na página inicial
    - Registro automático de interações ao visualizar/concluir conteúdo
    - _Requisitos: 5.1, 5.3_

- [x] 7. Implementar módulo de trilhas e Inspire Academy
  - [x] 7.1 Criar tabelas DynamoDB (Trails, TrailProgress) e implementar TrailService
    - Funções: getTrails, startTrail, completeModule, getCertificate, getAcademyCourses
    - Cálculo automático de percentual de progresso
    - Geração de certificado digital ao concluir trilha
    - Atribuição automática da trilha "Boas Vindas" para novos líderes
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ]* 7.2 Escrever teste de propriedade para progresso proporcional aos módulos
    - **Property 19: Progresso de trilha é proporcional aos módulos concluídos**
    - **Validates: Requirements 6.1**
  - [ ]* 7.3 Escrever teste de propriedade para conclusão gera certificado
    - **Property 20: Conclusão de trilha gera certificado**
    - **Validates: Requirements 6.2**
  - [ ]* 7.4 Escrever teste de propriedade para novo líder recebe trilha Boas Vindas
    - **Property 22: Novo líder recebe trilha Boas Vindas**
    - **Validates: Requirements 6.4**
  - [x] 7.5 Implementar páginas de trilhas e Academy no frontend
    - Página de listagem de trilhas com progresso
    - Página de detalhe da trilha com módulos e barra de progresso
    - Página da Inspire Academy com cursos disponíveis
    - Visualização e download de certificados
    - _Requisitos: 6.1, 6.2, 6.5_

- [x] 8. Implementar módulo de mentorias e webinars
  - [x] 8.1 Criar tabela DynamoDB e implementar MentoringService
    - Funções: getUpcomingWebinars, getMentoringSessions, registerParticipation, completeSession
    - Integração com URL do Zoom para acesso direto
    - Notificação ao pastor ao concluir mentoria
    - _Requisitos: 7.1, 7.2, 7.3_
  - [ ]* 8.2 Escrever teste de propriedade para participação em mentoria round-trip
    - **Property 25: Participação em mentoria é registrada (round-trip)**
    - **Validates: Requirements 7.2**
  - [x] 8.3 Implementar páginas de mentorias e webinars no frontend
    - Listagem de webinars com botão de acesso direto
    - Listagem de mentorias com status
    - Card de próximo webinar na página inicial
    - _Requisitos: 7.1, 7.2_

- [ ] 9. Checkpoint - Verificar módulos de aprendizado
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [x] 10. Implementar dashboard pastoral e relatórios
  - [x] 10.1 Implementar DashboardService no backend
    - Funções: getChurchMetrics, getLeaderReport, getLeaderRanking, getChurchTimeline, exportReport
    - Agregação de métricas de uso por igreja
    - Geração de relatórios em Excel (usando exceljs) e PDF (usando pdfkit)
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 10.2 Escrever teste de propriedade para ranking de líderes ordenado
    - **Property 29: Ranking de líderes ordenado por engajamento**
    - **Validates: Requirements 8.3**
  - [ ]* 10.3 Escrever teste de propriedade para exportação gera arquivo válido
    - **Property 28: Exportação de relatório gera arquivo válido**
    - **Validates: Requirements 8.2**
  - [ ]* 10.4 Escrever teste de propriedade para relatório categoriza recursos corretamente
    - **Property 30: Relatório do líder categoriza recursos corretamente**
    - **Validates: Requirements 8.5**
  - [x] 10.5 Implementar páginas de dashboard no frontend
    - Dashboard pastoral com métricas, gráficos e ranking
    - Página de relatório individual do líder
    - Linha do tempo "Minha Jornada Inspire"
    - Botões de exportação Excel/PDF
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Implementar módulo de mensagens e notificações
  - [x] 11.1 Criar tabela DynamoDB (Messages) e implementar MessagingService
    - Funções: sendMessage, getInbox, markAsRead, getUnreadCount
    - _Requisitos: 9.1, 9.2_
  - [ ]* 11.2 Escrever teste de propriedade para mensagem entregue e contagem atualizada
    - **Property 31: Mensagem entregue e contagem de não-lidas atualizada**
    - **Validates: Requirements 9.1, 9.2**
  - [x] 11.3 Implementar componentes de mensagens no frontend
    - Caixa de entrada com indicador de não-lidas
    - Formulário de envio de mensagem (pastor → líder)
    - Ícone de notificação no header com badge de contagem
    - Link para grupo WhatsApp de Primeiros Passos
    - _Requisitos: 9.1, 9.2, 9.3_

- [x] 12. Implementar Rede Inspire Connect (Mapa)
  - [x] 12.1 Criar tabela DynamoDB (Churches) e implementar MapService
    - Funções: getChurches, getChurchDetail, getTopChurchesByEngagement
    - _Requisitos: 10.1, 10.2, 10.3_
  - [ ]* 12.2 Escrever teste de propriedade para mapa contém todas as igrejas
    - **Property 32: Mapa contém todas as igrejas**
    - **Validates: Requirements 10.1**
  - [ ]* 12.3 Escrever teste de propriedade para top igrejas ordenadas
    - **Property 34: Top igrejas ordenadas por engajamento**
    - **Validates: Requirements 10.3**
  - [x] 12.4 Implementar página do mapa no frontend
    - Mapa interativo do Brasil com pins (usando Leaflet ou Mapbox)
    - Popup com detalhes da igreja ao clicar no pin
    - Ranking "Top Igrejas por Engajamento no Mês"
    - _Requisitos: 10.1, 10.2, 10.3_

- [x] 13. Implementar ferramentas de planejamento
  - [x] 13.1 Criar tabela DynamoDB (Plans) e implementar PlanningService
    - Funções: createSundayPlan, createAnnualPlan, createMinistryPlan, getPlan, updatePlan, getUserPlans
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_
  - [ ]* 13.2 Escrever teste de propriedade para planejamento round-trip
    - **Property 35: Planejamento round-trip**
    - **Validates: Requirements 11.3**
  - [x] 13.3 Implementar páginas de planejamento no frontend
    - "Monte seu Domingo" com formulário guiado e seleção de conteúdos
    - "Monte seu Planejamento Anual" com calendário interativo
    - "Monte Ministério" com assistente baseado em templates
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

- [ ] 14. Checkpoint - Verificar módulos de gestão
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

- [x] 15. Implementar módulo de podcast
  - [x] 15.1 Implementar PodcastService no backend
    - Funções: getEpisodes, getEpisode, getPlaybackProgress, savePlaybackProgress
    - Armazenamento de áudio no S3
    - _Requisitos: 13.1, 13.2, 13.3_
  - [ ]* 15.2 Escrever teste de propriedade para progresso de podcast round-trip
    - **Property 37: Progresso de podcast round-trip**
    - **Validates: Requirements 13.3**
  - [x] 15.3 Implementar player de podcast no frontend
    - Listagem de episódios com título, descrição e duração
    - Player de áudio com controles (play, pause, avançar, retroceder, velocidade)
    - Retomada automática do ponto onde parou
    - _Requisitos: 13.1, 13.2, 13.3_

- [x] 16. Implementar integrações com sistemas externos
  - [x] 16.1 Implementar integração com Conexa
    - Lambda para receber webhooks de bloqueio/desbloqueio
    - Atualização de status da igreja e propagação para usuários
    - Retry com backoff exponencial em caso de falha
    - _Requisitos: 14.1, 1.6_
  - [ ]* 16.2 Escrever teste de propriedade para bloqueio Conexa propaga
    - **Property 6: Bloqueio Conexa propaga para todos os usuários da igreja**
    - **Validates: Requirements 1.6**
  - [ ]* 16.3 Escrever teste de propriedade para falha preserva estado
    - **Property 40: Falha de integração preserva estado anterior**
    - **Validates: Requirements 14.3**
  - [x] 16.4 Implementar sincronização de cadastro (CNPJ/CPF)
    - Lambda para sincronização periódica de dados
    - Validação de CNPJ e CPF
    - _Requisitos: 14.2_

- [x] 17. Implementar página inicial completa e integrar módulos
  - [x] 17.1 Montar página inicial com todas as seções
    - Lançamentos, Top 10, Últimos Acessos
    - Sugestões por ministério
    - Status de mentorias/treinamentos em andamento
    - Próximo Webinar com botão de acesso
    - Trending
    - "Histórias que Inspiram" (testemunhos)
    - "Recomendado para você"
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ]* 17.2 Escrever teste de propriedade para sugestões correspondem ao ministério
    - **Property 7: Sugestões correspondem ao ministério do usuário**
    - **Validates: Requirements 2.2**
  - [ ]* 17.3 Escrever teste de propriedade para trending ordenado por engajamento
    - **Property 10: Trending ordenado por engajamento recente**
    - **Validates: Requirements 2.6**
  - [x] 17.4 Implementar navegação global e layout responsivo
    - Header com busca, notificações e perfil
    - Sidebar com menu de categorias
    - Footer com links úteis
    - Layout responsivo para mobile/tablet/desktop
    - _Requisitos: 12.1, 12.2, 12.3_

- [ ] 18. Checkpoint final - Verificar integração completa
  - Garantir que todos os testes passam, perguntar ao usuário se há dúvidas.

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude
- Testes unitários validam exemplos específicos e casos de borda
