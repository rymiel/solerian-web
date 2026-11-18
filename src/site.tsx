import { createApiClient, defineSite, RouteHandle, UserOnly } from "@rymiel/conlang-web-components";

import { languageConfig } from "lang/config";
import { deriveFields } from "lang/dictionary";
import { draftClass, EntryContent, generatedFields, useNewWordExtra } from "lang/entry";
import { useReverseLookup } from "lang/reverse";
import { STATS_SECTIONS } from "lang/stats";
import { useValidationCandidates, validateLocal, validationValue } from "lang/validation";
import NumbersPage from "page/NumbersPage";

declare const WEB_VERSION: string;

export const SITE = defineSite({
  language: "Solerian",
  tag: "x-sol",
  api: createApiClient({ language: "solerian", version: WEB_VERSION }),
  languageConfig,
  deriveFields,
  menuLinks: [
    ["/", "Home"],
    ["/reverse", "Reverse"],
    ["/stats", "Stats"],
    ["/docs", "Docs"],
    ["/translations", "Translations"],
  ],
  privateMenuLinks: [
    ["/validate", "Validate"],
    ["/numbers", "Numbers"],
    ["/sound_changes", "Sound Changes"],
    ["/generate", "Generate"],
    ["/config", "Config"],
  ],
  routes: [
    {
      path: "/numbers",
      handle: { title: "Numbers" } satisfies RouteHandle,
      element: <UserOnly error>
        <NumbersPage />
      </UserOnly>,
    },
  ],
  statsSections: STATS_SECTIONS,
  generatedFields,
  EntryContent,
  draftClass,
  useNewWordExtra,
  useReverseLookup,
  validationValue,
  useValidationCandidates,
  validateLocal,
});
