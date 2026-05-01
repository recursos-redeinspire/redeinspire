# Documento de Requisitos — Plataforma Rede Inspire

## Introdução

A Plataforma Rede Inspire é uma plataforma web responsiva voltada para a Rede Inspire de igrejas, inspirada no modelo da Open Life Church. O objetivo é centralizar conteúdos, treinamentos, mentorias, relatórios e ferramentas de gestão ministerial para pastores, líderes e membros de igrejas filiadas. A plataforma roda exclusivamente na web, com backend na AWS (Lambda, API Gateway, DynamoDB, S3, Cognito).

## Glossário

- **Plataforma**: A aplicação web Rede Inspire
- **Pastor_Presidente**: Usuário com acesso administrativo total à sua igreja filiada, responsável por cadastrar líderes e acompanhar relatórios
- **Líder**: Usuário cadastrado pelo Pastor_Presidente, com acesso a conteúdos, trilhas e mentorias
- **Membro**: Usuário com acesso básico a conteúdos públicos da plataforma
- **Igreja_Filiada**: Igreja cadastrada na Rede Inspire com CNPJ e pastor responsável
- **Trilha**: Sequência ordenada de conteúdos e treinamentos com progresso rastreável
- **Mentoria**: Sessão de treinamento ao vivo ou gravada, com acompanhamento de progresso
- **Webinar**: Evento online ao vivo acessível pela plataforma
- **Conteúdo**: Qualquer material disponível na plataforma (mensagens, séries, campanhas, materiais de liderança, etc.)
- **Categoria**: Agrupamento temático de conteúdos (ex: Crianças, Jovens, Casais, Células, etc.)
- **Dashboard_Pastoral**: Painel de relatórios e métricas de uso da igreja filiada
- **Inspire_Academy**: Módulo de cursos com certificados e pontos de progresso
- **Conexa**: Sistema externo de gestão de assinaturas para bloqueio/desbloqueio de acesso
- **Busca_Difusa**: Busca que tolera erros de digitação e encontra resultados aproximados

## Requisitos

### Requisito 1: Autenticação e Controle de Acesso

**User Story:** Como Pastor_Presidente, quero controlar o acesso dos líderes da minha igreja, para que apenas pessoas autorizadas acessem a plataforma.

#### Critérios de Aceitação

1. WHEN um Pastor_Presidente cria um novo login de líder, THEN THE Plataforma SHALL registrar o Líder no AWS Cognito com perfil associado à Igreja_Filiada
2. WHEN um usuário faz login com credenciais válidas, THEN THE Plataforma SHALL autenticar o usuário via AWS Cognito e redirecionar para a página inicial personalizada
3. IF um usuário fornece credenciais inválidas, THEN THE Plataforma SHALL exibir mensagem de erro clara e registrar a tentativa de login
4. WHEN um Pastor_Presidente desativa um Líder, THEN THE Plataforma SHALL revogar o acesso do Líder imediatamente
5. THE Plataforma SHALL restringir o acesso a funcionalidades com base no perfil do usuário (Pastor_Presidente, Líder, Membro)
6. WHEN a integração com Conexa sinaliza bloqueio de uma Igreja_Filiada, THEN THE Plataforma SHALL bloquear o acesso de todos os usuários daquela igreja

### Requisito 2: Página Inicial e Destaques

**User Story:** Como Líder, quero ver conteúdos relevantes ao acessar a plataforma, para que eu encontre rapidamente o que preciso.

#### Critérios de Aceitação

1. WHEN um usuário acessa a página inicial, THEN THE Plataforma SHALL exibir seções de Lançamentos, Top 10 e Últimos Acessos do usuário
2. WHEN um usuário acessa a página inicial, THEN THE Plataforma SHALL exibir sugestões de novos materiais conforme o ministério em que o usuário atua
3. WHEN um usuário possui mentorias ou treinamentos em andamento, THEN THE Plataforma SHALL exibir o status de progresso na página inicial
4. WHEN existe um Webinar ou treinamento agendado, THEN THE Plataforma SHALL exibir a data e um botão de acesso direto ao próximo evento
5. WHEN um usuário acessa a página inicial, THEN THE Plataforma SHALL exibir a seção "Histórias que Inspiram" com testemunhos de igrejas filiadas
6. WHEN um usuário acessa a página inicial, THEN THE Plataforma SHALL exibir conteúdos em tendência (Trending) baseados no engajamento recente

### Requisito 3: Catálogo e Categorização de Conteúdos

**User Story:** Como Líder, quero navegar por categorias de conteúdo organizadas, para que eu encontre materiais relevantes ao meu ministério.

#### Critérios de Aceitação

