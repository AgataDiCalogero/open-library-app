export const normalizeSubjectLabel = (value: string): string => {
  const cleaned = value.replaceAll('_', ' ').replaceAll(/\s+/g, ' ').trim();
  if (!cleaned) {
    return '';
  }

  const hasLetters = /[A-Za-z]/.test(cleaned);
  if (!hasLetters) {
    return cleaned;
  }

  const isAllUpper = cleaned === cleaned.toUpperCase();
  const isAllLower = cleaned === cleaned.toLowerCase();
  if (!isAllUpper && !isAllLower) {
    return cleaned;
  }

  return cleaned
    .toLowerCase()
    .replaceAll(/(^|\s|\(|\[|-)([a-z])/g, (_match, prefix, char: string) => {
      return `${prefix}${char.toUpperCase()}`;
    });
};
