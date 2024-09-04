import { Button, Classes, Divider, H1, H2, Intent, OverlayToaster, Position } from "@blueprintjs/core";
import { ApiVersion } from ".";
import { useContext } from "react";
import { CustomApiError } from "./api";
import { useUser } from "./hooks";
import { useNavigate } from "react-router-dom";

export const AppToaster = OverlayToaster.createAsync({
  position: Position.TOP,
});

declare const WEB_VERSION: string;

export const toastErrorHandler = async (error: unknown): Promise<string> => {
  const toaster = await AppToaster;
  if (error instanceof CustomApiError) {
    return toaster.show({ intent: Intent.DANGER, message: `${error.status}: ${error.message}` });
  } else if (error instanceof Error) {
    return toaster.show({ intent: Intent.DANGER, message: error.message });
  } else {
    return toaster.show({ intent: Intent.DANGER, message: `unknown error ${error}` });
  }
};

export function App(body: JSX.Element, header?: string, headerElement?: JSX.Element) {
  const version = useContext(ApiVersion);
  const loggedIn = window.localStorage.getItem("token") !== null;
  const user = useUser();
  const navigate = useNavigate();
  const signout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    navigate("/");
  };
  if (!header) {
    document.title = "Solerian";
  } else {
    document.title = `Solerian | ${header}`;
  }
  return (
    <>
      <header className={Classes.DARK}>
        <H1 className="sc">
          <a href={"#/"}>Solerian</a>
        </H1>
        {header && (
          <>
            <Divider></Divider>
            <H2 className="sc">{header}</H2>
            {headerElement && <div className="header-element">{headerElement}</div>}
          </>
        )}
        <div id="usertext">
          {loggedIn && <Button intent={Intent.DANGER} text="Sign out" onClick={signout} />}
          {user && <span>{user.name}</span>}
        </div>
        {/* <p id="usertext">Not logged in.</p> */}
      </header>
      <div id="center">
        <main>{body}</main>
      </div>
      <footer className={Classes.DARK}>
        <small>
          <p>
            <span className="sc">Solerian</span> by rymiel, web version {WEB_VERSION}
            {version && `, api version ${version}`}
          </p>
        </small>
      </footer>
    </>
  );
}
