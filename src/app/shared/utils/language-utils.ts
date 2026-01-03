const languageLabelMap: Record<string, string> = {
  eng: 'English',
  ita: 'Italian',
  fre: 'French',
  fra: 'French',
  ger: 'German',
  deu: 'German',
  spa: 'Spanish',
  jpn: 'Japanese',
  por: 'Portuguese',
  rus: 'Russian',
  zho: 'Chinese',
  chi: 'Chinese',
  ara: 'Arabic',
  hin: 'Hindi',
  kor: 'Korean',
  nld: 'Dutch',
  dut: 'Dutch',
  swe: 'Swedish',
  nor: 'Norwegian',
  dan: 'Danish',
  fin: 'Finnish',
  pol: 'Polish',
  tur: 'Turkish',
};

export const formatLanguageCodes = (codes?: string[]): string | null => {
  if (!codes?.length) {
    return null;
  }

  const labels: string[] = [];
  const seen = new Set<string>();
  for (const raw of codes) {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) {
      continue;
    }
    const label = languageLabelMap[normalized] ?? normalized.toUpperCase();
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }

  return labels.length ? labels.join(', ') : null;
};
