import type { LabelType } from "../types";

export type LabelTypeSlug = "piso-laminado" | "acessorio" | "documento";

const SLUG_TO_TYPE: Record<LabelTypeSlug, LabelType> = {
  "piso-laminado": "PISO_LAMINADO",
  acessorio: "ACESSORIO",
  documento: "DOCUMENTO",
};

const TYPE_TO_SLUG: Record<LabelType, LabelTypeSlug> = {
  PISO_LAMINADO: "piso-laminado",
  ACESSORIO: "acessorio",
  DOCUMENTO: "documento",
};

const TYPE_TO_LABEL: Record<LabelType, string> = {
  PISO_LAMINADO: "Piso Laminado",
  ACESSORIO: "Acessório",
  DOCUMENTO: "Documentos",
};

export function isLabelTypeSlug(value: string | undefined): value is LabelTypeSlug {
  return !!value && value in SLUG_TO_TYPE;
}

export function labelTypeSlugToType(slug: LabelTypeSlug): LabelType {
  return SLUG_TO_TYPE[slug];
}

export function labelTypeToSlug(type: LabelType): LabelTypeSlug {
  return TYPE_TO_SLUG[type];
}

export function labelTypeDisplayName(type: LabelType): string {
  return TYPE_TO_LABEL[type];
}
