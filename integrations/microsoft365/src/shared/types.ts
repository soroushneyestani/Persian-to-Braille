import type {
  PersianBrailleTranslationResult,
  PersianBrailleTranslator,
} from "@persian-braille/sdk";

export type OfficeHostKind =
  | "word"
  | "excel"
  | "powerpoint";

export interface OfficeHostCapabilities {
  readonly hostKind:
    OfficeHostKind;
  readonly hostLabel:
    string;
  readonly requirementSet:
    string;
  readonly minimumVersion:
    string;
  readonly canReplace:
    boolean;
  readonly canInsertAfter:
    boolean;
}

export interface OfficeHostFailure {
  readonly ok: false;
  readonly domain: "host";
  readonly code: string;
  readonly message: string;
}

export interface OfficeMutationSuccess {
  readonly ok: true;
}

export type OfficeMutationResult =
  | OfficeMutationSuccess
  | OfficeHostFailure;

export type OfficeSdkTranslationSuccess =
  Extract<
    PersianBrailleTranslationResult,
    { readonly ok: true }
  >;

export type OfficeSdkTranslationFailure =
  Extract<
    PersianBrailleTranslationResult,
    { readonly ok: false }
  >;

export interface OfficeTranslationPreview<
  TMutationContext,
> {
  readonly ok: true;
  readonly sourceText: string;
  readonly translation:
    OfficeSdkTranslationSuccess;
  readonly mutationContext:
    TMutationContext;
}

export interface OfficeApplicationFailure {
  readonly ok: false;
  readonly source: "application";
  readonly code: string;
  readonly message: string;
}

export interface OfficeHostTranslationFailure {
  readonly ok: false;
  readonly source: "host";
  readonly failure:
    OfficeHostFailure;
}

export interface OfficeSdkTranslationFailureResult {
  readonly ok: false;
  readonly source: "translation";
  readonly sourceText: string;
  readonly translation:
    OfficeSdkTranslationFailure;
}

export type OfficeSelectionTranslationResult<
  TMutationContext,
> =
  | OfficeTranslationPreview<TMutationContext>
  | OfficeApplicationFailure
  | OfficeHostTranslationFailure
  | OfficeSdkTranslationFailureResult;

export interface OfficeSelectionService<
  TMutationContext,
> {
  readonly translator:
    PersianBrailleTranslator;

  translateSelection():
    Promise<
      OfficeSelectionTranslationResult<
        TMutationContext
      >
    >;

  replaceWithBraille(
    preview:
      OfficeTranslationPreview<
        TMutationContext
      >,
  ): Promise<OfficeMutationResult>;

  insertBrailleAfter?(
    preview:
      OfficeTranslationPreview<
        TMutationContext
      >,
  ): Promise<OfficeMutationResult>;
}
