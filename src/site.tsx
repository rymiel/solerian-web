import { createApiClient, defineSite, UserOnly } from "conlang-web-components";

import { languageConfig } from "lang/config";
import { deriveFields } from "lang/dictionary";
import { draftClass, EntryContent, generatedFields, useNewWordExtra } from "lang/entry";
import { useReverseLookup } from "lang/reverse";
import { STATS_SECTIONS } from "lang/stats";
import { useValidationCandidates, validateLocal } from "lang/validation";
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
  useValidationCandidates,
  validateLocal,
});