1. THE Plataforma SHALL organizar conteúdos nas seguintes categorias: Mensagens, Série de Mensagens, Campanhas, Pequenos Grupos, Crianças (Baby, Kids, Shine, Overdrive), Jovens (Bold, Burn, A3), Adolescentes, Homens, Mulheres, Casais, 5 Propósitos, Empresários, 30 Semanas, Velos, Gestão Ministerial, Pesquisas, Mentorias, Webinar, Trilhas, Eventos, Casa de Paz, Materiais para Liderança e Retiros
2. WHEN um usuário seleciona uma Categoria, THEN THE Plataforma SHALL exibir a descrição da categoria e listar todos os conteúdos associados
3. THE Plataforma SHALL exibir descrição, duração estimada e tipo de mídia para cada Conteúdo
4. WHEN um usuário aplica filtros (tipo, categoria, data, popularidade), THEN THE Plataforma SHALL atualizar a listagem de conteúdos em tempo real

### Requisito 4: Busca Avançada

**User Story:** Como Líder, quero buscar conteúdos por palavras-chave, para que eu encontre materiais específicos rapidamente.

#### Critérios de Aceitação

1. WHEN um usuário digita um termo de busca, THEN THE Plataforma SHALL retornar resultados correspondentes por palavra-chave, sinônimos e Busca_Difusa
2. WHEN a busca não retorna resultados, THEN THE Plataforma SHALL exibir sugestões alternativas com a mensagem "Está procurando mais? Tente estas sugestões"
3. WHEN resultados de busca são exibidos, THEN THE Plataforma SHALL ordenar por relevância e permitir reordenação por data, popularidade e categoria
4. WHEN um usuário digita no campo de busca, THEN THE Plataforma SHALL exibir sugestões de autocompletar após o terceiro caractere digitado

### Requisito 5: Sistema de Recomendações com IA

**User Story:** Como Líder, quero receber recomendações personalizadas de conteúdo, para que eu descubra materiais relevantes ao meu contexto ministerial.

#### Critérios de Aceitação

1. WHEN um usuário acessa a plataforma, THEN THE Plataforma SHALL gerar recomendações baseadas no histórico de uso, ministério de atuação e conteúdos concluídos
2. WHEN um usuário conclui um Conteúdo, THEN THE Plataforma SHALL atualizar as recomendações para refletir o novo contexto do usuário
3. THE Plataforma SHALL exibir recomendações em seção dedicada com título "Recomendado para você"

### Requisito 6: Trilhas de Aprendizado e Inspire Academy

**User Story:** Como Líder, quero seguir trilhas de aprendizado estruturadas, para que eu me desenvolva de forma progressiva na liderança.

#### Critérios de Aceitação

1. WHEN um Líder inicia uma Trilha, THEN THE Plataforma SHALL registrar o progresso e exibir a porcentagem de conclusão
2. WHEN um Líder conclui todos os módulos de uma Trilha, THEN THE Plataforma SHALL emitir um certificado digital e registrar pontos de progresso na Inspire_Academy
3. WHEN um Pastor_Presidente acessa o Dashboard_Pastoral, THEN THE Plataforma SHALL exibir quais Líderes concluíram suas Trilhas e quais estão em andamento
4. THE Plataforma SHALL disponibilizar o treinamento "Boas Vindas" como Trilha obrigatória para novos Líderes
5. WHEN um Líder acessa a Inspire_Academy, THEN THE Plataforma SHALL exibir cursos disponíveis com descrição, carga horária e pontos de progresso associados

### Requisito 7: Mentorias e Webinars

**User Story:** Como Líder, quero participar de mentorias e webinars ao vivo, para que eu receba orientação direta de mentores da rede.

#### Critérios de Aceitação

1. WHEN um Webinar está agendado, THEN THE Plataforma SHALL exibir botão de acesso direto à sala do Zoom ou ferramenta de videoconferência
2. WHEN um Líder participa de uma Mentoria, THEN THE Plataforma SHALL registrar a participação e atualizar o status da mentoria
3. WHEN uma Mentoria é concluída, THEN THE Plataforma SHALL registrar a conclusão no perfil do Líder e notificar o Pastor_Presidente

### Requisito 8: Dashboard Pastoral e Relatórios

**User Story:** Como Pastor_Presidente, quero visualizar relatórios de uso da minha igreja, para que eu acompanhe o engajamento dos líderes.

#### Critérios de Aceitação

1. WHEN um Pastor_Presidente acessa o Dashboard_Pastoral, THEN THE Plataforma SHALL exibir métricas de uso incluindo últimos acessos dos Líderes, conteúdos mais acessados e trilhas em andamento
2. WHEN um Pastor_Presidente solicita exportação de relatório, THEN THE Plataforma SHALL gerar o arquivo em formato Excel ou PDF e disponibilizar para download
3. WHEN um Pastor_Presidente acessa o Dashboard_Pastoral, THEN THE Plataforma SHALL exibir o ranking de engajamento dos Líderes da igreja
4. THE Plataforma SHALL exibir a seção "Minha Jornada Inspire" com linha do tempo mostrando conquistas da Igreja_Filiada
5. WHEN um Pastor_Presidente visualiza o relatório de um Líder, THEN THE Plataforma SHALL exibir recursos concluídos, em andamento e últimos downloads

