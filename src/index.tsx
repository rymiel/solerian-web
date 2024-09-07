import { createRoot } from "react-dom/client";
import "./style/index.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import { API } from "./api";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { createContext, StrictMode, useState } from "react";
import HomePage from "./page/HomePage";
import { OverlaysProvider } from "@blueprintjs/core";
import ErrorPage from "./page/ErrorPage";

const router = createHashRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/noun/:noun",
    element: <HomePage />,
  }
]);

export const ApiVersion = createContext<string | null>(null);

function Wrapper() {
  const [version, setVersion] = useState<string | null>(null);
  if (version === null) {
    fetch(`${API}/version`)
      .then((resp) => resp.text())
      .then((text) => setVersion(text))
      .catch((err) => console.error(err));
  }
  return (
    <StrictMode>
      <ApiVersion.Provider value={version}>
        <OverlaysProvider>
          <RouterProvider router={router} />
        </OverlaysProvider>
      </ApiVersion.Provider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Wrapper />);
