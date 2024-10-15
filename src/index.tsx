import { BlueprintProvider } from "@blueprintjs/core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";

import DictionaryPage from "page/DictionaryPage";
import EditWordPage from "page/EditWordPage";
import ErrorPage from "page/ErrorPage";
import GeneratePage from "page/GeneratePage";
import NewWordPage from "page/NewWordPage";
import NumbersPage from "page/NumbersPage";
import ReversePage from "page/ReversePage";
import SoundChangePage from "page/SoundChangePage";
import StatsPage from "page/StatsPage";
import TranslationsPage from "page/TranslationsPage";
import ValidatePage from "page/ValidationPage";
import WordPage from "page/WordPage";
import { ApiVersionProvider } from "providers/apiVersion";
import { DictionaryProvider } from "providers/dictionary";
import { LangConfigProvider } from "providers/langConfig";
import { UserProvider } from "providers/user";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "./style/index.css";

const router = createHashRouter([
  {
    path: "/",
    element: <DictionaryPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/w/:word",
    element: <WordPage />,
  },
  {
    path: "/w/:word/:num",
    element: <WordPage />,
  },
  {
    path: "/edit/:hash",
    element: <EditWordPage />,
  },
  {
    path: "/new",
    element: <NewWordPage />,
  },
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
    element: <ValidatePage />,
  },
  {
    path: "/numbers",
    element: <NumbersPage />,
  },
  {
    path: "/stats",
    element: <StatsPage />,
  },
  {
    path: "/sound_changes",
    element: <SoundChangePage />,
  },
  {
    path: "/generate",
    element: <GeneratePage />,
  },
  {
    path: "/translations",
    element: <TranslationsPage />,
  },
]);

function Wrapper() {
  return (
    <StrictMode>
      <ApiVersionProvider>
        <BlueprintProvider>
          <LangConfigProvider>
            <DictionaryProvider>
              <UserProvider>
                <RouterProvider router={router} />
              </UserProvider>
            </DictionaryProvider>
          </LangConfigProvider>
        </BlueprintProvider>
      </ApiVersionProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Wrapper />);
