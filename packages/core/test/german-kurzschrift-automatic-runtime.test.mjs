import assert from "node:assert/strict";
import test from "node:test";

import {
  GERMAN_KURZSCHRIFT_AUTOMATIC_PRECEDENCE_TOTAL_ORDER_INVENTED,
  GERMAN_KURZSCHRIFT_AUTOMATIC_PROVIDER_KIND,
  GERMAN_KURZSCHRIFT_AUTOMATIC_UNKNOWN_CONTEXT_POLICY,
  resolveGermanKurzschriftAutomaticDecision,
  translateGermanKurzschriftAutomatic,
} from "../dist/index.js";

const V = {
  "decisionVectors": [
    {
      "input": "\"ach\"",
      "target": "ACH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "\"ck\"",
      "target": "CK",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "\"eh\"",
      "target": "EH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "\"ich\"",
      "target": "ICH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "\"ig\"",
      "target": "IG",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "\"lich\"",
      "target": "LICH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "\"ll\" und \"mm\"",
      "target": "LL/MM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "\"te\"",
      "target": "TE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Aachen",
      "target": "ACH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "aberkennen",
      "target": "ABER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Aberwitz",
      "target": "ABER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Aberwitz",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "abwärts",
      "target": "WÄRTS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Abwärtstrend",
      "target": "WÄRTS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Aeroflot",
      "target": "ER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "alle",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "allein",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "allenthalben",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "allerdings",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Allergie",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_EXTENSION_ONLY_ALL_FORM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "alles",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "anhatte",
      "target": "HATT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Antichrist",
      "target": "ICH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Araber",
      "target": "aber",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Areligiös",
      "target": "AR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Arhythmisch",
      "target": "AR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "assistieren",
      "target": "SS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED_ACROSS_PREFIX_STEM_BOUNDARY",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Auch-im-Verborgenen-Blühen",
      "target": "IM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_AT_HYPHEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "auf's",
      "target": "APOSTROPHIZED_ATTACHMENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "OMIT_POINT2_ANNOUNCEMENT",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "aufhätte",
      "target": "HÄTT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Balsam",
      "target": "SAM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Bar",
      "target": "AR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Barschaft",
      "target": "SCHAFT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_SCHAFT_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Baumwolle",
      "target": "woll",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Be- lichtung",
      "target": "HYPHENATION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "OTHERWISE_PRESERVE_UNBROKEN_WORD_LOGIC",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "beerben",
      "target": "BE/ER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Beeren",
      "target": "BE/ER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "belanglos",
      "target": "lang",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Belich- tung",
      "target": "HYPHENATION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "OTHERWISE_PRESERVE_UNBROKEN_WORD_LOGIC",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Benefiz",
      "target": "VOWEL_INITIAL_LAUTGRUPPE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "VOWEL_INITIAL_GROUP_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "bereit",
      "target": "BE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "BE_GE_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Beschwerde",
      "target": "werd",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "besondere",
      "target": "BESONDER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "besonderer",
      "target": "BESONDER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "besonders",
      "target": "BESONDER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Besuch",
      "target": "BE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "BE_GE_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Bewirtung",
      "target": "wir",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "bisher",
      "target": "bis",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Bissen",
      "target": "bis",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Bleiberecht",
      "target": "BLEIB",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Bleibeschichtung",
      "target": "BLEIB",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Blumensamen",
      "target": "SAM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Cello",
      "target": "C",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_LITERAL_LETTER_DISAMBIGUATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Chinese",
      "target": "SOURCE_RENDERING",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "D'Artagnan",
      "target": "POST_APOSTROPHE_CONTRACTION_SET",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_IMMEDIATELY_AFTER_APOSTROPHE",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "D'Elena",
      "target": "POST_APOSTROPHE_CONTRACTION_SET",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_IMMEDIATELY_AFTER_APOSTROPHE",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "dagewesen",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Dankeschön",
      "target": "DANK",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "das All",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_EXTENSION_ONLY_ALL_FORM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Das Ei",
      "target": "EI",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "PREFIX_AUFHEBUNGSPUNKT",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "das In-sich-Sein",
      "target": "SEIN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "das wars",
      "target": "WAR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "das Weltall",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_EXTENSION_ONLY_ALL_FORM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Dasein",
      "target": "SEIN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SOURCE_FORM_REJECTS_SEIN_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Dehydrieren",
      "target": "EH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Dell'Angelo",
      "target": "POST_APOSTROPHE_CONTRACTION_SET",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_IMMEDIATELY_AFTER_APOSTROPHE",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "demnach",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Demontieren",
      "target": "EM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Denkmalpflege",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "des Weltalls",
      "target": "ALL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_EXTENSION_ONLY_ALL_FORM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "dezimal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "die Hast",
      "target": "hast",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "die Seinigen",
      "target": "SEIN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "die Ware",
      "target": "WAR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "die Würde",
      "target": "WÜRD",
      "resolutionKind": "COMPATIBLE_LAYERED_ALLOW",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 2
    },
    {
      "input": "diesbezüglich",
      "target": "DIES",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SOURCE_FORM_REJECTS_EXTENSION_ONLY_DIES",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "diese",
      "target": "DIES",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "diesen",
      "target": "DIES",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "dieserhalb",
      "target": "DIES",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "diesmal",
      "target": "DIES",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "diesseits",
      "target": "DIES",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SOURCE_FORM_REJECTS_EXTENSION_ONLY_DIES",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "drauf",
      "target": "PREPOSITION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "drunter und drüber",
      "target": "PREPOSITION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "du hast",
      "target": "hast",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "du warst",
      "target": "WAR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "durch's",
      "target": "APOSTROPHIZED_ATTACHMENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "OMIT_POINT2_ANNOUNCEMENT",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Ehe",
      "target": "EH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "KEEP_UNCONTRACTED_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Einheiten",
      "target": "HEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "einige",
      "target": "VOWEL_INITIAL_LAUTGRUPPE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "VOWEL_INITIAL_GROUP_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "einmal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Einmaleins",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "einmalig",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "einsam",
      "target": "SAM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Einsamkeit",
      "target": "SAM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "einstmals",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "einundachtzig",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Engelein",
      "target": "EL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED_DUE_BOUNDARY_UNCERTAINTY",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Ente",
      "target": "ENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Entente",
      "target": "ENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Entertainer",
      "target": "ENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Entgelt",
      "target": "ENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_PREFIX_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Entourage",
      "target": "ENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "enttäuschen",
      "target": "ENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_PREFIX_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Ereignisse",
      "target": "NIS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "erhaben",
      "target": "hab",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "erheitern",
      "target": "HEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Erlangen",
      "target": "lang",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Etmal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "etwelche",
      "target": "WELCH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Ewigkeit",
      "target": "KEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Familie",
      "target": "IE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "VOLLSCHRIFT_IE_CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "fasst",
      "target": "SS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SS_PRECEDES_ST_IN_SST",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Feenmärchen",
      "target": "EN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "fest",
      "target": "ST",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONSONANT_GROUP_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Firnis",
      "target": "NIS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "formal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Freiheit",
      "target": "HEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Fürsorge",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Ganztagsschule",
      "target": "GANZ",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Gegenteil",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "geheim",
      "target": "GE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "BE_GE_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Geheimniskrämerei",
      "target": "NIS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "geküsst",
      "target": "SS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SS_PRECEDES_ST_IN_SST",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Gelee",
      "target": "VOWEL_INITIAL_LAUTGRUPPE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "VOWEL_INITIAL_GROUP_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "geliebt",
      "target": "GE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "BE_GE_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "genau",
      "target": "GE",
      "resolutionKind": "SOURCE_PRECEDENCE_WITH_HISTORICAL_GUARD",
      "operativeDecision": "BE_GE_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 2
    },
    {
      "input": "Generation",
      "target": "SOURCE_RENDERING",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Gera",
      "target": "VOWEL_INITIAL_LAUTGRUPPE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "VOWEL_INITIAL_GROUP_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Große Antillen",
      "target": "Groß",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "haben",
      "target": "hab",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Habilitation",
      "target": "hab",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Habitus",
      "target": "hab",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Hal- le",
      "target": "HYPHENATION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "RECOMPUTE_AFTER_WORD_DIVISION",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Halle",
      "target": "LL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONSONANT_GROUP_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Harmonie",
      "target": "IE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "VOLLSCHRIFT_IE_CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "hatt",
      "target": "HATT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "hatte",
      "target": "HATT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "hattest",
      "target": "HATT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Hemmnis",
      "target": "NIS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "herbei",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Herrschaft",
      "target": "SCHAFT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_SCHAFT_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "hinauf",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "hindurch",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "hinüber",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Hoheit",
      "target": "HEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_HEIT_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Hänschen",
      "target": "SCH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CONTRACT_ACROSS_SUFFIX_BOUNDARY",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "hätt",
      "target": "HÄTT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "hätte",
      "target": "HÄTT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "hättest",
      "target": "HÄTT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "höflicher",
      "target": "SOURCE_RENDERING",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Höflichkeitsform",
      "target": "KEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "ich hatt' einen Kameraden",
      "target": "HATT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "ich würde",
      "target": "würd",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "ihr wart",
      "target": "WAR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "ihre",
      "target": "IHR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "ihren",
      "target": "IHR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "ihrethalben",
      "target": "IHR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "ihrige",
      "target": "IHR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Ihro Gnaden",
      "target": "IHR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "ihrs",
      "target": "IHR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "illegal",
      "target": "LL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED_ACROSS_PREFIX_STEM_BOUNDARY",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Immergrün",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "immerzu",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "immobil",
      "target": "MM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED_ACROSS_PREFIX_STEM_BOUNDARY",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "insbesondere",
      "target": "BESONDER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "interstellar",
      "target": "stell",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Intranet",
      "target": "AN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "inwiefern",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "ist's",
      "target": "APOSTROPHIZED_ATTACHMENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "STANDALONE_CONTRACTION_REMAINS_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "je- mand",
      "target": "HYPHENATION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "RECOMPUTE_AFTER_WORD_DIVISION",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "jedenfalls",
      "target": "FALLS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "jemand",
      "target": "SOURCE_RENDERING",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MAY_CROSS_LEXICALIZED_HISTORICAL_SEAM",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Jetztmensch",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Jogginganzug",
      "target": "GANZ",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Kameldung",
      "target": "UNG",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Kasein",
      "target": "IN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Kastell",
      "target": "stell",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "keinesfalls",
      "target": "FALLS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Kindelein",
      "target": "EL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CONTRACT_ACROSS_SUFFIX_BOUNDARY",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Klang",
      "target": "Lang",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Klemme",
      "target": "MM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONSONANT_GROUP_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Koffein",
      "target": "IN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Kokain",
      "target": "IN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Kommission",
      "target": "MM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED_ACROSS_PREFIX_STEM_BOUNDARY",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Koordination",
      "target": "OR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Kran",
      "target": "AN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "krankheitshalber",
      "target": "HEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "kreieren",
      "target": "IE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Köstlichkeiten",
      "target": "KEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Landschaft",
      "target": "SCHAFT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "langfristig",
      "target": "lang",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "langsam",
      "target": "lang",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Languste",
      "target": "lang",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "letztes",
      "target": "letzt",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Liebschaften",
      "target": "SCHAFT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Mannschaftssport",
      "target": "SCHAFT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Maßstab",
      "target": "ß",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_LITERAL_LETTER_DISAMBIGUATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "maximal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Megalos",
      "target": "AL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Meldungen",
      "target": "UNG",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Menschen",
      "target": "SCH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_REQUIRED_BY_SOURCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Merkmal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Messer",
      "target": "SS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONSONANT_GROUP_PRECEDENCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "minimal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Mitgift",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Mitte",
      "target": "mit",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "mitteilen",
      "target": "mit",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Mittelmeer",
      "target": "Mittel",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "mitunter",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Moorwiese",
      "target": "OR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Mordanklage",
      "target": "DANK",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "munter",
      "target": "unter",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "möchte",
      "target": "MÖCHT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "möchtet",
      "target": "MÖCHT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Nachtessen",
      "target": "TE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Nachtigall",
      "target": "SOURCE_RENDERING",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MAY_CROSS_LEXICALIZED_HISTORICAL_SEAM",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "nauf",
      "target": "PREPOSITION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Neunmalklug",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "normal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "nunmehr",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "obschon",
      "target": "STANDALONE_ONLY_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_REUSE_STANDALONE_FORM_IN_COMPOUND",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "optimal",
      "target": "MAL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Paare",
      "target": "AR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Paris an der Seine",
      "target": "SEIN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SOURCE_FORM_REJECTS_SEIN_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Pastell",
      "target": "stell",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Personenwaage",
      "target": "PERSON",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Pleite bin ich!",
      "target": "ICH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BEFORE_ORDINAL_COMPATIBLE_PUNCTUATION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "postum",
      "target": "ST",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_REQUIRED_BY_SOURCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "proof",
      "target": "PRO",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Quel- le",
      "target": "HYPHENATION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "RECOMPUTE_AFTER_WORD_DIVISION",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Quelle",
      "target": "Q",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_LITERAL_LETTER_DISAMBIGUATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "raufen",
      "target": "Auf",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Rauheit",
      "target": "HEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_USE_HEIT_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Rebe",
      "target": "BE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Reglement",
      "target": "EM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CONTRACT_ACROSS_SUFFIX_BOUNDARY",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Reh",
      "target": "EH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Reinemachen",
      "target": "EM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Reiseleiter",
      "target": "EL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Rhein-Ruhr-Verkehrsverbund",
      "target": "VER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_AFTER_HYPHEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Rückwärtsgang",
      "target": "WÄRTS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "schleicht",
      "target": "leicht",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Schnur",
      "target": "nur",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Sehrest",
      "target": "sehr",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "seine",
      "target": "SEIN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "seinerseits",
      "target": "SEIN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "seines",
      "target": "SEIN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Seinsphilosophie",
      "target": "SEIN",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SOURCE_FORM_REJECTS_SEIN_CONTRACTION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Sesam",
      "target": "SAM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "sie waren",
      "target": "WAR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "siezen",
      "target": "STANDALONE_ONLY_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_REUSE_STANDALONE_FORM_IN_COMPOUND",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "so'n Lärm",
      "target": "APOSTROPHIZED_ATTACHMENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "OMIT_POINT2_ANNOUNCEMENT",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "sogar",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "solange",
      "target": "lang",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Speisesaal",
      "target": "ES",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Stellung",
      "target": "stell",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Stiefelschaft",
      "target": "SCHAFT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Stimme",
      "target": "SOURCE_RENDERING",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Supersonderpreis",
      "target": "PERSON",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Tal",
      "target": "AL",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Tennis",
      "target": "NIS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Test",
      "target": "TE",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "KEEP_UNCONTRACTED_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Tor",
      "target": "OR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Tunichtgut",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Türkeitourismus",
      "target": "KEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CROSS_WORD_SEAM",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "unentgeltlich",
      "target": "ENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_WORD_INITIAL",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "unters Bett",
      "target": "PREPOSITION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "unverkäuflich",
      "target": "VER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_WORD_INITIAL",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "unvollendet",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "unwürdig",
      "target": "WÜRD",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_TO_AVOID_UEBRIG_COLLISION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Vera",
      "target": "VER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Veranda",
      "target": "VER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Verdun",
      "target": "ver",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Vereinheitlichung",
      "target": "HEIT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Verkauf",
      "target": "VER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_PREFIX_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "verkleinern",
      "target": "SOURCE_RENDERING",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "verlangen",
      "target": "lang",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "verletzt",
      "target": "letzt",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "verlieren",
      "target": "VER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_PREFIX_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "vermöchte",
      "target": "MÖCHT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Vers",
      "target": "VER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "versehrt",
      "target": "sehr",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Versicherung",
      "target": "UNG",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "vertikal",
      "target": "VER",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "volle",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "vorbeischauen",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "vorm Haus",
      "target": "PREPOSITION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Vorpommern",
      "target": "vor",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "vorwärts",
      "target": "WÄRTS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Wachstum",
      "target": "ST",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "MUST_NOT_CONTRACT_ACROSS_SUFFIX_BOUNDARY",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Warenhaus",
      "target": "WAR",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Was'n Spaß",
      "target": "APOSTROPHIZED_ATTACHMENT",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "STANDALONE_CONTRACTION_REMAINS_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Wasserfalls",
      "target": "FALLS",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "DO_NOT_TREAT_FALL_AS_SUFFIX_FALLS",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "welch",
      "target": "WELCH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "welche",
      "target": "WELCH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "welchen",
      "target": "WELCH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "welcherlei",
      "target": "WELCH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "welches",
      "target": "WELCH",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_UNANNOUNCED_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Werdohl",
      "target": "werd",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Wirgefühl",
      "target": "wir",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "wirksame",
      "target": "SAM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Wirsing",
      "target": "wir",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_FORBIDDEN",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Woll- teppich",
      "target": "HYPHENATION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "OTHERWISE_PRESERVE_UNBROKEN_WORD_LOGIC",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "wollen",
      "target": "woll",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Wolltep- pich",
      "target": "HYPHENATION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "OTHERWISE_PRESERVE_UNBROKEN_WORD_LOGIC",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "wovon",
      "target": "ONE_FORM_WORD_CONTRACTION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "wurde",
      "target": "WURD",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "wurdest",
      "target": "WURD",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "würde",
      "target": "WÜRD",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "würdet",
      "target": "WÜRD",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "würdevoll",
      "target": "würd",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "würdig",
      "target": "WÜRD",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "SPELL_OUT_TO_AVOID_UEBRIG_COLLISION",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Xylophon",
      "target": "X/Y",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_LITERAL_LETTER_DISAMBIGUATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Zauberei",
      "target": "SOURCE_RENDERING",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "action": "POLICY_ONLY",
      "sourceRowCount": 1
    },
    {
      "input": "Zeitungsartikel",
      "target": "UNG",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "Zement",
      "target": "EM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_REQUIRED_BY_SOURCE",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "zuletzt",
      "target": "letzt",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "zweiformigen Lautgruppenkürzungen",
      "target": "TWO_FORM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "FORBIDDEN_AT_WORD_START",
      "action": "KEEP_PARENT",
      "sourceRowCount": 1
    },
    {
      "input": "Zweisamkeiten",
      "target": "SAM",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POST_STEM_CONTRACTION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "zweistellig",
      "target": "stell",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "CONTRACTION_ALLOWED",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    },
    {
      "input": "übers Wasser",
      "target": "PREPOSITION",
      "resolutionKind": "UNIQUE_SOURCE_DECISION",
      "operativeDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "action": "APPLY_TARGET",
      "sourceRowCount": 1
    }
  ],
  "contextualVectors": [
    {
      "id": "DE-KURZ-AUFHEB-ACCENT-001",
      "input": "Dubček",
      "expectedBraille": "⠙⠥⠃⠈⠉⠑⠅"
    },
    {
      "id": "DE-KURZ-AUFHEB-EXAMPLE-001",
      "input": "Center",
      "expectedBraille": "⠠⠉⠉⠞⠻"
    },
    {
      "id": "DE-KURZ-AUFHEB-EXAMPLE-002",
      "input": "Mocca",
      "expectedBraille": "⠍⠕⠠⠉⠠⠉⠁"
    },
    {
      "id": "DE-KURZ-AUFHEB-EXAMPLE-003",
      "input": "Quelle",
      "expectedBraille": "⠠⠟⠥⠑⠟⠑"
    },
    {
      "id": "DE-KURZ-AUFHEB-EXAMPLE-004",
      "input": "Xerxes",
      "expectedBraille": "⠠⠭⠻⠠⠭⠿"
    },
    {
      "id": "DE-KURZ-AUFHEB-EXAMPLE-005",
      "input": "Das Ei",
      "expectedBraille": "⠙ ⠠⠩"
    },
    {
      "id": "DE-KURZ-AUFHEB-EXAMPLE-006",
      "input": "Die Halbinsel Au (im Zürichsee)",
      "expectedBraille": "⠬ ⠓⠒⠃⠔⠎⠽ ⠠⠡"
    },
    {
      "id": "DE-KURZ-AUFHEB-EXAMPLE-007",
      "input": "Che Guevara",
      "expectedBraille": "⠠⠹⠑ ⠛⠥⠑⠧⠴⠁"
    },
    {
      "id": "DE-KURZ-AUFHEB-EXAMPLE-008",
      "input": "he (Ausruf)",
      "expectedBraille": "⠠⠓⠑"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-001",
      "input": "Ständehausstraße",
      "expectedBraille": "⠐⠾⠑⠓⠡⠎⠾⠗⠁⠠⠮⠑"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-002",
      "input": "Pappelweg",
      "expectedBraille": "⠏⠁⠏⠏⠽⠺⠛"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-003",
      "input": "Vorarlberg",
      "expectedBraille": "⠂⠢⠴⠇⠃⠻⠛"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-004",
      "input": "Untergasse",
      "expectedBraille": "⠂⠲⠛⠁⠮⠑"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-005",
      "input": "Friedensplatz",
      "expectedBraille": "⠋⠗⠬⠙⠉⠎⠏⠵"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-006",
      "input": "Vereinigte Staaten",
      "expectedBraille": "⠤⠫⠘⠦ ⠾⠞⠉"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-007",
      "input": "Großbritannien",
      "expectedBraille": "⠛⠮⠃⠗⠊⠞⠖⠝⠊⠉"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-001",
      "input": "Den Haag",
      "expectedBraille": "⠙⠉ ⠓⠁⠁⠛"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-002",
      "input": "Gorleben",
      "expectedBraille": "⠛⠢⠇⠑⠃⠉"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-003",
      "input": "Lausitz",
      "expectedBraille": "⠇⠡⠎⠊⠞⠵"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-004",
      "input": "Norwegen",
      "expectedBraille": "⠝⠢⠺⠑⠛⠉"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-005",
      "input": "Alexander",
      "expectedBraille": "⠒⠑⠠⠭⠖⠙⠻"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-006",
      "input": "Hohoff",
      "expectedBraille": "⠓⠕⠓⠕⠋⠋"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-001",
      "input": "völlig",
      "expectedBraille": "⠐⠟⠘"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-002",
      "input": "ich wäre",
      "expectedBraille": "⠼ ⠐⠴⠑"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-003",
      "input": "wir wären",
      "expectedBraille": "⠺⠗ ⠐⠴⠉"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-004",
      "input": "erträglich",
      "expectedBraille": "⠻⠐⠞⠛⠸"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-005",
      "input": "gründlich",
      "expectedBraille": "⠐⠛⠙⠸"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-006",
      "input": "ergänzen",
      "expectedBraille": "⠻⠐⠛⠵⠉"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-007",
      "input": "auffällig",
      "expectedBraille": "⠂⠡⠐⠋⠟⠘"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-008",
      "input": "größer",
      "expectedBraille": "⠐⠛⠮⠻"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-009",
      "input": "ständig",
      "expectedBraille": "⠐⠾⠘"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-010",
      "input": "verständlich",
      "expectedBraille": "⠤⠐⠾⠸"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-011",
      "input": "unzuständig",
      "expectedBraille": "⠲⠂⠵⠐⠾⠘"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-012",
      "input": "Fähre",
      "expectedBraille": "⠐⠗⠑"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-013",
      "input": "Gefährte",
      "expectedBraille": "⠯⠐⠗⠦"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-014",
      "input": "du fährst",
      "expectedBraille": "⠙⠥ ⠐⠗⠾"
    },
    {
      "id": "DE-KURZ-UMLAUT-EXAMPLE-015",
      "input": "lässig",
      "expectedBraille": "⠐⠇⠘"
    }
  ],
  "standaloneVectors": [
    {
      "input": "ABER",
      "expectedBraille": "⠁"
    },
    {
      "input": "ALS",
      "expectedBraille": "⠩"
    },
    {
      "input": "ALSO",
      "expectedBraille": "⠁⠕"
    },
    {
      "input": "ARBEIT",
      "expectedBraille": "⠴⠃"
    },
    {
      "input": "AUCH",
      "expectedBraille": "⠌"
    },
    {
      "input": "AUF",
      "expectedBraille": "⠡"
    },
    {
      "input": "BEI",
      "expectedBraille": "⠃"
    },
    {
      "input": "BEID",
      "expectedBraille": "⠃⠙"
    },
    {
      "input": "BEIM",
      "expectedBraille": "⠃⠍"
    },
    {
      "input": "BESSER",
      "expectedBraille": "⠎⠎"
    },
    {
      "input": "BIS",
      "expectedBraille": "⠃⠎"
    },
    {
      "input": "BIST",
      "expectedBraille": "⠃⠾"
    },
    {
      "input": "BLEIB",
      "expectedBraille": "⠃⠃"
    },
    {
      "input": "BRIEF",
      "expectedBraille": "⠃⠋"
    },
    {
      "input": "BRING",
      "expectedBraille": "⠃⠛"
    },
    {
      "input": "CHARAKTER",
      "expectedBraille": "⠹⠅"
    },
    {
      "input": "DABEI",
      "expectedBraille": "⠙⠃"
    },
    {
      "input": "DADURCH",
      "expectedBraille": "⠙⠙"
    },
    {
      "input": "DAFÜR",
      "expectedBraille": "⠙⠋"
    },
    {
      "input": "DAGEGEN",
      "expectedBraille": "⠙⠛"
    },
    {
      "input": "DAHER",
      "expectedBraille": "⠙⠓"
    },
    {
      "input": "DAMIT",
      "expectedBraille": "⠙⠍"
    },
    {
      "input": "DANK",
      "expectedBraille": "⠙⠅"
    },
    {
      "input": "DARAUF",
      "expectedBraille": "⠙⠡"
    },
    {
      "input": "DARÜBER",
      "expectedBraille": "⠙⠳"
    },
    {
      "input": "DAS",
      "expectedBraille": "⠙"
    },
    {
      "input": "DASS",
      "expectedBraille": "⠮"
    },
    {
      "input": "DAVON",
      "expectedBraille": "⠙⠧"
    },
    {
      "input": "DAZU",
      "expectedBraille": "⠙⠵"
    },
    {
      "input": "DEM",
      "expectedBraille": "⠷"
    },
    {
      "input": "DEMOKRAT",
      "expectedBraille": "⠙⠞"
    },
    {
      "input": "DEN",
      "expectedBraille": "⠑"
    },
    {
      "input": "DENEN",
      "expectedBraille": "⠑⠉"
    },
    {
      "input": "DENN",
      "expectedBraille": "⠙⠝"
    },
    {
      "input": "DER",
      "expectedBraille": "⠗"
    },
    {
      "input": "DES",
      "expectedBraille": "⠄"
    },
    {
      "input": "DESSEN",
      "expectedBraille": "⠙⠮"
    },
    {
      "input": "DEUTSCH",
      "expectedBraille": "⠙⠱"
    },
    {
      "input": "DIE",
      "expectedBraille": "⠬"
    },
    {
      "input": "DIR",
      "expectedBraille": "⠙⠗"
    },
    {
      "input": "DOCH",
      "expectedBraille": "⠙⠹"
    },
    {
      "input": "DRUCK",
      "expectedBraille": "⠙⠨"
    },
    {
      "input": "DURCH",
      "expectedBraille": "⠹"
    },
    {
      "input": "EBENSO",
      "expectedBraille": "⠑⠕"
    },
    {
      "input": "ETWA",
      "expectedBraille": "⠑⠁"
    },
    {
      "input": "ETWAS",
      "expectedBraille": "⠞⠺"
    },
    {
      "input": "FALL",
      "expectedBraille": "⠋⠟"
    },
    {
      "input": "FERTIG",
      "expectedBraille": "⠋⠘"
    },
    {
      "input": "FOLG",
      "expectedBraille": "⠋⠛"
    },
    {
      "input": "FREUND",
      "expectedBraille": "⠋⠙"
    },
    {
      "input": "FÜHR",
      "expectedBraille": "⠋⠓"
    },
    {
      "input": "FÜR",
      "expectedBraille": "⠋"
    },
    {
      "input": "GANZ",
      "expectedBraille": "⠛⠵"
    },
    {
      "input": "GEGEN",
      "expectedBraille": "⠛"
    },
    {
      "input": "GEGENWART",
      "expectedBraille": "⠛⠺"
    },
    {
      "input": "GEGENÜBER",
      "expectedBraille": "⠛⠳"
    },
    {
      "input": "GELEGEN",
      "expectedBraille": "⠛⠛"
    },
    {
      "input": "GESCHÄFT",
      "expectedBraille": "⠛⠋"
    },
    {
      "input": "GESELLSCHAFT",
      "expectedBraille": "⠛⠱"
    },
    {
      "input": "GEWESEN",
      "expectedBraille": "⠯"
    },
    {
      "input": "GEWORDEN",
      "expectedBraille": "⠯⠺"
    },
    {
      "input": "GIBT",
      "expectedBraille": "⠛⠃"
    },
    {
      "input": "GLEICH",
      "expectedBraille": "⠛⠹"
    },
    {
      "input": "GLÜCK",
      "expectedBraille": "⠛⠨"
    },
    {
      "input": "GROß",
      "expectedBraille": "⠛⠮"
    },
    {
      "input": "GRUND",
      "expectedBraille": "⠛⠙"
    },
    {
      "input": "HAFT",
      "expectedBraille": "⠓⠋"
    },
    {
      "input": "HAND",
      "expectedBraille": "⠓⠙"
    },
    {
      "input": "HAST",
      "expectedBraille": "⠓⠾"
    },
    {
      "input": "HAT",
      "expectedBraille": "⠓⠞"
    },
    {
      "input": "HATT",
      "expectedBraille": "⠓"
    },
    {
      "input": "HAUPT",
      "expectedBraille": "⠓⠏"
    },
    {
      "input": "HERR",
      "expectedBraille": "⠗⠗"
    },
    {
      "input": "HIER",
      "expectedBraille": "⠓⠗"
    },
    {
      "input": "HOFF",
      "expectedBraille": "⠋⠋"
    },
    {
      "input": "HÄTT",
      "expectedBraille": "⠜"
    },
    {
      "input": "IHM",
      "expectedBraille": "⠦"
    },
    {
      "input": "IHN",
      "expectedBraille": "⠊⠓"
    },
    {
      "input": "IHR",
      "expectedBraille": "⠊"
    },
    {
      "input": "IM",
      "expectedBraille": "⠤"
    },
    {
      "input": "IMMER",
      "expectedBraille": "⠭"
    },
    {
      "input": "IRGEND",
      "expectedBraille": "⠊⠛"
    },
    {
      "input": "IST",
      "expectedBraille": "⠾"
    },
    {
      "input": "JAHR",
      "expectedBraille": "⠚⠗"
    },
    {
      "input": "JAHRHUNDERT",
      "expectedBraille": "⠚⠓"
    },
    {
      "input": "JAHRTAUSEND",
      "expectedBraille": "⠚⠞"
    },
    {
      "input": "JAHRZEHNT",
      "expectedBraille": "⠚⠵"
    },
    {
      "input": "JED",
      "expectedBraille": "⠚⠙"
    },
    {
      "input": "JEDOCH",
      "expectedBraille": "⠚⠹"
    },
    {
      "input": "JETZIG",
      "expectedBraille": "⠚⠘"
    },
    {
      "input": "JETZT",
      "expectedBraille": "⠚"
    },
    {
      "input": "KANN",
      "expectedBraille": "⠅"
    },
    {
      "input": "KANNST",
      "expectedBraille": "⠅⠾"
    },
    {
      "input": "KAPITAL",
      "expectedBraille": "⠅⠏"
    },
    {
      "input": "KOMM",
      "expectedBraille": "⠅⠭"
    },
    {
      "input": "KONNT",
      "expectedBraille": "⠅⠞"
    },
    {
      "input": "KRAFT",
      "expectedBraille": "⠅⠋"
    },
    {
      "input": "KURZ",
      "expectedBraille": "⠅⠵"
    },
    {
      "input": "LANG",
      "expectedBraille": "⠇⠛"
    },
    {
      "input": "LEB",
      "expectedBraille": "⠇⠃"
    },
    {
      "input": "LEICHT",
      "expectedBraille": "⠇⠹"
    },
    {
      "input": "LETZT",
      "expectedBraille": "⠇⠞"
    },
    {
      "input": "LÄSST",
      "expectedBraille": "⠇"
    },
    {
      "input": "MAN",
      "expectedBraille": "⠍"
    },
    {
      "input": "MASCHIN",
      "expectedBraille": "⠍⠱"
    },
    {
      "input": "MATERIAL",
      "expectedBraille": "⠍⠇"
    },
    {
      "input": "MATERIELL",
      "expectedBraille": "⠍⠟"
    },
    {
      "input": "MEHR",
      "expectedBraille": "⠶"
    },
    {
      "input": "MIR",
      "expectedBraille": "⠍⠗"
    },
    {
      "input": "MIT",
      "expectedBraille": "⠞"
    },
    {
      "input": "MITTEL",
      "expectedBraille": "⠍⠞"
    },
    {
      "input": "MUSIK",
      "expectedBraille": "⠍⠅"
    },
    {
      "input": "MUSS",
      "expectedBraille": "⠍⠮"
    },
    {
      "input": "MÖGLICH",
      "expectedBraille": "⠍⠸"
    },
    {
      "input": "NACHDEM",
      "expectedBraille": "⠝⠙"
    },
    {
      "input": "NAHM",
      "expectedBraille": "⠝⠍"
    },
    {
      "input": "NATUR",
      "expectedBraille": "⠝⠞"
    },
    {
      "input": "NATÜRLICH",
      "expectedBraille": "⠝⠸"
    },
    {
      "input": "NEBEN",
      "expectedBraille": "⠝⠃"
    },
    {
      "input": "NEHM",
      "expectedBraille": "⠝⠓"
    },
    {
      "input": "NICHT",
      "expectedBraille": "⠝"
    },
    {
      "input": "NICHTS",
      "expectedBraille": "⠝⠎"
    },
    {
      "input": "NOCH",
      "expectedBraille": "⠝⠹"
    },
    {
      "input": "NOMMEN",
      "expectedBraille": "⠝⠭"
    },
    {
      "input": "NOTWENDIG",
      "expectedBraille": "⠝⠺"
    },
    {
      "input": "NUR",
      "expectedBraille": "⠝⠗"
    },
    {
      "input": "NUTZ",
      "expectedBraille": "⠝⠵"
    },
    {
      "input": "NÄCHST",
      "expectedBraille": "⠝⠾"
    },
    {
      "input": "ODER",
      "expectedBraille": "⠕"
    },
    {
      "input": "OHNE",
      "expectedBraille": "⠕⠑"
    },
    {
      "input": "PARAGRAF",
      "expectedBraille": "⠏⠛"
    },
    {
      "input": "PERSON",
      "expectedBraille": "⠏⠝"
    },
    {
      "input": "PLATZ",
      "expectedBraille": "⠏⠵"
    },
    {
      "input": "PLÖTZLICH",
      "expectedBraille": "⠏⠸"
    },
    {
      "input": "POLITIK",
      "expectedBraille": "⠏⠅"
    },
    {
      "input": "POLITISCH",
      "expectedBraille": "⠏⠱"
    },
    {
      "input": "PUNKT",
      "expectedBraille": "⠏⠞"
    },
    {
      "input": "RECHT",
      "expectedBraille": "⠗⠞"
    },
    {
      "input": "REGIER",
      "expectedBraille": "⠗⠛"
    },
    {
      "input": "REHABILIT",
      "expectedBraille": "⠗⠃"
    },
    {
      "input": "REPUBLIK",
      "expectedBraille": "⠗⠅"
    },
    {
      "input": "RÜCK",
      "expectedBraille": "⠗⠨"
    },
    {
      "input": "SAG",
      "expectedBraille": "⠎⠛"
    },
    {
      "input": "SATZ",
      "expectedBraille": "⠎⠵"
    },
    {
      "input": "SCHLAG",
      "expectedBraille": "⠱⠛"
    },
    {
      "input": "SCHLIEß",
      "expectedBraille": "⠱⠮"
    },
    {
      "input": "SCHON",
      "expectedBraille": "⠱"
    },
    {
      "input": "SCHREIB",
      "expectedBraille": "⠱⠃"
    },
    {
      "input": "SCHRIFT",
      "expectedBraille": "⠱⠞"
    },
    {
      "input": "SCHWIERIG",
      "expectedBraille": "⠱⠘"
    },
    {
      "input": "SEHR",
      "expectedBraille": "⠎⠗"
    },
    {
      "input": "SEIN",
      "expectedBraille": "⠪"
    },
    {
      "input": "SELBST",
      "expectedBraille": "⠎⠾"
    },
    {
      "input": "SICH",
      "expectedBraille": "⠉"
    },
    {
      "input": "SIE",
      "expectedBraille": "⠎"
    },
    {
      "input": "SIND",
      "expectedBraille": "⠎⠙"
    },
    {
      "input": "SO",
      "expectedBraille": "⠏"
    },
    {
      "input": "SOLCH",
      "expectedBraille": "⠎⠹"
    },
    {
      "input": "SONDERN",
      "expectedBraille": "⠎⠝"
    },
    {
      "input": "SOZIAL",
      "expectedBraille": "⠎⠇"
    },
    {
      "input": "STAAT",
      "expectedBraille": "⠾⠞"
    },
    {
      "input": "STETS",
      "expectedBraille": "⠾⠎"
    },
    {
      "input": "TECHNIK",
      "expectedBraille": "⠞⠅"
    },
    {
      "input": "TECHNISCH",
      "expectedBraille": "⠞⠱"
    },
    {
      "input": "TRAG",
      "expectedBraille": "⠞⠛"
    },
    {
      "input": "TREFF",
      "expectedBraille": "⠞⠋"
    },
    {
      "input": "TROTZ",
      "expectedBraille": "⠞⠵"
    },
    {
      "input": "UND",
      "expectedBraille": "⠥"
    },
    {
      "input": "UNTER",
      "expectedBraille": "⠲"
    },
    {
      "input": "VERHÄLTNIS",
      "expectedBraille": "⠧⠓"
    },
    {
      "input": "VIEL",
      "expectedBraille": "⠧⠇"
    },
    {
      "input": "VIELLEICHT",
      "expectedBraille": "⠧⠞"
    },
    {
      "input": "VOLK",
      "expectedBraille": "⠧⠅"
    },
    {
      "input": "VOLL",
      "expectedBraille": "⠟"
    },
    {
      "input": "VOM",
      "expectedBraille": "⠧⠍"
    },
    {
      "input": "VON",
      "expectedBraille": "⠧"
    },
    {
      "input": "VOR",
      "expectedBraille": "⠢"
    },
    {
      "input": "WAHR",
      "expectedBraille": "⠺⠓"
    },
    {
      "input": "WAR",
      "expectedBraille": "⠴"
    },
    {
      "input": "WAS",
      "expectedBraille": "⠺"
    },
    {
      "input": "WEG",
      "expectedBraille": "⠺⠛"
    },
    {
      "input": "WEIT",
      "expectedBraille": "⠺⠞"
    },
    {
      "input": "WELCH",
      "expectedBraille": "⠽"
    },
    {
      "input": "WENIG",
      "expectedBraille": "⠺⠘"
    },
    {
      "input": "WENN",
      "expectedBraille": "⠺⠝"
    },
    {
      "input": "WESENTLICH",
      "expectedBraille": "⠺⠸"
    },
    {
      "input": "WIE",
      "expectedBraille": "⠣"
    },
    {
      "input": "WIEDER",
      "expectedBraille": "⠬⠙"
    },
    {
      "input": "WILL",
      "expectedBraille": "⠺⠟"
    },
    {
      "input": "WIR",
      "expectedBraille": "⠺⠗"
    },
    {
      "input": "WIRD",
      "expectedBraille": "⠺⠙"
    },
    {
      "input": "WIRK",
      "expectedBraille": "⠺⠅"
    },
    {
      "input": "WIRST",
      "expectedBraille": "⠺⠾"
    },
    {
      "input": "WIRTSCHAFT",
      "expectedBraille": "⠺⠱"
    },
    {
      "input": "WISS",
      "expectedBraille": "⠺⠮"
    },
    {
      "input": "WOHL",
      "expectedBraille": "⠺⠇"
    },
    {
      "input": "WORDEN",
      "expectedBraille": "⠕⠉"
    },
    {
      "input": "WÄHREND",
      "expectedBraille": "⠜⠙"
    },
    {
      "input": "ZAHL",
      "expectedBraille": "⠵⠇"
    },
    {
      "input": "ZEIT",
      "expectedBraille": "⠵⠞"
    },
    {
      "input": "ZU",
      "expectedBraille": "⠵"
    },
    {
      "input": "ZUM",
      "expectedBraille": "⠵⠍"
    },
    {
      "input": "ZUNÄCHST",
      "expectedBraille": "⠵⠝"
    },
    {
      "input": "ZUR",
      "expectedBraille": "⠵⠗"
    },
    {
      "input": "ZURÜCK",
      "expectedBraille": "⠵⠨"
    },
    {
      "input": "ZUSAMMEN",
      "expectedBraille": "⠵⠎"
    },
    {
      "input": "ZWISCHEN",
      "expectedBraille": "⠵⠺"
    },
    {
      "input": "ÄHNLICH",
      "expectedBraille": "⠜⠸"
    },
    {
      "input": "ÖFFENTLICH",
      "expectedBraille": "⠪⠸"
    },
    {
      "input": "ÜBER",
      "expectedBraille": "⠳"
    },
    {
      "input": "ÜBERHAUPT",
      "expectedBraille": "⠳⠓"
    },
    {
      "input": "ÜBRIG",
      "expectedBraille": "⠳⠘"
    }
  ]
};

