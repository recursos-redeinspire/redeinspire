import { Category } from '../types';

/**
 * Categorias estáticas da Plataforma Rede Inspire
 * Conforme Requisito 3.1 da especificação
 */
export const CATEGORIES: Category[] = [
  {
    slug: 'mensagens',
    name: 'Mensagens',
    description: 'Mensagens e pregações para uso em cultos e reuniões',
    contentCount: 0,
  },
  {
    slug: 'serie-de-mensagens',
    name: 'Série de Mensagens',
    description: 'Séries temáticas de mensagens para acompanhamento contínuo',
    contentCount: 0,
  },
  {
    slug: 'campanhas',
    name: 'Campanhas',
    description: 'Materiais e recursos para campanhas da igreja',
    contentCount: 0,
  },
  {
    slug: 'pequenos-grupos',
    name: 'Pequenos Grupos',
    description: 'Conteúdos e dinâmicas para células e pequenos grupos',
    contentCount: 0,
  },
  {
    slug: 'criancas',
    name: 'Crianças',
    description: 'Ministério infantil com materiais por faixa etária',
    contentCount: 0,
    subcategories: [
      { slug: 'criancas-baby', name: 'Baby', description: 'Materiais para berçário e primeira infância', contentCount: 0 },
      { slug: 'criancas-kids', name: 'Kids', description: 'Materiais para crianças em idade escolar', contentCount: 0 },
      { slug: 'criancas-shine', name: 'Shine', description: 'Programa Shine para crianças', contentCount: 0 },
      { slug: 'criancas-overdrive', name: 'Overdrive', description: 'Programa Overdrive para pré-adolescentes', contentCount: 0 },
    ],
  },
  {
    slug: 'jovens',
    name: 'Jovens',
    description: 'Ministério de jovens com programas específicos',
    contentCount: 0,
    subcategories: [
      { slug: 'jovens-bold', name: 'Bold', description: 'Programa Bold para jovens', contentCount: 0 },
      { slug: 'jovens-burn', name: 'Burn', description: 'Programa Burn para jovens', contentCount: 0 },
      { slug: 'jovens-a3', name: 'A3', description: 'Programa A3 para jovens', contentCount: 0 },
    ],
  },
  {
    slug: 'adolescentes',
    name: 'Adolescentes',
    description: 'Conteúdos voltados para o ministério de adolescentes',
    contentCount: 0,
  },
  {
    slug: 'homens',
    name: 'Homens',
    description: 'Materiais para o ministério de homens',
    contentCount: 0,
  },
  {
    slug: 'mulheres',
    name: 'Mulheres',
    description: 'Materiais para o ministério de mulheres',
    contentCount: 0,
  },
  {
    slug: 'casais',
    name: 'Casais',
    description: 'Conteúdos para o ministério de casais',
    contentCount: 0,
  },
  {
    slug: '5-propositos',
    name: '5 Propósitos',
    description: 'Materiais baseados nos 5 propósitos da igreja',
    contentCount: 0,
  },
  {
    slug: 'empresarios',
    name: 'Empresários',
    description: 'Conteúdos para líderes empresariais e empreendedores',
    contentCount: 0,
  },
  {
    slug: '30-semanas',
    name: '30 Semanas',
    description: 'Programa de 30 semanas de desenvolvimento',
    contentCount: 0,
  },
  {
    slug: 'velos',
    name: 'Velos',
    description: 'Programa Velos de capacitação',
    contentCount: 0,
  },
  {
    slug: 'gestao-ministerial',
    name: 'Gestão Ministerial',
    description: 'Ferramentas e treinamentos para gestão de ministérios',
    contentCount: 0,
  },
  {
    slug: 'pesquisas',
    name: 'Pesquisas',
    description: 'Pesquisas e estudos relevantes para a liderança',
    contentCount: 0,
  },
  {
    slug: 'mentorias',
    name: 'Mentorias',
    description: 'Sessões de mentoria e acompanhamento pastoral',
    contentCount: 0,
  },
  {
    slug: 'webinar',
    name: 'Webinar',
    description: 'Webinars ao vivo e gravados sobre temas relevantes',
    contentCount: 0,
  },
  {
    slug: 'trilhas',
    name: 'Trilhas',
    description: 'Trilhas de aprendizado estruturadas',
    contentCount: 0,
  },
  {
    slug: 'eventos',
    name: 'Eventos',
    description: 'Materiais e informações sobre eventos da rede',
    contentCount: 0,
  },
  {
    slug: 'casa-de-paz',
    name: 'Casa de Paz',
    description: 'Recursos para o ministério Casa de Paz',
    contentCount: 0,
  },
  {
    slug: 'materiais-para-lideranca',
    name: 'Materiais para Liderança',
    description: 'Recursos exclusivos para desenvolvimento de líderes',
    contentCount: 0,
  },
  {
    slug: 'retiros',
    name: 'Retiros',
    description: 'Materiais e planejamento para retiros espirituais',
    contentCount: 0,
  },
];

/** All valid category slugs including subcategories */
export function getAllCategorySlugs(): string[] {
  const slugs: string[] = [];
  for (const cat of CATEGORIES) {
    slugs.push(cat.slug);
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        slugs.push(sub.slug);
      }
    }
  }
  return slugs;
}

/** Find a category by slug (searches top-level and subcategories) */
export function findCategoryBySlug(slug: string): Category | undefined {
  for (const cat of CATEGORIES) {
    if (cat.slug === slug) return cat;
    if (cat.subcategories) {
      const sub = cat.subcategories.find((s) => s.slug === slug);
      if (sub) return sub;
    }
  }
  return undefined;
}
