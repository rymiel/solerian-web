import { createRoot } from "react-dom/client";
import "./style/index.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import { API } from "./api";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { createContext, StrictMode, useState } from "react";
import DictionaryPage from "./page/DictionaryPage";
import { OverlaysProvider } from "@blueprintjs/core";
import ErrorPage from "./page/ErrorPage";
import { DictionaryProvider } from "./dictionary";
import WordPage from "./page/WordPage";
import ReversePage from "./page/ReversePage";
import { UserProvider } from "./user";
import EditWordPage from "./page/EditWordPage";
import ValidatePage from "./page/ValidationPage";

export const uri = (strings: readonly string[], ...values: readonly string[]) =>
  String.raw({ raw: strings }, ...values.map((i) => encodeURIComponent(i)));

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
    path: "/edit/:word",
    element: <EditWordPage />,
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
]);

export const ApiVersion = createContext<string | null>(null);

function Wrapper() {
  const [version, setVersion] = useState<string | null>(null);
  if (version === null) {
    // fetch(`${API}/version`)
    //   .then((resp) => resp.text())
    //   .then((text) => setVersion(text))
    //   .catch((err) => console.error(err));
  }
  return (
    <StrictMode>
      <ApiVersion.Provider value={version}>
        <OverlaysProvider>
          <DictionaryProvider>
            <UserProvider>
              <RouterProvider router={router} />
            </UserProvider>
          </DictionaryProvider>
        </OverlaysProvider>
      </ApiVersion.Provider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Wrapper />);
