import { createRoot } from "react-dom/client";
import "./style/index.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import { BlueprintProvider } from "@blueprintjs/core";
import { DictionaryProvider } from "./providers/dictionary";
import { UserProvider } from "./providers/user";
import DictionaryPage from "./page/DictionaryPage";
import ErrorPage from "./page/ErrorPage";
import WordPage from "./page/WordPage";
import ReversePage from "./page/ReversePage";
import EditWordPage from "./page/EditWordPage";
import ValidatePage from "./page/ValidationPage";
import NewWordPage from "./page/NewWordPage";
import NumbersPage from "./page/NumbersPage";
import StatsPage from "./page/StatsPage";
import SoundChangePage from "./page/SoundChangePage";
import { ApiVersionProvider } from "./providers/apiVersion";

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
]);

function Wrapper() {
  return (
    <StrictMode>
      <ApiVersionProvider>
        <BlueprintProvider>
          <DictionaryProvider>
            <UserProvider>
              <RouterProvider router={router} />
            </UserProvider>
          </DictionaryProvider>
        </BlueprintProvider>
      </ApiVersionProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Wrapper />);
