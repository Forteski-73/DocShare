import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(value: string | Date): string {
  return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
}
