export const dictionaries = {
  en: async () => (await import('../dictionaries/en.json')),
  vi: async () => (await import('../dictionaries/vi.json'))
};