test(
  "automatic Kurzschrift provider boundary is explicit",
  () => {
    assert.equal(
      GERMAN_KURZSCHRIFT_AUTOMATIC_PROVIDER_KIND,
      "CLOSED_SOURCE_CONTEXT_RESOLVER",
    );
    assert.equal(
      GERMAN_KURZSCHRIFT_AUTOMATIC_UNKNOWN_CONTEXT_POLICY,
      "STRUCTURED_UNRESOLVED",
    );
    assert.equal(
      GERMAN_KURZSCHRIFT_AUTOMATIC_PRECEDENCE_TOTAL_ORDER_INVENTED,
      false,
    );
  },
);

for (const vector of V.contextualVectors) {
  test(
    `automatic Kurzschrift exact rendering ${vector.id}`,
    () => {
      const result =
        translateGermanKurzschriftAutomatic(
          vector.input,
        );

      assert.equal(
        result.ok,
        true,
        result.ok
          ? undefined
          : JSON.stringify(result),
      );

      if (!result.ok) {
        return;
      }

      assert.equal(
        result.unicodeBraille,
        vector.expectedBraille,
      );
      assert.equal(
        result.path,
        "EXACT_SOURCE_RENDERING",
      );
    },
  );
}

for (const vector of V.decisionVectors) {
  test(
    `automatic Kurzschrift source decision ${vector.input} / ${vector.target}`,
    () => {
      const result =
        resolveGermanKurzschriftAutomaticDecision(
          vector.input,
          vector.target,
        );

      assert.equal(
        result.ok,
        true,
        result.ok
          ? undefined
          : JSON.stringify(result),
      );

      if (!result.ok) {
        return;
      }

      assert.equal(
        result.resolutionKind,
        vector.resolutionKind,
      );
      assert.equal(
        result.operativeDecision,
        vector.operativeDecision,
      );
      assert.equal(
        result.action,
        vector.action,
      );
      assert.equal(
        result.sourceRows.length,
        vector.sourceRowCount,
      );
    },
  );
}