### Requisito 9: Comunicação e Engajamento

**User Story:** Como Pastor_Presidente, quero enviar mensagens de incentivo aos líderes, para que eu mantenha o engajamento da equipe.

#### Critérios de Aceitação

1. WHEN um Pastor_Presidente envia uma mensagem de incentivo a um Líder, THEN THE Plataforma SHALL entregar a mensagem na caixa de notificações do Líder
2. WHEN um Líder recebe uma mensagem, THEN THE Plataforma SHALL exibir notificação visual na interface
3. THE Plataforma SHALL disponibilizar link de acesso direto ao grupo de WhatsApp de Primeiros Passos na página inicial

### Requisito 10: Rede Inspire Connect (Mapa)

**User Story:** Como usuário, quero visualizar as igrejas filiadas no mapa do Brasil, para que eu conheça a abrangência da rede.

#### Critérios de Aceitação

1. WHEN um usuário acessa a seção Rede Inspire Connect, THEN THE Plataforma SHALL exibir um mapa interativo do Brasil com pins representando cada Igreja_Filiada
2. WHEN um usuário clica em um pin no mapa, THEN THE Plataforma SHALL exibir informações básicas da Igreja_Filiada (nome, cidade, pastor responsável)
3. WHEN um usuário acessa a seção Rede Inspire Connect, THEN THE Plataforma SHALL exibir o ranking "Top Igrejas por Engajamento no Mês"

### Requisito 11: Ferramentas de Planejamento

**User Story:** Como Líder, quero usar ferramentas de planejamento integradas, para que eu organize as atividades do meu ministério.

#### Critérios de Aceitação

1. WHEN um Líder acessa a ferramenta "Monte seu Domingo", THEN THE Plataforma SHALL exibir um formulário guiado para planejar o culto com seleção de conteúdos da plataforma
2. WHEN um Líder acessa a ferramenta "Monte seu Planejamento Anual", THEN THE Plataforma SHALL exibir um calendário interativo para distribuir conteúdos e eventos ao longo do ano
3. WHEN um Líder salva um planejamento, THEN THE Plataforma SHALL persistir os dados e permitir edição futura
4. WHEN um Líder acessa a ferramenta "Monte Ministério", THEN THE Plataforma SHALL exibir um assistente para estruturar um novo ministério com base em templates da rede

### Requisito 12: Responsividade e Experiência do Usuário

**User Story:** Como usuário, quero acessar a plataforma de qualquer dispositivo, para que eu tenha uma experiência consistente.

#### Critérios de Aceitação

1. THE Plataforma SHALL renderizar corretamente em dispositivos com largura de tela entre 320px e 2560px
2. THE Plataforma SHALL manter navegação funcional e legível em dispositivos móveis sem necessidade de zoom
3. WHEN um usuário acessa a plataforma em dispositivo móvel, THEN THE Plataforma SHALL adaptar o layout para navegação por toque com alvos de toque de no mínimo 44x44 pixels

### Requisito 13: Podcast e Conteúdo de Áudio

**User Story:** Como Pastor_Presidente, quero acessar podcasts de pastor para pastor, para que eu receba conteúdo exclusivo de liderança.

#### Critérios de Aceitação

1. WHEN um Pastor_Presidente acessa a seção de Podcast, THEN THE Plataforma SHALL listar episódios disponíveis com título, descrição e duração
2. WHEN um usuário reproduz um episódio de podcast, THEN THE Plataforma SHALL exibir player de áudio com controles de reprodução (play, pause, avançar, retroceder, velocidade)
3. THE Plataforma SHALL registrar o progresso de reprodução do podcast e permitir retomada do ponto onde o usuário parou

### Requisito 14: Integração com Sistemas Externos

**User Story:** Como administrador da Rede Inspire, quero que a plataforma se integre com sistemas externos, para que os dados estejam sincronizados.

#### Critérios de Aceitação

1. WHEN o sistema Conexa envia sinal de bloqueio ou desbloqueio, THEN THE Plataforma SHALL atualizar o status de acesso da Igreja_Filiada em até 5 minutos
2. THE Plataforma SHALL sincronizar dados de cadastro (CNPJ da igreja e CPF do líder responsável) com o sistema de registro da Rede Inspire
3. IF a integração com um sistema externo falha, THEN THE Plataforma SHALL registrar o erro em log, notificar o administrador e manter o último estado válido conhecido
