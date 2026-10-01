/**
 * Types voor fabrikantdocumentatie. Alleen vastgelegd; er is nog geen ingest.
 * Manufacturer → ProductFamily → Appliance → Document → DocumentVersion → Chunk → Citation
 */

export interface Manufacturer {
  id: string;
  name: string;
}

export interface ProductFamily {
  id: string;
  manufacturerId: string;
  name: string;
}

export interface ApplianceRef {
  id: string;
  productFamilyId: string;
  model: string;
}

export type DocumentKind = 'installation' | 'service' | 'user' | 'parts' | 'other';

export interface Document {
  id: string;
  applianceIds: string[];
  kind: DocumentKind;
  title: string;
  language: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  /** Versie- of revisieaanduiding zoals op het document. */
  revision: string;
  /** Pad in content/docs/. */
  file: string;
  publishedAt?: string;
}

export interface Chunk {
  id: string;
  documentVersionId: string;
  page: number;
  text: string;
}

export interface Citation {
  chunkId: string;
  documentVersionId: string;
  page: number;
  quote?: string;
}
