import { UserOnly } from "conlang-web-components";
import { RouteObject } from "react-router-dom";

import NumbersPage from "page/NumbersPage";
import ReversePage from "page/ReversePage";
import ValidatePage from "page/ValidationPage";

export const SITE_ROUTES: RouteObject[] = [
  {
    path: "/reverse",
    element: <ReversePage />,
  },
  {
    path: "/reverse/:query",
    element: <ReversePage />,
  },
  {
    path: "/validate",
    element: <UserOnly error>
      <ValidatePage />
    </UserOnly>,
  },
  {
    path: "/numbers",
    element: <UserOnly error>
      <NumbersPage />
    </UserOnly>,
  },
];

export const MENU_LINKS = [
  ["/", "Home"],
  ["/reverse", "Reverse"],
  ["/stats", "Stats"],
  ["/translations", "Translations"],
] as const;

export const PRIVATE_MENU_LINKS = [
  ["/validate", "Validate"],
  ["/numbers", "Numbers"],
  ["/sound_changes", "Sound Changes"],
  ["/generate", "Generate"],
  ["/config", "Config"],
] as const;
