export const dictionaries = {
  en: () => import('../dictionaries/en.json').then((m) => m.default),
  vi: () => import('../dictionaries/vi.json').then((m) => m.default),
};
