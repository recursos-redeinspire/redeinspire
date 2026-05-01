// =============================================================================
// Seed Data — Dados iniciais para popular o localStorage
// =============================================================================

import { storeGet, storeSet } from './localStore'

const SEED_VERSION = 'v4'

export function seedIfNeeded(): void {
  if (storeGet<string>('seed_version') === SEED_VERSION) return
  
  // Users
  storeSet('users', [
    { id: 'u1', name: 'Pr. Carlos Silva', email: 'carlos@inspire.com', password: '123456', role: 'pastor_presidente', churchId: 'ch1', ministries: ['Gestão Ministerial'], status: 'active' },
    { id: 'u2', name: 'Maria Silva', email: 'maria@inspire.com', password: '123456', role: 'lider', churchId: 'ch1', ministries: ['Jovens', 'Worship'], status: 'active' },
    { id: 'u3', name: 'João Santos', email: 'joao@inspire.com', password: '123456', role: 'lider', churchId: 'ch1', ministries: ['Pequenos Grupos'], status: 'active' },
    { id: 'u4', name: 'Ana Oliveira', email: 'ana@inspire.com', password: '123456', role: 'lider', churchId: 'ch1', ministries: ['Crianças'], status: 'active' },
    { id: 'u5', name: 'Pedro Costa', email: 'pedro@inspire.com', password: '123456', role: 'lider', churchId: 'ch1', ministries: ['Homens'], status: 'active' },
    { id: 'u6', name: 'Carla Lima', email: 'carla@inspire.com', password: '123456', role: 'lider', churchId: 'ch1', ministries: ['Mulheres', 'Casais'], status: 'active' },
  ])

  // Content
  storeSet('contents', [
    { id: 'ct1', title: 'Liderança Servidora', description: 'Como liderar com o coração de servo — princípios bíblicos para uma liderança transformadora', categorySlug: 'mensagens', type: 'video', durationMinutes: 45, thumbnailUrl: '', createdAt: '2026-03-01', popularity: 95, views: 1250 },
    { id: 'ct2', title: 'Série: Propósitos de Deus', description: 'Descobrindo seu propósito em Deus — uma jornada de 5 semanas', categorySlug: 'serie-de-mensagens', type: 'video', durationMinutes: 60, thumbnailUrl: '', createdAt: '2026-02-28', popularity: 88, views: 980 },
    { id: 'ct3', title: 'Guia de Células', description: 'Manual completo para líderes de células e pequenos grupos', categorySlug: 'pequenos-grupos', type: 'document', durationMinutes: 30, thumbnailUrl: '', createdAt: '2026-02-25', popularity: 76, views: 870 },
    { id: 'ct4', title: 'Worship Kids - Módulo 1', description: 'Louvor e adoração para crianças — treinamento completo', categorySlug: 'criancas', type: 'video', durationMinutes: 35, thumbnailUrl: '', createdAt: '2026-02-20', popularity: 82, views: 750 },
    { id: 'ct5', title: 'Empreendedorismo Cristão', description: 'Princípios bíblicos para negócios e empreendedorismo', categorySlug: 'empresarios', type: 'video', durationMinutes: 55, thumbnailUrl: '', createdAt: '2026-02-15', popularity: 70, views: 680 },
    { id: 'ct6', title: 'Casais em Aliança', description: 'Fortalecendo o casamento — série para ministério de casais', categorySlug: 'casais', type: 'video', durationMinutes: 40, thumbnailUrl: '', createdAt: '2026-02-10', popularity: 65, views: 520 },
    { id: 'ct7', title: 'Material PG - Março 2026', description: 'Material semanal para pequenos grupos — março 2026', categorySlug: 'pequenos-grupos', type: 'document', durationMinutes: 20, thumbnailUrl: '', createdAt: '2026-03-03', popularity: 90, views: 1100 },
    { id: 'ct8', title: 'Campanha Páscoa 2026', description: 'Kit completo para campanha de Páscoa — artes, roteiros e materiais', categorySlug: 'campanhas', type: 'document', durationMinutes: 15, thumbnailUrl: '', createdAt: '2026-03-02', popularity: 85, views: 900 },
    { id: 'ct9', title: 'Campanha de Oração 40 Dias', description: 'Recursos para campanha de oração coletiva', categorySlug: 'campanhas', type: 'document', durationMinutes: 20, thumbnailUrl: '', createdAt: '2026-01-20', popularity: 92, views: 870 },
    { id: 'ct10', title: 'Mentoria de Liderança Avançada', description: 'Conteúdo exclusivo para pastores e líderes seniores', categorySlug: 'mentorias', type: 'video', durationMinutes: 90, thumbnailUrl: '', createdAt: '2026-02-05', popularity: 85, views: 680 },
    { id: 'ct11', title: 'Gestão Ministerial 2026', description: 'Ferramentas e estratégias para gestão de ministérios', categorySlug: 'gestao-ministerial', type: 'video', durationMinutes: 50, thumbnailUrl: '', createdAt: '2026-02-18', popularity: 98, views: 1400 },
    { id: 'ct12', title: 'Retiro de Líderes', description: 'Planejamento e execução de retiros espirituais', categorySlug: 'retiros', type: 'document', durationMinutes: 25, thumbnailUrl: '', createdAt: '2026-02-12', popularity: 92, views: 800 },
    { id: 'ct13', title: 'Casa de Paz - Guia Completo', description: 'Tudo sobre o ministério Casa de Paz', categorySlug: 'casa-de-paz', type: 'document', durationMinutes: 35, thumbnailUrl: '', createdAt: '2026-01-28', popularity: 87, views: 720 },
    { id: 'ct14', title: 'Bold - Treinamento Jovens', description: 'Programa Bold para capacitação de jovens líderes', categorySlug: 'jovens', type: 'video', durationMinutes: 45, thumbnailUrl: '', createdAt: '2026-02-08', popularity: 78, views: 600 },
    { id: 'ct15', title: 'Série: Células Saudáveis', description: 'Como manter células saudáveis e multiplicadoras', categorySlug: 'pequenos-grupos', type: 'video', durationMinutes: 40, thumbnailUrl: '', createdAt: '2026-01-15', popularity: 80, views: 650 },
    { id: 'ct16', title: 'Velos - Capacitação', description: 'Programa Velos de capacitação ministerial', categorySlug: 'velos', type: 'video', durationMinutes: 60, thumbnailUrl: '', createdAt: '2026-02-01', popularity: 75, views: 550 },
  ])

  // Trails
  storeSet('trails', [
    { id: 'tr1', title: 'Boas Vindas à Rede Inspire', description: 'Trilha obrigatória para novos líderes — conheça a visão e os valores da rede', modules: [
      { moduleId: 'm1', title: 'Quem somos', contentId: 'ct1', durationMinutes: 15, order: 1 },
      { moduleId: 'm2', title: 'Nossa visão', contentId: 'ct2', durationMinutes: 20, order: 2 },
      { moduleId: 'm3', title: 'Valores da rede', contentId: 'ct3', durationMinutes: 15, order: 3 },
      { moduleId: 'm4', title: 'Como funciona', contentId: 'ct4', durationMinutes: 20, order: 4 },
      { moduleId: 'm5', title: 'Próximos passos', contentId: 'ct5', durationMinutes: 10, order: 5 },
    ], totalDurationMinutes: 80, points: 100, isMandatory: true },
    { id: 'tr2', title: 'Liderança de Pequenos Grupos', description: 'Aprenda a liderar PGs com excelência', modules: [
      { moduleId: 'm6', title: 'Fundamentos de PG', contentId: 'ct3', durationMinutes: 30, order: 1 },
      { moduleId: 'm7', title: 'Dinâmicas de grupo', contentId: 'ct7', durationMinutes: 25, order: 2 },
      { moduleId: 'm8', title: 'Multiplicação', contentId: 'ct15', durationMinutes: 30, order: 3 },
      { moduleId: 'm9', title: 'Cuidado pastoral', contentId: 'ct1', durationMinutes: 25, order: 4 },
      { moduleId: 'm10', title: 'Planejamento', contentId: 'ct11', durationMinutes: 20, order: 5 },
      { moduleId: 'm11', title: 'Avaliação', contentId: 'ct10', durationMinutes: 20, order: 6 },
      { moduleId: 'm12', title: 'Testemunhos', contentId: 'ct6', durationMinutes: 15, order: 7 },
      { moduleId: 'm13', title: 'Certificação', contentId: 'ct2', durationMinutes: 15, order: 8 },
    ], totalDurationMinutes: 180, points: 200, isMandatory: false },
    { id: 'tr3', title: 'Ministério Infantil Avançado', description: 'Capacitação para líderes de crianças', modules: [
      { moduleId: 'm14', title: 'Fundamentos', contentId: 'ct4', durationMinutes: 30, order: 1 },
      { moduleId: 'm15', title: 'Louvor Kids', contentId: 'ct4', durationMinutes: 25, order: 2 },
      { moduleId: 'm16', title: 'Ensino criativo', contentId: 'ct4', durationMinutes: 30, order: 3 },
      { moduleId: 'm17', title: 'Segurança', contentId: 'ct11', durationMinutes: 20, order: 4 },
      { moduleId: 'm18', title: 'Equipe', contentId: 'ct1', durationMinutes: 25, order: 5 },
      { moduleId: 'm19', title: 'Certificação', contentId: 'ct2', durationMinutes: 15, order: 6 },
    ], totalDurationMinutes: 145, points: 150, isMandatory: false },
    { id: 'tr4', title: 'Gestão Ministerial', description: 'Ferramentas de gestão para pastores e líderes', modules: Array.from({ length: 10 }, (_, i) => ({
      moduleId: `m${20 + i}`, title: `Módulo ${i + 1}`, contentId: `ct${(i % 16) + 1}`, durationMinutes: 25, order: i + 1,
    })), totalDurationMinutes: 250, points: 300, isMandatory: false },
    { id: 'tr5', title: 'Cultura Inspire', description: 'Entenda os valores e a cultura da rede', modules: [
      { moduleId: 'm30', title: 'DNA Inspire', contentId: 'ct1', durationMinutes: 20, order: 1 },
      { moduleId: 'm31', title: 'Valores', contentId: 'ct2', durationMinutes: 20, order: 2 },
      { moduleId: 'm32', title: 'Missão', contentId: 'ct11', durationMinutes: 20, order: 3 },
      { moduleId: 'm33', title: 'Visão', contentId: 'ct5', durationMinutes: 20, order: 4 },
    ], totalDurationMinutes: 80, points: 80, isMandatory: true },
  ])

  // Trail progress (for user u1)
  storeSet('trail_progress', [
    { id: 'tp1', trailId: 'tr1', userId: 'u1', completedModules: ['m1', 'm2', 'm3'], percentComplete: 60, startedAt: '2026-01-15' },
    { id: 'tp2', trailId: 'tr3', userId: 'u1', completedModules: ['m14', 'm15', 'm16', 'm17', 'm18', 'm19'], percentComplete: 100, startedAt: '2026-01-10', completedAt: '2026-02-20' },
    { id: 'tp3', trailId: 'tr4', userId: 'u1', completedModules: ['m20', 'm21'], percentComplete: 20, startedAt: '2026-02-01' },
    { id: 'tp4', trailId: 'tr5', userId: 'u1', completedModules: ['m30', 'm31', 'm32', 'm33'], percentComplete: 100, startedAt: '2026-01-05', completedAt: '2026-01-20' },
  ])

  // Academy courses
  storeSet('academy_courses', [
    { id: 'ac1', title: 'Liderança Servidora', description: 'Curso completo sobre liderança servidora', durationHours: 12, points: 500, trailId: 'tr2' },
    { id: 'ac2', title: 'Comunicação Pastoral', description: 'Aprenda a se comunicar com excelência', durationHours: 8, points: 350, trailId: 'tr4' },
    { id: 'ac3', title: 'Planejamento Estratégico', description: 'Estratégias para crescimento ministerial', durationHours: 16, points: 600, trailId: 'tr4' },
  ])

  // Webinars
  storeSet('webinars', [
    { id: 'w1', title: 'Liderança em Tempos de Crise', description: 'Como liderar sua igreja em momentos difíceis', scheduledAt: '2026-03-15T19:00:00', meetingUrl: 'https://zoom.us/j/123', hostName: 'Pr. Carlos Silva', createdBy: 'u1', enrolledUsers: ['u2', 'u3'], enrolledCount: 2 },
    { id: 'w2', title: 'Crescimento de Pequenos Grupos', description: 'Estratégias para multiplicar PGs', scheduledAt: '2026-03-22T20:00:00', meetingUrl: 'https://zoom.us/j/456', hostName: 'Pra. Ana Santos', createdBy: 'u1', enrolledUsers: ['u1', 'u4', 'u5'], enrolledCount: 3 },
    { id: 'w3', title: 'Finanças da Igreja', description: 'Gestão financeira ministerial', scheduledAt: '2026-04-05T19:30:00', meetingUrl: 'https://zoom.us/j/789', hostName: 'Pr. Roberto Lima', createdBy: 'u1', enrolledUsers: [], enrolledCount: 0 },
  ])

  // Mentoring sessions
  storeSet('mentoring_sessions', [
    { id: 's1', title: 'Mentoria Individual - Liderança', description: 'Desenvolvimento de habilidades de liderança pastoral', mentorName: 'Maria Silva', mentorId: 'u2', pastorName: 'Pr. Carlos Silva', pastorId: 'u1', status: 'completed', scheduledAt: '2026-02-10T14:00:00', createdBy: 'u1' },
    { id: 's2', title: 'Mentoria de Grupo - Plantação', description: 'Estratégias para plantação de novas igrejas', mentorName: 'João Santos', mentorId: 'u3', pastorName: 'Pr. Carlos Silva', pastorId: 'u1', status: 'in_progress', scheduledAt: '2026-03-08T15:00:00', meetingUrl: 'https://zoom.us/j/321', createdBy: 'u1' },
    { id: 's3', title: 'Mentoria - Cultura Inspire', description: 'Alinhamento de cultura e valores da rede', mentorName: 'Ana Oliveira', mentorId: 'u4', pastorName: 'Pr. Carlos Silva', pastorId: 'u1', status: 'scheduled', scheduledAt: '2026-03-20T16:00:00', meetingUrl: 'https://zoom.us/j/654', createdBy: 'u4' },
  ])

  // Messages
  storeSet('messages', [
    { id: 'msg1', fromUserId: 'u1', fromName: 'Pr. Carlos Silva', toUserId: 'u2', subject: 'Parabéns pela trilha concluída!', body: 'Fico feliz em ver seu progresso na trilha de Ministério Infantil. Continue assim! Você é uma bênção para nossa equipe.', isRead: false, createdAt: '2026-03-06T10:30:00' },
    { id: 'msg2', fromUserId: 'system', fromName: 'Rede Inspire', toUserId: 'u1', subject: 'Novo webinar disponível', body: 'Não perca o webinar "Liderança em Tempos de Crise" com Pr. Carlos Silva no dia 15 de março às 19h. Inscreva-se agora!', isRead: false, createdAt: '2026-03-05T14:00:00' },
    { id: 'msg3', fromUserId: 'u4', fromName: 'Ana Oliveira', toUserId: 'u1', subject: 'Material de Crianças', body: 'Pastor, segue o material atualizado do ministério infantil para a próxima semana. Precisamos de mais voluntários para o domingo.', isRead: true, createdAt: '2026-03-04T09:15:00' },
    { id: 'msg4', fromUserId: 'u3', fromName: 'João Santos', toUserId: 'u1', subject: 'Reunião de líderes de PG', body: 'Confirmem presença na reunião de sábado às 9h. Vamos discutir a multiplicação das células no próximo trimestre.', isRead: true, createdAt: '2026-03-03T16:45:00' },
  ])

  // Churches
  storeSet('churches', [
    { id: 'ch1', name: 'Igreja Inspire São Paulo', city: 'São Paulo', state: 'SP', lat: -23.55, lng: -46.63, pastorName: 'Pr. Carlos Silva', memberCount: 450, engagementScore: 98 },
    { id: 'ch2', name: 'Igreja Inspire Rio de Janeiro', city: 'Rio de Janeiro', state: 'RJ', lat: -22.91, lng: -43.17, pastorName: 'Pr. Roberto Lima', memberCount: 380, engagementScore: 92 },
    { id: 'ch3', name: 'Igreja Inspire Belo Horizonte', city: 'Belo Horizonte', state: 'MG', lat: -19.92, lng: -43.94, pastorName: 'Pr. Marcos Oliveira', memberCount: 220, engagementScore: 83 },
    { id: 'ch4', name: 'Igreja Inspire Curitiba', city: 'Curitiba', state: 'PR', lat: -25.43, lng: -49.27, pastorName: 'Pra. Juliana Costa', memberCount: 310, engagementScore: 87 },
    { id: 'ch5', name: 'Igreja Inspire Salvador', city: 'Salvador', state: 'BA', lat: -12.97, lng: -38.51, pastorName: 'Pr. Fernando Alves', memberCount: 180, engagementScore: 79 },
    { id: 'ch6', name: 'Igreja Inspire Recife', city: 'Recife', state: 'PE', lat: -8.05, lng: -34.87, pastorName: 'Pra. Ana Santos', memberCount: 150, engagementScore: 74 },
    { id: 'ch7', name: 'Igreja Inspire Brasília', city: 'Brasília', state: 'DF', lat: -15.79, lng: -47.88, pastorName: 'Pr. Lucas Mendes', memberCount: 200, engagementScore: 81 },
    { id: 'ch8', name: 'Igreja Inspire Porto Alegre', city: 'Porto Alegre', state: 'RS', lat: -30.03, lng: -51.23, pastorName: 'Pr. Daniel Souza', memberCount: 170, engagementScore: 76 },
    { id: 'ch9', name: 'Igreja Inspire Fortaleza', city: 'Fortaleza', state: 'CE', lat: -3.72, lng: -38.53, pastorName: 'Pr. Paulo Reis', memberCount: 130, engagementScore: 72 },
    { id: 'ch10', name: 'Igreja Inspire Manaus', city: 'Manaus', state: 'AM', lat: -3.12, lng: -60.02, pastorName: 'Pra. Raquel Dias', memberCount: 90, engagementScore: 68 },
  ])

  // Plans
  storeSet('plans', [
    { id: 'pl1', userId: 'u1', type: 'sunday', title: 'Culto Domingo 09/03', data: { worship: 'Oceanos, Grande é o Senhor', message: 'Série Propósitos - Parte 3', notes: 'Preparar equipe de recepção' }, createdAt: '2026-03-03', updatedAt: '2026-03-05' },
    { id: 'pl2', userId: 'u1', type: 'annual', title: 'Planejamento 2026', data: { goals: 'Crescer 20% em células\nCapacitar 50 novos líderes\nLançar 3 novas frentes ministeriais', events: 'Jan: Retiro de líderes\nAbr: Páscoa\nJun: Conferência\nDez: Natal' }, createdAt: '2026-01-10', updatedAt: '2026-02-28' },
    { id: 'pl3', userId: 'u1', type: 'ministry', title: 'Ministério Jovens - Q1', data: { ministry: 'jovens', objectives: 'Engajar 30 jovens novos\nFormar 5 novos líderes', resources: 'Sala de reunião, projetor, materiais Bold' }, createdAt: '2026-01-15', updatedAt: '2026-02-20' },
  ])

  // Podcast episodes
  storeSet('podcast_episodes', [
    { id: 'ep1', title: 'Liderança que Transforma', description: 'Pr. Carlos fala sobre os desafios da liderança pastoral moderna e como manter a chama acesa', durationSeconds: 2400, audioUrl: '', publishedAt: '2026-03-01' },
    { id: 'ep2', title: 'Crescendo em Comunidade', description: 'Como fortalecer os laços na sua igreja local e criar uma cultura de pertencimento', durationSeconds: 1800, audioUrl: '', publishedAt: '2026-02-22' },
    { id: 'ep3', title: 'Plantação de Igrejas', description: 'Experiências e aprendizados de quem plantou igrejas — erros e acertos', durationSeconds: 3000, audioUrl: '', publishedAt: '2026-02-15' },
    { id: 'ep4', title: 'Saúde Emocional do Pastor', description: 'Cuidando de quem cuida — um papo necessário sobre burnout e autocuidado', durationSeconds: 2100, audioUrl: '', publishedAt: '2026-02-08' },
    { id: 'ep5', title: 'Finanças Ministeriais', description: 'Gestão financeira com sabedoria e transparência na igreja local', durationSeconds: 1500, audioUrl: '', publishedAt: '2026-02-01' },
  ])

  // Podcast progress
  storeSet('podcast_progress', [
    { id: 'pp1', episodeId: 'ep1', userId: 'u1', currentTime: 600, completed: false },
  ])

  // Timeline events
  storeSet('timeline_events', [
    { id: 'te1', type: 'adesao', title: 'Adesão à Rede Inspire', description: 'Igreja filiada oficialmente', date: '2024-01-15' },
    { id: 'te2', type: 'mentoria', title: 'Primeira mentoria concluída', description: 'Mentoria com Pr. Marcos', date: '2024-06-20' },
    { id: 'te3', type: 'marco', title: '10 líderes cadastrados', description: 'Marco de crescimento', date: '2024-09-10' },
    { id: 'te4', type: 'marco', title: '50 conteúdos acessados', description: 'Engajamento crescente', date: '2025-03-01' },
    { id: 'te5', type: 'conquista', title: 'Top 5 igrejas engajadas', description: 'Reconhecimento nacional', date: '2025-08-15' },
    { id: 'te6', type: 'marco', title: '100 trilhas concluídas pela equipe', description: 'Capacitação em massa', date: '2026-01-10' },
  ])

  // Recent accesses (for dashboard)
  storeSet('recent_accesses', [
    { userId: 'u2', name: 'Maria Silva', contentId: 'ct1', contentTitle: 'Liderança Servidora', lastAccessAt: '2026-03-06T10:30:00' },
    { userId: 'u3', name: 'João Santos', contentId: 'ct3', contentTitle: 'Guia de Células', lastAccessAt: '2026-03-06T09:15:00' },
    { userId: 'u4', name: 'Ana Oliveira', contentId: 'ct4', contentTitle: 'Worship Kids', lastAccessAt: '2026-03-05T18:45:00' },
    { userId: 'u5', name: 'Pedro Costa', contentId: 'ct11', contentTitle: 'Gestão Ministerial', lastAccessAt: '2026-03-05T14:20:00' },
    { userId: 'u6', name: 'Carla Lima', contentId: 'ct6', contentTitle: 'Casais em Aliança', lastAccessAt: '2026-03-04T20:00:00' },
  ])

  // User content history
  storeSet('user_history_u1', [
    { contentId: 'ct1', title: 'Liderança Servidora', accessedAt: '2026-03-06T08:00:00' },
    { contentId: 'ct11', title: 'Gestão Ministerial 2026', accessedAt: '2026-03-05T14:00:00' },
    { contentId: 'ct3', title: 'Guia de Células', accessedAt: '2026-03-04T10:00:00' },
  ])

  storeSet('seed_version', SEED_VERSION)
}