for (const vector of V.standaloneVectors) {
  test(
    `automatic Kurzschrift standalone mapping ${vector.input}`,
    () => {
      const result =
        translateGermanKurzschriftAutomatic(
          vector.input,
        );

      assert.equal(
        result.ok,
        true,
        result.ok
          ? undefined
          : JSON.stringify(result),
      );

      if (result.ok) {
        assert.equal(
          result.unicodeBraille,
          vector.expectedBraille,
        );
      }
    },
  );
}

test(
  "die Würde preserves compatible layered source decisions",
  () => {
    const result =
      resolveGermanKurzschriftAutomaticDecision(
        "die Würde",
        "WÜRD",
      );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(
        result.resolutionKind,
        "COMPATIBLE_LAYERED_ALLOW",
      );
      assert.equal(
        result.sourceRows.length,
        2,
      );
    }
  },
);

test(
  "genau preserves source precedence plus historical no-generalization guard",
  () => {
    const result =
      resolveGermanKurzschriftAutomaticDecision(
        "genau",
        "GE",
      );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(
        result.resolutionKind,
        "SOURCE_PRECEDENCE_WITH_HISTORICAL_GUARD",
      );
      assert.equal(
        result.operativeDecision,
        "BE_GE_PRECEDENCE",
      );
      assert.equal(
        result.sourceRows.length,
        2,
      );
    }
  },
);

test(
  "unknown Kurzschrift decision fails closed",
  () => {
    const result =
      resolveGermanKurzschriftAutomaticDecision(
        "__UNKNOWN__",
        "__UNKNOWN__",
      );

    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(
        result.code,
        "SOURCE_CONTEXT_UNRESOLVED",
      );
    }
  },
);

test(
  "candidate-free arbitrary input falls back through automatic Vollschrift parent",
  () => {
    const result =
      translateGermanKurzschriftAutomatic(
        "Brot",
      );

    assert.equal(
      result.ok,
      true,
      result.ok
        ? undefined
        : JSON.stringify(result),
    );

    if (result.ok) {
      assert.equal(
        result.path,
        "PARENT_VOLLSCHRIFT",
      );
      assert.equal(
        result.runtime.automaticProviderResolutionExecutable,
        true,
      );
      assert.equal(
        result.runtime.runtimeRegistered,
        false,
      );
    }
  },
);
