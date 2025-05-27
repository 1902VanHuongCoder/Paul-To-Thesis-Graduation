import { dictionaries } from "@/lib/dictionaries";

export async function loadDictionary(lang: "en" | "vi") {
  const dict = await dictionaries[lang]();
  if (dict.default) {
    const { default: _default, ...rest } = dict;
    return { ..._default, ...Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "default")) };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { default: _defaultValue, ...rest } = dict;
    return rest as Record<string, string>;
  }
}