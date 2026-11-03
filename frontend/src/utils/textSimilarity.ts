// ---- Similarity helpers ----
// Extraídos de MaterialsPage.tsx para reuso compartilhado (HomePage/recomendação).
// Coeficiente tipo Dice: common / sqrt(|A|·|B|).
export const STOP_WORDS = new Set(['de','do','da','dos','das','o','a','os','as','e','em','um','uma','para','com','por','que','no','na','nos','nas','ao','aos','à','às','se','ou','mas','como','mais','este','essa','isso','1','2','3','4','5','6','7','8','9','0','-'])

export function tokenize(text: string): string[] {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

export function similarity(a: string, b: string): number {
  const ta = new Set(tokenize(a))
  const tb = new Set(tokenize(b))
  if (ta.size === 0 || tb.size === 0) return 0
  let common = 0
  ta.forEach(w => { if (tb.has(w)) common++ })
  return common / Math.sqrt(ta.size * tb.size) // Dice-like coefficient
}
