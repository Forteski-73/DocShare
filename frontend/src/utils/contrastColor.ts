// Formula YIQ: heuristica simples e amplamente usada para decidir se um texto
// deve ser claro ou escuro em cima de uma cor de fundo arbitraria.
export function getContrastTextColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#1a1a1a" : "#ffffff";
}
