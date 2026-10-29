// Remove caracteres de controle e aspas do nome original, para uso seguro
// no header Content-Disposition (evita injecao de header).
export function sanitizeFilename(name: string): string {
  return name.replace(/[\r\n"]/g, "").trim() || "arquivo";
}
