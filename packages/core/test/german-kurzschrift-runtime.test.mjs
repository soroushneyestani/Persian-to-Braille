import assert from "node:assert/strict";
import test from "node:test";

import {
  executeGermanKurzschriftResolvedPlan,
  getGermanKurzschriftControlCase,
  getGermanKurzschriftMapping,
  getGermanKurzschriftSourceDecisionCase,
  getGermanKurzschriftSourceRendering,
  getGermanKurzschriftStructuredCase,
} from "../dist/index.js";

const V = {
  "mappingVectors": [
    {
      "id": "DE-KURZ-KOMMA-MAP-001",
      "family": "comma",
      "key": "ANDER",
      "expectedBraille": "⠂⠻"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-002",
      "family": "comma",
      "key": "BRAUCH",
      "expectedBraille": "⠂⠌"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-003",
      "family": "comma",
      "key": "DÜRF",
      "expectedBraille": "⠂⠙"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-004",
      "family": "comma",
      "key": "EINANDER",
      "expectedBraille": "⠂⠫"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-005",
      "family": "comma",
      "key": "FAHR",
      "expectedBraille": "⠂⠗"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-006",
      "family": "comma",
      "key": "HAB",
      "expectedBraille": "⠂⠓"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-007",
      "family": "comma",
      "key": "INTERESS",
      "expectedBraille": "⠂⠔"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-008",
      "family": "comma",
      "key": "KÖNN",
      "expectedBraille": "⠂⠅"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-009",
      "family": "comma",
      "key": "LASS",
      "expectedBraille": "⠂⠇"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-010",
      "family": "comma",
      "key": "MÖG",
      "expectedBraille": "⠂⠪"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-011",
      "family": "comma",
      "key": "MÜSS",
      "expectedBraille": "⠂⠍"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-012",
      "family": "comma",
      "key": "RICHT",
      "expectedBraille": "⠂⠼"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-013",
      "family": "comma",
      "key": "SCHRIEB",
      "expectedBraille": "⠂⠱"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-014",
      "family": "comma",
      "key": "SETZ",
      "expectedBraille": "⠂⠑"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-015",
      "family": "comma",
      "key": "SITZ",
      "expectedBraille": "⠂⠊"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-016",
      "family": "comma",
      "key": "SOLL",
      "expectedBraille": "⠂⠎"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-017",
      "family": "comma",
      "key": "SPIEL",
      "expectedBraille": "⠂⠬"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-018",
      "family": "comma",
      "key": "SPRECH",
      "expectedBraille": "⠂⠮"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-019",
      "family": "comma",
      "key": "STAND",
      "expectedBraille": "⠂⠾"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-020",
      "family": "comma",
      "key": "STELL",
      "expectedBraille": "⠂⠽"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-021",
      "family": "comma",
      "key": "WEIS",
      "expectedBraille": "⠂⠩"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-022",
      "family": "comma",
      "key": "WERD",
      "expectedBraille": "⠂⠺"
    },
    {
      "id": "DE-KURZ-KOMMA-MAP-023",
      "family": "comma",
      "key": "WOLL",
      "expectedBraille": "⠂⠕"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-001",
      "family": "umlaut",
      "key": "ÄNDER",
      "expectedBraille": "⠐⠻"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-002",
      "family": "umlaut",
      "key": "BRÄUCH",
      "expectedBraille": "⠐⠌"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-003",
      "family": "umlaut",
      "key": "DRÜCK",
      "expectedBraille": "⠐⠙⠨"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-004",
      "family": "umlaut",
      "key": "FÄHR",
      "expectedBraille": "⠐⠗"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-005",
      "family": "umlaut",
      "key": "FÄLL",
      "expectedBraille": "⠐⠋⠟"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-006",
      "family": "umlaut",
      "key": "GÄNZ",
      "expectedBraille": "⠐⠛⠵"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-007",
      "family": "umlaut",
      "key": "GEGENWÄRT",
      "expectedBraille": "⠐⠛⠺"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-008",
      "family": "umlaut",
      "key": "GRÖSS",
      "expectedBraille": "⠐⠛⠮"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-009",
      "family": "umlaut",
      "key": "GRÜND",
      "expectedBraille": "⠐⠛⠙"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-010",
      "family": "umlaut",
      "key": "HÄFT",
      "expectedBraille": "⠐⠓⠋"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-011",
      "family": "umlaut",
      "key": "HÄND",
      "expectedBraille": "⠐⠓⠙"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-012",
      "family": "umlaut",
      "key": "HÄUPT",
      "expectedBraille": "⠐⠓⠏"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-013",
      "family": "umlaut",
      "key": "JÄHR",
      "expectedBraille": "⠐⠚⠗"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-014",
      "family": "umlaut",
      "key": "KÖMM",
      "expectedBraille": "⠐⠅⠭"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-015",
      "family": "umlaut",
      "key": "KRÄFT",
      "expectedBraille": "⠐⠅⠋"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-016",
      "family": "umlaut",
      "key": "KÜRZ",
      "expectedBraille": "⠐⠅⠵"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-017",
      "family": "umlaut",
      "key": "LÄNG",
      "expectedBraille": "⠐⠇⠛"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-018",
      "family": "umlaut",
      "key": "LÄSS",
      "expectedBraille": "⠐⠇"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-019",
      "family": "umlaut",
      "key": "NÄHM",
      "expectedBraille": "⠐⠝⠍"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-020",
      "family": "umlaut",
      "key": "NÜTZ",
      "expectedBraille": "⠐⠝⠵"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-021",
      "family": "umlaut",
      "key": "PERSÖN",
      "expectedBraille": "⠐⠏⠝"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-022",
      "family": "umlaut",
      "key": "PLÄTZ",
      "expectedBraille": "⠐⠏⠵"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-023",
      "family": "umlaut",
      "key": "PÜNKT",
      "expectedBraille": "⠐⠏⠞"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-024",
      "family": "umlaut",
      "key": "SÄG",
      "expectedBraille": "⠐⠎⠛"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-025",
      "family": "umlaut",
      "key": "SÄTZ",
      "expectedBraille": "⠐⠎⠵"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-026",
      "family": "umlaut",
      "key": "SCHLÄG",
      "expectedBraille": "⠐⠱⠛"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-027",
      "family": "umlaut",
      "key": "STÄND",
      "expectedBraille": "⠐⠾"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-028",
      "family": "umlaut",
      "key": "TRÄG",
      "expectedBraille": "⠐⠞⠛"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-029",
      "family": "umlaut",
      "key": "VÖLK",
      "expectedBraille": "⠐⠧⠅"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-030",
      "family": "umlaut",
      "key": "VÖLL",
      "expectedBraille": "⠐⠟"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-031",
      "family": "umlaut",
      "key": "WÄHR",
      "expectedBraille": "⠐⠺⠓"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-032",
      "family": "umlaut",
      "key": "WÄR",
      "expectedBraille": "⠐⠴"
    },
    {
      "id": "DE-KURZ-UMLAUT-MAP-033",
      "family": "umlaut",
      "key": "ZÄHL",
      "expectedBraille": "⠐⠵⠇"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-001",
      "family": "twoForm",
      "key": "ÄHNLICH",
      "expectedBraille": "⠜⠸"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-002",
      "family": "twoForm",
      "key": "ALSO",
      "expectedBraille": "⠁⠕"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-003",
      "family": "twoForm",
      "key": "ARBEIT",
      "expectedBraille": "⠴⠃"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-004",
      "family": "twoForm",
      "key": "BEID",
      "expectedBraille": "⠃⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-005",
      "family": "twoForm",
      "key": "BEIM",
      "expectedBraille": "⠃⠍"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-006",
      "family": "twoForm",
      "key": "BESSER",
      "expectedBraille": "⠎⠎"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-007",
      "family": "twoForm",
      "key": "BIS",
      "expectedBraille": "⠃⠎"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-008",
      "family": "twoForm",
      "key": "BIST",
      "expectedBraille": "⠃⠾"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-009",
      "family": "twoForm",
      "key": "BLEIB",
      "expectedBraille": "⠃⠃"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-010",
      "family": "twoForm",
      "key": "BRIEF",
      "expectedBraille": "⠃⠋"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-011",
      "family": "twoForm",
      "key": "BRING",
      "expectedBraille": "⠃⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-012",
      "family": "twoForm",
      "key": "CHARAKTER",
      "expectedBraille": "⠹⠅"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-013",
      "family": "twoForm",
      "key": "DABEI",
      "expectedBraille": "⠙⠃"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-014",
      "family": "twoForm",
      "key": "DADURCH",
      "expectedBraille": "⠙⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-015",
      "family": "twoForm",
      "key": "DAFÜR",
      "expectedBraille": "⠙⠋"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-016",
      "family": "twoForm",
      "key": "DAGEGEN",
      "expectedBraille": "⠙⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-017",
      "family": "twoForm",
      "key": "DAHER",
      "expectedBraille": "⠙⠓"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-018",
      "family": "twoForm",
      "key": "DAMIT",
      "expectedBraille": "⠙⠍"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-019",
      "family": "twoForm",
      "key": "DANK",
      "expectedBraille": "⠙⠅"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-020",
      "family": "twoForm",
      "key": "DARAUF",
      "expectedBraille": "⠙⠡"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-021",
      "family": "twoForm",
      "key": "DARÜBER",
      "expectedBraille": "⠙⠳"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-022",
      "family": "twoForm",
      "key": "DAVON",
      "expectedBraille": "⠙⠧"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-023",
      "family": "twoForm",
      "key": "DAZU",
      "expectedBraille": "⠙⠵"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-024",
      "family": "twoForm",
      "key": "DEMOKRAT",
      "expectedBraille": "⠙⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-025",
      "family": "twoForm",
      "key": "DENEN",
      "expectedBraille": "⠑⠉"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-026",
      "family": "twoForm",
      "key": "DENN",
      "expectedBraille": "⠙⠝"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-027",
      "family": "twoForm",
      "key": "DESSEN",
      "expectedBraille": "⠙⠮"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-028",
      "family": "twoForm",
      "key": "DEUTSCH",
      "expectedBraille": "⠙⠱"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-029",
      "family": "twoForm",
      "key": "DIR",
      "expectedBraille": "⠙⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-030",
      "family": "twoForm",
      "key": "DOCH",
      "expectedBraille": "⠙⠹"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-031",
      "family": "twoForm",
      "key": "DRUCK",
      "expectedBraille": "⠙⠨"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-032",
      "family": "twoForm",
      "key": "EBENSO",
      "expectedBraille": "⠑⠕"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-033",
      "family": "twoForm",
      "key": "ETWA",
      "expectedBraille": "⠑⠁"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-034",
      "family": "twoForm",
      "key": "ETWAS",
      "expectedBraille": "⠞⠺"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-035",
      "family": "twoForm",
      "key": "FALL",
      "expectedBraille": "⠋⠟"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-036",
      "family": "twoForm",
      "key": "FERTIG",
      "expectedBraille": "⠋⠘"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-037",
      "family": "twoForm",
      "key": "FOLG",
      "expectedBraille": "⠋⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-038",
      "family": "twoForm",
      "key": "FREUND",
      "expectedBraille": "⠋⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-039",
      "family": "twoForm",
      "key": "FÜHR",
      "expectedBraille": "⠋⠓"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-040",
      "family": "twoForm",
      "key": "GANZ",
      "expectedBraille": "⠛⠵"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-041",
      "family": "twoForm",
      "key": "GEGENÜBER",
      "expectedBraille": "⠛⠳"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-042",
      "family": "twoForm",
      "key": "GEGENWART",
      "expectedBraille": "⠛⠺"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-043",
      "family": "twoForm",
      "key": "GELEGEN",
      "expectedBraille": "⠛⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-044",
      "family": "twoForm",
      "key": "GESCHÄFT",
      "expectedBraille": "⠛⠋"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-045",
      "family": "twoForm",
      "key": "GESELLSCHAFT",
      "expectedBraille": "⠛⠱"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-046",
      "family": "twoForm",
      "key": "GEWORDEN",
      "expectedBraille": "⠯⠺"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-047",
      "family": "twoForm",
      "key": "GIBT",
      "expectedBraille": "⠛⠃"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-048",
      "family": "twoForm",
      "key": "GLEICH",
      "expectedBraille": "⠛⠹"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-049",
      "family": "twoForm",
      "key": "GLÜCK",
      "expectedBraille": "⠛⠨"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-050",
      "family": "twoForm",
      "key": "GROSS",
      "expectedBraille": "⠛⠮"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-051",
      "family": "twoForm",
      "key": "GRUND",
      "expectedBraille": "⠛⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-052",
      "family": "twoForm",
      "key": "HAFT",
      "expectedBraille": "⠓⠋"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-053",
      "family": "twoForm",
      "key": "HAND",
      "expectedBraille": "⠓⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-054",
      "family": "twoForm",
      "key": "HAST",
      "expectedBraille": "⠓⠾"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-055",
      "family": "twoForm",
      "key": "HAT",
      "expectedBraille": "⠓⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-056",
      "family": "twoForm",
      "key": "HAUPT",
      "expectedBraille": "⠓⠏"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-057",
      "family": "twoForm",
      "key": "HERR",
      "expectedBraille": "⠗⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-058",
      "family": "twoForm",
      "key": "HIER",
      "expectedBraille": "⠓⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-059",
      "family": "twoForm",
      "key": "HOFF",
      "expectedBraille": "⠋⠋"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-060",
      "family": "twoForm",
      "key": "IHN",
      "expectedBraille": "⠊⠓"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-061",
      "family": "twoForm",
      "key": "IRGEND",
      "expectedBraille": "⠊⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-062",
      "family": "twoForm",
      "key": "JAHR",
      "expectedBraille": "⠚⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-063",
      "family": "twoForm",
      "key": "JAHRHUNDERT",
      "expectedBraille": "⠚⠓"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-064",
      "family": "twoForm",
      "key": "JAHRTAUSEND",
      "expectedBraille": "⠚⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-065",
      "family": "twoForm",
      "key": "JAHRZEHNT",
      "expectedBraille": "⠚⠵"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-066",
      "family": "twoForm",
      "key": "JED",
      "expectedBraille": "⠚⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-067",
      "family": "twoForm",
      "key": "JEDOCH",
      "expectedBraille": "⠚⠹"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-068",
      "family": "twoForm",
      "key": "JETZIG",
      "expectedBraille": "⠚⠘"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-069",
      "family": "twoForm",
      "key": "KANNST",
      "expectedBraille": "⠅⠾"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-070",
      "family": "twoForm",
      "key": "KAPITAL",
      "expectedBraille": "⠅⠏"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-071",
      "family": "twoForm",
      "key": "KOMM",
      "expectedBraille": "⠅⠭"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-072",
      "family": "twoForm",
      "key": "KONNT",
      "expectedBraille": "⠅⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-073",
      "family": "twoForm",
      "key": "KRAFT",
      "expectedBraille": "⠅⠋"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-074",
      "family": "twoForm",
      "key": "KURZ",
      "expectedBraille": "⠅⠵"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-075",
      "family": "twoForm",
      "key": "LANG",
      "expectedBraille": "⠇⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-076",
      "family": "twoForm",
      "key": "LEB",
      "expectedBraille": "⠇⠃"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-077",
      "family": "twoForm",
      "key": "LEICHT",
      "expectedBraille": "⠇⠹"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-078",
      "family": "twoForm",
      "key": "LETZT",
      "expectedBraille": "⠇⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-079",
      "family": "twoForm",
      "key": "MASCHIN",
      "expectedBraille": "⠍⠱"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-080",
      "family": "twoForm",
      "key": "MATERIAL",
      "expectedBraille": "⠍⠇"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-081",
      "family": "twoForm",
      "key": "MATERIELL",
      "expectedBraille": "⠍⠟"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-082",
      "family": "twoForm",
      "key": "MIR",
      "expectedBraille": "⠍⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-083",
      "family": "twoForm",
      "key": "MITTEL",
      "expectedBraille": "⠍⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-084",
      "family": "twoForm",
      "key": "MÖGLICH",
      "expectedBraille": "⠍⠸"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-085",
      "family": "twoForm",
      "key": "MUSIK",
      "expectedBraille": "⠍⠅"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-086",
      "family": "twoForm",
      "key": "MUSS",
      "expectedBraille": "⠍⠮"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-087",
      "family": "twoForm",
      "key": "NACHDEM",
      "expectedBraille": "⠝⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-088",
      "family": "twoForm",
      "key": "NÄCHST",
      "expectedBraille": "⠝⠾"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-089",
      "family": "twoForm",
      "key": "NAHM",
      "expectedBraille": "⠝⠍"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-090",
      "family": "twoForm",
      "key": "NATUR",
      "expectedBraille": "⠝⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-091",
      "family": "twoForm",
      "key": "NATÜRLICH",
      "expectedBraille": "⠝⠸"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-092",
      "family": "twoForm",
      "key": "NEBEN",
      "expectedBraille": "⠝⠃"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-093",
      "family": "twoForm",
      "key": "NEHM",
      "expectedBraille": "⠝⠓"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-094",
      "family": "twoForm",
      "key": "NICHTS",
      "expectedBraille": "⠝⠎"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-095",
      "family": "twoForm",
      "key": "NOCH",
      "expectedBraille": "⠝⠹"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-096",
      "family": "twoForm",
      "key": "NOMMEN",
      "expectedBraille": "⠝⠭"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-097",
      "family": "twoForm",
      "key": "NOTWENDIG",
      "expectedBraille": "⠝⠺"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-098",
      "family": "twoForm",
      "key": "NUR",
      "expectedBraille": "⠝⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-099",
      "family": "twoForm",
      "key": "NUTZ",
      "expectedBraille": "⠝⠵"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-100",
      "family": "twoForm",
      "key": "ÖFFENTLICH",
      "expectedBraille": "⠪⠸"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-101",
      "family": "twoForm",
      "key": "OHNE",
      "expectedBraille": "⠕⠑"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-102",
      "family": "twoForm",
      "key": "PARAGRAF",
      "expectedBraille": "⠏⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-103",
      "family": "twoForm",
      "key": "PERSON",
      "expectedBraille": "⠏⠝"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-104",
      "family": "twoForm",
      "key": "PLATZ",
      "expectedBraille": "⠏⠵"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-105",
      "family": "twoForm",
      "key": "PLÖTZLICH",
      "expectedBraille": "⠏⠸"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-106",
      "family": "twoForm",
      "key": "POLITIK",
      "expectedBraille": "⠏⠅"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-107",
      "family": "twoForm",
      "key": "POLITISCH",
      "expectedBraille": "⠏⠱"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-108",
      "family": "twoForm",
      "key": "PUNKT",
      "expectedBraille": "⠏⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-109",
      "family": "twoForm",
      "key": "RECHT",
      "expectedBraille": "⠗⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-110",
      "family": "twoForm",
      "key": "REGIER",
      "expectedBraille": "⠗⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-111",
      "family": "twoForm",
      "key": "REHABILIT",
      "expectedBraille": "⠗⠃"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-112",
      "family": "twoForm",
      "key": "REPUBLIK",
      "expectedBraille": "⠗⠅"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-113",
      "family": "twoForm",
      "key": "RÜCK",
      "expectedBraille": "⠗⠨"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-114",
      "family": "twoForm",
      "key": "SAG",
      "expectedBraille": "⠎⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-115",
      "family": "twoForm",
      "key": "SATZ",
      "expectedBraille": "⠎⠵"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-116",
      "family": "twoForm",
      "key": "SCHLAG",
      "expectedBraille": "⠱⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-117",
      "family": "twoForm",
      "key": "SCHLIESS",
      "expectedBraille": "⠱⠮"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-118",
      "family": "twoForm",
      "key": "SCHREIB",
      "expectedBraille": "⠱⠃"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-119",
      "family": "twoForm",
      "key": "SCHRIFT",
      "expectedBraille": "⠱⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-120",
      "family": "twoForm",
      "key": "SCHWIERIG",
      "expectedBraille": "⠱⠘"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-121",
      "family": "twoForm",
      "key": "SEHR",
      "expectedBraille": "⠎⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-122",
      "family": "twoForm",
      "key": "SELBST",
      "expectedBraille": "⠎⠾"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-123",
      "family": "twoForm",
      "key": "SIND",
      "expectedBraille": "⠎⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-124",
      "family": "twoForm",
      "key": "SOLCH",
      "expectedBraille": "⠎⠹"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-125",
      "family": "twoForm",
      "key": "SONDERN",
      "expectedBraille": "⠎⠝"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-126",
      "family": "twoForm",
      "key": "SOZIAL",
      "expectedBraille": "⠎⠇"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-127",
      "family": "twoForm",
      "key": "STAAT",
      "expectedBraille": "⠾⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-128",
      "family": "twoForm",
      "key": "STETS",
      "expectedBraille": "⠾⠎"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-129",
      "family": "twoForm",
      "key": "TECHNIK",
      "expectedBraille": "⠞⠅"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-130",
      "family": "twoForm",
      "key": "TECHNISCH",
      "expectedBraille": "⠞⠱"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-131",
      "family": "twoForm",
      "key": "TRAG",
      "expectedBraille": "⠞⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-132",
      "family": "twoForm",
      "key": "TREFF",
      "expectedBraille": "⠞⠋"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-133",
      "family": "twoForm",
      "key": "TROTZ",
      "expectedBraille": "⠞⠵"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-134",
      "family": "twoForm",
      "key": "ÜBERHAUPT",
      "expectedBraille": "⠳⠓"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-135",
      "family": "twoForm",
      "key": "ÜBRIG",
      "expectedBraille": "⠳⠘"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-136",
      "family": "twoForm",
      "key": "VERHÄLTNIS",
      "expectedBraille": "⠧⠓"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-137",
      "family": "twoForm",
      "key": "VIEL",
      "expectedBraille": "⠧⠇"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-138",
      "family": "twoForm",
      "key": "VIELLEICHT",
      "expectedBraille": "⠧⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-139",
      "family": "twoForm",
      "key": "VOLK",
      "expectedBraille": "⠧⠅"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-140",
      "family": "twoForm",
      "key": "VOM",
      "expectedBraille": "⠧⠍"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-141",
      "family": "twoForm",
      "key": "WAHR",
      "expectedBraille": "⠺⠓"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-142",
      "family": "twoForm",
      "key": "WÄHREND",
      "expectedBraille": "⠜⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-143",
      "family": "twoForm",
      "key": "WEG",
      "expectedBraille": "⠺⠛"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-144",
      "family": "twoForm",
      "key": "WEIT",
      "expectedBraille": "⠺⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-145",
      "family": "twoForm",
      "key": "WENIG",
      "expectedBraille": "⠺⠘"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-146",
      "family": "twoForm",
      "key": "WENN",
      "expectedBraille": "⠺⠝"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-147",
      "family": "twoForm",
      "key": "WESENTLICH",
      "expectedBraille": "⠺⠸"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-148",
      "family": "twoForm",
      "key": "WIEDER",
      "expectedBraille": "⠬⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-149",
      "family": "twoForm",
      "key": "WILL",
      "expectedBraille": "⠺⠟"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-150",
      "family": "twoForm",
      "key": "WIR",
      "expectedBraille": "⠺⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-151",
      "family": "twoForm",
      "key": "WIRD",
      "expectedBraille": "⠺⠙"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-152",
      "family": "twoForm",
      "key": "WIRK",
      "expectedBraille": "⠺⠅"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-153",
      "family": "twoForm",
      "key": "WIRST",
      "expectedBraille": "⠺⠾"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-154",
      "family": "twoForm",
      "key": "WIRTSCHAFT",
      "expectedBraille": "⠺⠱"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-155",
      "family": "twoForm",
      "key": "WISS",
      "expectedBraille": "⠺⠮"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-156",
      "family": "twoForm",
      "key": "WOHL",
      "expectedBraille": "⠺⠇"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-157",
      "family": "twoForm",
      "key": "WORDEN",
      "expectedBraille": "⠕⠉"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-158",
      "family": "twoForm",
      "key": "ZAHL",
      "expectedBraille": "⠵⠇"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-159",
      "family": "twoForm",
      "key": "ZEIT",
      "expectedBraille": "⠵⠞"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-160",
      "family": "twoForm",
      "key": "ZUM",
      "expectedBraille": "⠵⠍"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-161",
      "family": "twoForm",
      "key": "ZUNÄCHST",
      "expectedBraille": "⠵⠝"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-162",
      "family": "twoForm",
      "key": "ZUR",
      "expectedBraille": "⠵⠗"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-163",
      "family": "twoForm",
      "key": "ZURÜCK",
      "expectedBraille": "⠵⠨"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-164",
      "family": "twoForm",
      "key": "ZUSAMMEN",
      "expectedBraille": "⠵⠎"
    },
    {
      "id": "DE-KURZ-ZWEI-MAP-165",
      "family": "twoForm",
      "key": "ZWISCHEN",
      "expectedBraille": "⠵⠺"
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
  "decisionVectors": [
    {
      "id": "DE-KURZ-AUFHEB-ARROW-001",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-001",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-002",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-003",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-004",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-005",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-006",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-007",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-008",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-INWORD-009",
      "expectedDecision": "PREFIX_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-POLICY-001",
      "expectedDecision": "POINT6_IS_AUFHEBUNGSPUNKT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-POLICY-002",
      "expectedDecision": "CANCEL_ADDITIONAL_KURZSCHRIFT_MEANING",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-POLICY-003",
      "expectedDecision": "RETURN_TO_BASIS_OR_VOLLSCHRIFT_MEANING",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-POLICY-004",
      "expectedDecision": "LISTED_IN_WORD_SIGNS_REQUIRE_POINT6",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-AUFHEB-POLICY-005",
      "expectedDecision": "OMIT_POINT6_BEFORE_ACCENTED_LETTER",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-001",
      "expectedDecision": "SPELL_OUT_BEFORE_ORDINAL_COMPATIBLE_PUNCTUATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-002",
      "expectedDecision": "PREFIX_AUFHEBUNGSPUNKT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-003",
      "expectedDecision": "DO_NOT_REUSE_STANDALONE_FORM_IN_COMPOUND",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-004",
      "expectedDecision": "DO_NOT_REUSE_STANDALONE_FORM_IN_COMPOUND",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-005",
      "expectedDecision": "STANDALONE_CONTRACTION_REMAINS_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-006",
      "expectedDecision": "STANDALONE_CONTRACTION_REMAINS_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-007",
      "expectedDecision": "SPELL_OUT_AT_HYPHEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-008",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-009",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-010",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-011",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-012",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-013",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-014",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-015",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-016",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-017",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-018",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-019",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-020",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-021",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-022",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-023",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-024",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-025",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-026",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-027",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-028",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-029",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-030",
      "expectedDecision": "USE_POINT2_IN_EXTENSION_OR_WORD_COMPOSITION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-031",
      "expectedDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-032",
      "expectedDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-033",
      "expectedDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-034",
      "expectedDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-035",
      "expectedDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-036",
      "expectedDecision": "USE_POINT2_IN_CONTRACTED_COMBINATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-037",
      "expectedDecision": "OMIT_POINT2_ANNOUNCEMENT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-038",
      "expectedDecision": "OMIT_POINT2_ANNOUNCEMENT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-039",
      "expectedDecision": "OMIT_POINT2_ANNOUNCEMENT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-040",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-041",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-042",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-043",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-044",
      "expectedDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-045",
      "expectedDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-046",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-047",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-048",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-049",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-050",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-051",
      "expectedDecision": "SOURCE_FORM_REJECTS_SEIN_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-052",
      "expectedDecision": "SOURCE_FORM_REJECTS_SEIN_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-053",
      "expectedDecision": "SOURCE_FORM_REJECTS_SEIN_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-054",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-055",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-056",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-057",
      "expectedDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-058",
      "expectedDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-059",
      "expectedDecision": "WORD_INITIAL_CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-060",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-061",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-062",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-063",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-064",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-065",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-066",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-067",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-068",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-069",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-070",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-071",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-072",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-073",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-074",
      "expectedDecision": "USE_UNANNOUNCED_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-075",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-076",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-077",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-078",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-079",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-080",
      "expectedDecision": "DO_NOT_USE_EXTENSION_ONLY_ALL_FORM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-081",
      "expectedDecision": "DO_NOT_USE_EXTENSION_ONLY_ALL_FORM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-082",
      "expectedDecision": "DO_NOT_USE_EXTENSION_ONLY_ALL_FORM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-083",
      "expectedDecision": "DO_NOT_USE_EXTENSION_ONLY_ALL_FORM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-084",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-085",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-086",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-087",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-088",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-089",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-090",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-091",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-092",
      "expectedDecision": "SOURCE_FORM_REJECTS_EXTENSION_ONLY_DIES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-093",
      "expectedDecision": "SOURCE_FORM_REJECTS_EXTENSION_ONLY_DIES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-094",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-095",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-096",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-097",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-098",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-099",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-100",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-101",
      "expectedDecision": "USE_EXTENSION_ONLY_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-102",
      "expectedDecision": "SPELL_OUT_TO_AVOID_UEBRIG_COLLISION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-EIN-CASE-103",
      "expectedDecision": "SPELL_OUT_TO_AVOID_UEBRIG_COLLISION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-INSERT-POLICY-001",
      "expectedDecision": "ANNOUNCEMENT_MAY_BE_OMITTED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-KOMMA-POLICY-001",
      "expectedDecision": "INTEGRAL_COMPONENT_NOT_EXTERNAL_ANNOUNCEMENT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-KOMMA-POLICY-002",
      "expectedDecision": "ALLOWED_SUBJECT_TO_4_9",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-KOMMA-POLICY-003",
      "expectedDecision": "ALLOWED_SUBJECT_TO_4_9",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-KOMMA-POLICY-004",
      "expectedDecision": "ALLOWED_SUBJECT_TO_4_9",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-KOMMA-POLICY-005",
      "expectedDecision": "DEFER_TO_SECTION_4_9",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-001",
      "expectedDecision": "USE_LITERAL_LETTER_DISAMBIGUATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-002",
      "expectedDecision": "USE_LITERAL_LETTER_DISAMBIGUATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-003",
      "expectedDecision": "USE_LITERAL_LETTER_DISAMBIGUATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-004",
      "expectedDecision": "USE_LITERAL_LETTER_DISAMBIGUATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-005",
      "expectedDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-006",
      "expectedDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-007",
      "expectedDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-008",
      "expectedDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-009",
      "expectedDecision": "KEEP_UNCONTRACTED_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-010",
      "expectedDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-011",
      "expectedDecision": "KEEP_UNCONTRACTED_AT_WORD_END",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-012",
      "expectedDecision": "KEEP_UNCONTRACTED_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-013",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-014",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-015",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-016",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-017",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-018",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-019",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-020",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-021",
      "expectedDecision": "FORBIDDEN_AT_WORD_START",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-022",
      "expectedDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-023",
      "expectedDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-024",
      "expectedDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-025",
      "expectedDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-026",
      "expectedDecision": "MUST_NOT_CROSS_CLEAR_COMPOUND_SEAM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-027",
      "expectedDecision": "MAY_CROSS_LEXICALIZED_HISTORICAL_SEAM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-028",
      "expectedDecision": "MAY_CROSS_LEXICALIZED_HISTORICAL_SEAM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-029",
      "expectedDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-030",
      "expectedDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-031",
      "expectedDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-032",
      "expectedDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-033",
      "expectedDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-034",
      "expectedDecision": "CROSS_SPOKEN_SYLLABLE_ALLOWED_IF_OTHER_RULES_PASS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-035",
      "expectedDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-036",
      "expectedDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-037",
      "expectedDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-038",
      "expectedDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-039",
      "expectedDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-040",
      "expectedDecision": "MUST_PRESERVE_CLEAR_PREFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-041",
      "expectedDecision": "CONTRACTION_ALLOWED_ACROSS_PREFIX_STEM_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-042",
      "expectedDecision": "CONTRACTION_ALLOWED_ACROSS_PREFIX_STEM_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-043",
      "expectedDecision": "CONTRACTION_ALLOWED_ACROSS_PREFIX_STEM_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-044",
      "expectedDecision": "CONTRACTION_ALLOWED_ACROSS_PREFIX_STEM_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-045",
      "expectedDecision": "MUST_NOT_CONTRACT_ACROSS_SUFFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-046",
      "expectedDecision": "CONTRACTION_REQUIRED_BY_SOURCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-047",
      "expectedDecision": "MUST_NOT_CONTRACT_ACROSS_SUFFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-048",
      "expectedDecision": "CONTRACTION_REQUIRED_BY_SOURCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-049",
      "expectedDecision": "MUST_NOT_CONTRACT_ACROSS_SUFFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-050",
      "expectedDecision": "CONTRACTION_REQUIRED_BY_SOURCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-051",
      "expectedDecision": "MUST_NOT_CONTRACT_ACROSS_SUFFIX_BOUNDARY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-052",
      "expectedDecision": "CONTRACTION_ALLOWED_DUE_BOUNDARY_UNCERTAINTY",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-053",
      "expectedDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-054",
      "expectedDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-055",
      "expectedDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-056",
      "expectedDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-057",
      "expectedDecision": "MUST_NOT_SPLIT_SAME_SYLLABLE_VOWEL_PAIR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-058",
      "expectedDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-059",
      "expectedDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-060",
      "expectedDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-061",
      "expectedDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-062",
      "expectedDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-063",
      "expectedDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-064",
      "expectedDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-065",
      "expectedDecision": "APPLY_ELIGIBLE_CONTRACTION_ACROSS_TWO_SYLLABLES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-066",
      "expectedDecision": "VOLLSCHRIFT_IE_CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-067",
      "expectedDecision": "VOLLSCHRIFT_IE_CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-068",
      "expectedDecision": "SS_PRECEDES_ST_IN_SST",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-069",
      "expectedDecision": "SS_PRECEDES_ST_IN_SST",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-070",
      "expectedDecision": "CONSONANT_GROUP_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-071",
      "expectedDecision": "CONSONANT_GROUP_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-072",
      "expectedDecision": "CONSONANT_GROUP_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-073",
      "expectedDecision": "CONSONANT_GROUP_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-074",
      "expectedDecision": "BE_GE_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-075",
      "expectedDecision": "BE_GE_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-076",
      "expectedDecision": "BE_GE_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-077",
      "expectedDecision": "BE_GE_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-078",
      "expectedDecision": "BE_GE_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-079",
      "expectedDecision": "VOWEL_INITIAL_GROUP_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-080",
      "expectedDecision": "VOWEL_INITIAL_GROUP_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-081",
      "expectedDecision": "VOWEL_INITIAL_GROUP_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-082",
      "expectedDecision": "VOWEL_INITIAL_GROUP_PRECEDENCE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-083",
      "expectedDecision": "RECOMPUTE_AFTER_WORD_DIVISION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-084",
      "expectedDecision": "RECOMPUTE_AFTER_WORD_DIVISION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-085",
      "expectedDecision": "RECOMPUTE_AFTER_WORD_DIVISION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-086",
      "expectedDecision": "OTHERWISE_PRESERVE_UNBROKEN_WORD_LOGIC",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-087",
      "expectedDecision": "OTHERWISE_PRESERVE_UNBROKEN_WORD_LOGIC",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-088",
      "expectedDecision": "OTHERWISE_PRESERVE_UNBROKEN_WORD_LOGIC",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-089",
      "expectedDecision": "OTHERWISE_PRESERVE_UNBROKEN_WORD_LOGIC",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-090",
      "expectedDecision": "FORBIDDEN_IMMEDIATELY_AFTER_APOSTROPHE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-091",
      "expectedDecision": "FORBIDDEN_IMMEDIATELY_AFTER_APOSTROPHE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-LG-CASE-092",
      "expectedDecision": "FORBIDDEN_IMMEDIATELY_AFTER_APOSTROPHE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-491-CASE-001",
      "expectedDecision": "CHAPTER_3_VOLLSCHRIFT_CONTRACTION_PROHIBITIONS_APPLY_TO_KURZSCHRIFT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-491-CASE-002",
      "expectedDecision": "KURZSCHRIFT_MUST_NOT_BYPASS_INHERITED_CHAPTER_3_PROHIBITIONS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-NEG-001",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-NEG-002",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-NEG-003",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-NEG-004",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-NEG-005",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-POLICY-001",
      "expectedDecision": "NEVER_CONTRACT_ACROSS_WORD_JUNCTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-POLICY-002",
      "expectedDecision": "RULE_APPLIES_GENERALLY_TO_KURZSCHRIFT_CONTRACTIONS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-POS-001",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-POS-002",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-POS-003",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-POS-004",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-492-POS-005",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-001",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_APPLICATION"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-002",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_APPLICATION"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-003",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_APPLICATION"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-004",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_APPLICATION"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-005",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_APPLICATION"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-006",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_APPLICATION"
    },
    {
      "id": "DE-KURZ-REST-493-APPLY-007",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_APPLICATION"
    },
    {
      "id": "DE-KURZ-REST-493-POLICY-001",
      "expectedDecision": "VOWEL_PRONUNCIATION_MUST_BE_RESPECTED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-493-POLICY-002",
      "expectedDecision": "ALLOW_ONLY_IF_ORIGINAL_MEANING_OBVIOUSLY_PRESERVED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-493-POLICY-003",
      "expectedDecision": "FORBIDDEN_BY_DEFAULT_IN_PROPER_NAMES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-493-POLICY-004",
      "expectedDecision": "ALLOW_ONLY_IF_ENTITY_CLASS_MATCHES_AND_MEANING_UNEQUIVOCALLY_PRESERVED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-493-POLICY-005",
      "expectedDecision": "DO_NOT_CONTRACT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-001",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_RESOLUTION"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-002",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_RESOLUTION"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-003",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_RESOLUTION"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-004",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_RESOLUTION"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-005",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_RESOLUTION"
    },
    {
      "id": "DE-KURZ-REST-493-RESOLVE-006",
      "expectedDecision": null,
      "expectedPolicyClass": "CONTRACTION_RESOLUTION"
    },
    {
      "id": "DE-KURZ-REST-494-HISTORY-001",
      "expectedDecision": "NO_NEW_GENERIC_ALLOW_RULE_INFERRED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-KOMM-001",
      "expectedDecision": "ALWAYS_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-LETZT-001",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-LETZT-002",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-LETZT-003",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-001",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-002",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-003",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-004",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-005",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-006",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-007",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-008",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-POSITION-009",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-STEM-001",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-STEM-002",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-STEM-003",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-STEM-004",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-STEM-005",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-STEM-006",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-STEM-007",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-NEG-STEM-008",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POLICY-001",
      "expectedDecision": "SEQUENCE_MUST_REPRESENT_ACTUAL_WORD_OR_WORD_STEM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POLICY-002",
      "expectedDecision": "DIFFERENT_MEANINGS_ALLOWED_IF_ACTUAL_STEM_REMAINS_RECOGNIZABLE",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POLICY-003",
      "expectedDecision": "TARGET_MUST_BEGIN_VALID_STEM_COMPONENT_AFTER_SOURCE_ALLOWED_SEGMENTATION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POLICY-004",
      "expectedDecision": "DO_NOT_CATEGORICALLY_DISCARD_SOURCE_ESTABLISHED_HISTORICAL_FORMS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POLICY-005",
      "expectedDecision": "SHOULD_NOT_CONTRACT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-001",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-002",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-003",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-004",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-005",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-006",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-007",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-008",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-009",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-010",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-011",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-012",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-013",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-014",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-015",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-016",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-017",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-018",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-019",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-020",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-494-POS-021",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-495-POLICY-001",
      "expectedDecision": "DO_NOT_JOIN_CONTRACTION_WITH_STEM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-495-POLICY-002",
      "expectedDecision": "DO_NOT_JOIN_CONTRACTION_WITH_STEM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-495-POLICY-003",
      "expectedDecision": "GENERAL_BOUNDARY_PROHIBITION_NOT_AUTOMATICALLY_APPLIED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-REST-495-POLICY-004",
      "expectedDecision": "DELEGATE_TO_SECTION_4_1_2_4",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-001",
      "expectedDecision": "USE_PREFIX_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-002",
      "expectedDecision": "USE_PREFIX_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-003",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_WORD_INITIAL",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-004",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-005",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-006",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-007",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-008",
      "expectedDecision": "SPELL_OUT_AFTER_HYPHEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-009",
      "expectedDecision": "USE_PREFIX_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-010",
      "expectedDecision": "USE_PREFIX_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-011",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_WORD_INITIAL",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-012",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-013",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-014",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-015",
      "expectedDecision": "SPELL_OUT_BECAUSE_NOT_PREFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-016",
      "expectedDecision": "MUST_NOT_USE_HEIT_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-017",
      "expectedDecision": "MUST_NOT_USE_HEIT_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-018",
      "expectedDecision": "MUST_NOT_USE_SCHAFT_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-019",
      "expectedDecision": "MUST_NOT_USE_SCHAFT_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-020",
      "expectedDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-021",
      "expectedDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-022",
      "expectedDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-023",
      "expectedDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-024",
      "expectedDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-025",
      "expectedDecision": "MUST_NOT_USE_MAL_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-026",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-027",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-028",
      "expectedDecision": "DO_NOT_TREAT_FALL_AS_SUFFIX_FALLS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-029",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-030",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-031",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-032",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-033",
      "expectedDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-034",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-035",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-036",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-037",
      "expectedDecision": "MUST_NOT_CROSS_WORD_SEAM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-038",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-039",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-040",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-041",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-042",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-043",
      "expectedDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-044",
      "expectedDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-045",
      "expectedDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-046",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-047",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-048",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-049",
      "expectedDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-050",
      "expectedDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-051",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-052",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-053",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-054",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-055",
      "expectedDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-056",
      "expectedDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-057",
      "expectedDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-058",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-059",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-060",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-061",
      "expectedDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-062",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-063",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-064",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-065",
      "expectedDecision": "DO_NOT_CONTRACT_NOT_SUFFIX",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-066",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-067",
      "expectedDecision": "USE_POST_STEM_CONTRACTION",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-068",
      "expectedDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-STEM-CASE-069",
      "expectedDecision": "DO_NOT_USE_IN_COMPOUND_WORD_INTERIOR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-NONROLE-001",
      "expectedDecision": "POINT5_IS_NOT_UMLAUTUNGSPUNKT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-NONROLE-002",
      "expectedDecision": "POINT5_IS_NOT_UMLAUTUNGSPUNKT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-NONROLE-003",
      "expectedDecision": "POINT5_IS_NOT_UMLAUTUNGSPUNKT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-NONROLE-004",
      "expectedDecision": "POINT5_IS_NOT_UMLAUTUNGSPUNKT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-NONROLE-005",
      "expectedDecision": "POINT5_IS_NOT_UMLAUTUNGSPUNKT",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-POLICY-001",
      "expectedDecision": "LIMITED_TO_SOURCE_SUPPORTED_UMLAUTABLE_STEMS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-POLICY-002",
      "expectedDecision": "POINT5_IS_UMLAUTUNGSPUNKT_IN_SECTION_4_6_GRAMMAR",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-POLICY-003",
      "expectedDecision": "PREFIX_POINT5_FOR_VOLL_WAR_AND_TWO_FORM",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-POLICY-004",
      "expectedDecision": "REPLACE_POINT2_WITH_POINT5",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-POLICY-005",
      "expectedDecision": "EXACTLY_33_SOURCE_ALLOWED_UMLAUT_CONTRACTIONS",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-POLICY-006",
      "expectedDecision": "OTHER_UMLAUT_CONTRACTIONS_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-UMLAUT-POLICY-007",
      "expectedDecision": "CONTEXT_DISPATCH_REQUIRED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-ZWEI-POLICY-001",
      "expectedDecision": "ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-ZWEI-POLICY-002",
      "expectedDecision": "ALLOWED_SUBJECT_TO_APPLICATION_RULES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-ZWEI-POLICY-003",
      "expectedDecision": "ALLOWED_SUBJECT_TO_APPLICATION_RULES",
      "expectedPolicyClass": null
    },
    {
      "id": "DE-KURZ-ZWEI-POLICY-004",
      "expectedDecision": "DEFER_TO_SECTION_4_9",
      "expectedPolicyClass": null
    },
    {
      "id": "ERLANGEN_TWO_FORM_FORBIDDEN",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "GROSSE_ANTILLEN_EXCEPTION",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "MITTELMEER_EXCEPTION",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "PIERRE_PRONUNCIATION",
      "expectedDecision": "CONTRACT_ER_NOT_IE",
      "expectedPolicyClass": null
    },
    {
      "id": "VERDUN_PREFIX_FORBIDDEN",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    },
    {
      "id": "VORPOMMERN_ONE_FORM_ALLOWED",
      "expectedDecision": "CONTRACTION_ALLOWED",
      "expectedPolicyClass": null
    },
    {
      "id": "WERDOHL_KOMMA_FORBIDDEN",
      "expectedDecision": "CONTRACTION_FORBIDDEN",
      "expectedPolicyClass": null
    }
  ],
  "controlVectors": [
    {
      "id": "DE-KURZ-INSERT-CONTROL-001",
      "expectedAnnouncement": "⠠⠄",
      "expectedDeannouncement": null
    },
    {
      "id": "DE-KURZ-INSERT-CONTROL-002",
      "expectedAnnouncement": "⠤⠄",
      "expectedDeannouncement": null
    },
    {
      "id": "DE-KURZ-INSERT-CONTROL-003",
      "expectedAnnouncement": null,
      "expectedDeannouncement": "⠠⠄"
    },
    {
      "id": "DE-KURZ-INSERT-EXAMPLE-001",
      "expectedAnnouncement": "⠠⠄",
      "expectedDeannouncement": null
    },
    {
      "id": "DE-KURZ-INSERT-EXAMPLE-002",
      "expectedAnnouncement": "⠤⠄",
      "expectedDeannouncement": "⠠⠄"
    },
    {
      "id": "DE-KURZ-INSERT-EXAMPLE-003",
      "expectedAnnouncement": "⠤⠄",
      "expectedDeannouncement": "⠠⠄"
    }
  ],
  "structuredVectors": [
    {
      "id": "DE-KURZ-INSERT-NOTATION-001",
      "record": {
        "id": "DE-KURZ-INSERT-NOTATION-001",
        "category": "WORD_PLACEHOLDER",
        "placeholder": "⠿",
        "expectedDots": "123456",
        "expectedMeaning": "ONE_WORD_IN_RULE_NOTATION",
        "partOfControlSequence": false,
        "ruleRefs": [
          "DE-KURZ-INSERT-004"
        ]
      }
    },
    {
      "id": "DE-KURZ-INSERT-POLICY-002",
      "record": {
        "id": "DE-KURZ-INSERT-POLICY-002",
        "category": "BASIS_INSIDE_VOLLSCHRIFT",
        "expectedAnnouncementRequired": false,
        "expectedDeannouncementRequired": false,
        "ruleRefs": [
          "DE-KURZ-INSERT-006"
        ]
      }
    }
  ],
  "partition": {
    "exactOnly": 245,
    "exactAndDecision": 13,
    "decisionOnly": 379,
    "controlOnly": 6,
    "specialOnly": 2
  }
};

for (const vector of V.mappingVectors) {
  test(`Kurzschrift exact mapping ${vector.id}`, () => {
    const result =
      getGermanKurzschriftMapping(
        vector.family,
        vector.key,
      );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(
        result.unicodeBraille,
        vector.expectedBraille,
      );
    }
  });
}

for (const vector of V.contextualVectors) {
  test(`Kurzschrift contextual source rendering ${vector.id}`, () => {
    const result =
      getGermanKurzschriftSourceRendering(
        vector.id,
        vector.input,
      );

    assert.equal(result.ok, true);

    if (result.ok) {
      assert.equal(
        result.unicodeBraille,
        vector.expectedBraille,
      );
    }
  });
}

for (const vector of V.decisionVectors) {
  test(`Kurzschrift source decision ${vector.id}`, () => {
    const result =
      getGermanKurzschriftSourceDecisionCase(
        vector.id,
      );

    assert.notEqual(result, null);

    if (result !== null) {
      assert.equal(
        result.expectedDecision,
        vector.expectedDecision,
      );
      assert.equal(
        result.expectedPolicyClass,
        vector.expectedPolicyClass,
      );
    }
  });
}

for (const vector of V.controlVectors) {
  test(`Kurzschrift control ${vector.id}`, () => {
    const result =
      getGermanKurzschriftControlCase(
        vector.id,
      );

    assert.notEqual(result, null);

    if (result !== null) {
      assert.equal(
        result.announcement,
        vector.expectedAnnouncement,
      );
      assert.equal(
        result.deannouncement,
        vector.expectedDeannouncement,
      );
    }
  });
}

for (const vector of V.structuredVectors) {
  test(`Kurzschrift structured case ${vector.id}`, () => {
    assert.deepEqual(
      getGermanKurzschriftStructuredCase(
        vector.id,
      ),
      vector.record,
    );
  });
}

test("Kurzschrift resolved-plan executes mapping", () => {
  const vector = V.mappingVectors[0];
  assert.ok(vector);

  const result =
    executeGermanKurzschriftResolvedPlan([
      {
        kind: "mapping",
        family: vector.family,
        key: vector.key,
      },
    ]);

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(
      result.unicodeBraille,
      vector.expectedBraille,
    );
  }
});

