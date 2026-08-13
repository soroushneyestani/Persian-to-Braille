import { faIrG1RuntimeSpecification } from "./generated/fa-ir-g1.runtime.js";

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue =
  | JsonPrimitive
  | JsonObject
  | readonly JsonValue[];

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export interface RuntimeSpecificationSource {
  readonly profilePath: string;
  readonly rulesDirectory: string;
  readonly canonicalJsonSha256: string;
  readonly profileCanonicalJsonSha256: string;
  readonly ruleCanonicalJsonSha256: string;
}

export interface RuntimeSpecificationSummary {
  readonly ruleCount: number;
  readonly statusCounts: Readonly<Record<string, number>>;
  readonly typeCounts: Readonly<Record<string, number>>;
}

export interface RuntimeSpecificationBundle {
  readonly schemaVersion: number;
  readonly profileId: string;
  readonly profileVersion: string;
  readonly profileStatus: string;
  readonly source: RuntimeSpecificationSource;
  readonly summary: RuntimeSpecificationSummary;
  readonly profile: JsonObject;
  readonly rules: readonly JsonObject[];
}

const bundledSpecification =
  faIrG1RuntimeSpecification as unknown as RuntimeSpecificationBundle;

/**
 * Returns the build-time generated runtime view of the canonical
 * Persian Braille specification.
 *
 * The returned data is derivative. The repository's `spec/` artifacts remain
 * the source of truth.
 */
export function getBundledSpecification(): RuntimeSpecificationBundle {
  return bundledSpecification;
}
