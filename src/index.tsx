import { BlueprintProvider } from "@blueprintjs/core";
import { ConlangProvider, ErrorPage, UserOnly } from "conlang-web-components";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { transformConfig } from "lang/config";
import { transformDictionary } from "lang/dictionary";
import ConfigPage from "page/ConfigPage";
import DictionaryPage from "page/DictionaryPage";
import EditWordPage from "page/EditWordPage";
import GeneratePage from "page/GeneratePage";
import NewWordPage from "page/NewWordPage";
import NumbersPage from "page/NumbersPage";
import ReversePage from "page/ReversePage";
import SoundChangePage from "page/SoundChangePage";
import StatsPage from "page/StatsPage";
import TranslationsPage from "page/TranslationsPage";
import ValidatePage from "page/ValidationPage";
import WordPage from "page/WordPage";
import { Dictionary } from "providers/dictionary";
import { LangConfig } from "providers/langConfig";
import { API, LANGUAGE } from "api";
import { App, toastErrorHandler, toastSuccessHandler } from "App";

import "@blueprintjs/core/lib/css/blueprint.css";
import "conlang-web-components/src/style.css";
import "./style/index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <App>
      <ErrorPage />
    </App>,
    children: [
      {
        path: "/",
        element: <DictionaryPage />,
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
        element: <UserOnly error>
          <EditWordPage />
        </UserOnly>,
      },
      {
        path: "/edit/:hash/:edit",
        element: <UserOnly error>
          <EditWordPage />
        </UserOnly>,
      },
      {
        path: "/new",
        element: <UserOnly error>
          <NewWordPage />
        </UserOnly>,
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
      {
        path: "/stats",
        element: <StatsPage />,
      },
      {
        path: "/sound_changes",
        element: <UserOnly error>
          <SoundChangePage />
        </UserOnly>,
      },
      {
        path: "/generate",
        element: <UserOnly error>
          <GeneratePage />
        </UserOnly>,
      },
      {
        path: "/translations",
        element: <TranslationsPage />,
      },
      {
        path: "/config",
        element: <UserOnly error>
          <ConfigPage />
        </UserOnly>,
      },
    ],
  },
]);

function Wrapper() {
  return <StrictMode>
    <BlueprintProvider>
      <ConlangProvider
        dictionary={Dictionary}
        transformDictionary={transformDictionary}
        config={LangConfig}
        transformConfig={transformConfig}
        api={API}
        error={toastErrorHandler}
        success={toastSuccessHandler}
        tag="x-sol"
        language={LANGUAGE}
      >
        <RouterProvider router={router} />
      </ConlangProvider>
    </BlueprintProvider>
  </StrictMode>;
}

if (document.location.hostname === "localhost") {
  document.getElementById("root")!.classList.add("localhost");
}

createRoot(document.getElementById("root")!).render(<Wrapper />);
