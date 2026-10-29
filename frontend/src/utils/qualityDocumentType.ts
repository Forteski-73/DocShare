import type { QualityDocumentType } from "../types";

export type QualityDocumentTypeSlug = "formularios" | "procedimentos-internos";

const SLUG_TO_TYPE: Record<QualityDocumentTypeSlug, QualityDocumentType> = {
  formularios: "FORMULARIO",
  "procedimentos-internos": "PROCEDIMENTO_INTERNO",
};

const TYPE_TO_SLUG: Record<QualityDocumentType, QualityDocumentTypeSlug> = {
  FORMULARIO: "formularios",
  PROCEDIMENTO_INTERNO: "procedimentos-internos",
};

const TYPE_TO_LABEL: Record<QualityDocumentType, string> = {
  FORMULARIO: "Formulários",
  PROCEDIMENTO_INTERNO: "Procedimentos Internos",
};

export function isQualityDocumentTypeSlug(
  value: string | undefined
): value is QualityDocumentTypeSlug {
  return !!value && value in SLUG_TO_TYPE;
}

export function qualityDocumentTypeSlugToType(slug: QualityDocumentTypeSlug): QualityDocumentType {
  return SLUG_TO_TYPE[slug];
}

export function qualityDocumentTypeToSlug(type: QualityDocumentType): QualityDocumentTypeSlug {
  return TYPE_TO_SLUG[type];
}

export function qualityDocumentTypeDisplayName(type: QualityDocumentType): string {
  return TYPE_TO_LABEL[type];
}