test("Kurzschrift resolved-plan executes contextual rendering", () => {
  const vector = V.contextualVectors[0];
  assert.ok(vector);

  const result =
    executeGermanKurzschriftResolvedPlan([
      {
        kind: "sourceRendering",
        validationId: vector.id,
        input: vector.input,
      },
    ]);

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.equal(
      result.unicodeBraille,
      vector.expectedBraille,
    );
  }
});

test("Kurzschrift unknown mapping fails closed", () => {
  const result =
    getGermanKurzschriftMapping(
      "twoForm",
      "__UNKNOWN__",
    );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(
      result.code,
      "UNKNOWN_MAPPING",
    );
  }
});

test("Kurzschrift source rendering rejects mismatched input", () => {
  const vector = V.contextualVectors[0];
  assert.ok(vector);

  const result =
    getGermanKurzschriftSourceRendering(
      vector.id,
      "__MISMATCH__",
    );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(
      result.code,
      "SOURCE_INPUT_MISMATCH",
    );
  }
});

test("Kurzschrift 645-case partition remains exact", () => {
  assert.deepEqual(
    V.partition,
    {
      exactOnly: 245,
      exactAndDecision: 13,
      decisionOnly: 379,
      controlOnly: 6,
      specialOnly: 2,
    },
  );
});
