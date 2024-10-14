import {
  Button,
  Classes,
  Divider,
  Drawer,
  DrawerSize,
  H1,
  H2,
  Icon,
  InputGroup,
  Intent,
  OverlayToaster,
  Popover,
  Position,
} from "@blueprintjs/core";
import { JSX, useContext, useState } from "react";
import { Link } from "react-router-dom";

import { ApiVersion } from "providers/apiVersion";
import { User } from "providers/user";
import { apiFetch, CustomApiError } from "api";

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

function Login() {
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const user = useContext(User);
  const login = () => {
    apiFetch("/login", "POST", { username, secret }).then(() => user.update());
  };

  return (
    <Popover
      interactionKind="click"
      popoverClassName={Classes.POPOVER_CONTENT_SIZING}
      content={
        <div>
          <InputGroup onValueChange={(v) => setUsername(v)} placeholder="Username" />
          <InputGroup onValueChange={(v) => setSecret(v)} placeholder="Password" type="password" />
          <Button fill intent="success" text="Log in" onClick={login} />
        </div>
      }
      renderTarget={({ isOpen, ...targetProps }) => <a {...targetProps}>Not logged in.</a>}
    />
  );
}

function Logout() {
  const user = useContext(User);
  const signout = () => {
    apiFetch("/logout", "POST").then(() => user.update());
  };

  return (
    <Popover
      interactionKind="click"
      popoverClassName={Classes.POPOVER_CONTENT_SIZING}
      content={<Button intent={Intent.DANGER} text="Sign out" onClick={signout} />}
      renderTarget={({ isOpen, ...targetProps }) => <a {...targetProps}>{user.user?.name}</a>}
    />
  );
}

const MENU_LINKS = [
  ["/", "Home"],
  ["/reverse", "Reverse"],
  ["/stats", "Stats"],
] as const;

const PRIVATE_MENU_LINKS = [
  ["/validate", "Validate"],
  ["/numbers", "Numbers"],
  ["/sound_changes", "Sound Changes"],
  ["/generate", "Generate"],
];

function Menu() {
  const [isOpen, setOpen] = useState(false);
  const { user } = useContext(User);

  return (
    <>
      <Icon className="menu" icon="menu" size={36} onClick={() => setOpen(true)} />
      <Drawer isOpen={isOpen} onClose={() => setOpen(false)} position="left" size={DrawerSize.SMALL}>
        <nav>
          <ul>
            {MENU_LINKS.map(([slug, name]) => (
              <li key={slug}>
                <Link to={slug} onClick={() => setOpen(false)}>
                  {name}
                </Link>
              </li>
            ))}
            {user && <Divider />}
            {user &&
              PRIVATE_MENU_LINKS.map(([slug, name]) => (
                <li key={slug}>
                  <Link to={slug} onClick={() => setOpen(false)}>
                    {name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </Drawer>
    </>
  );
}

export function App(body: JSX.Element, header?: string, headerElement?: JSX.Element) {
  const version = useContext(ApiVersion);
  const user = useContext(User);
  if (!header) {
    document.title = "Solerian";
  } else {
    document.title = `Solerian | ${header}`;
  }
  return (
    <>
      <header className={Classes.DARK}>
        <Menu />
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
        <div id="usertext">{user.user ? <Logout /> : <Login />}</div>
      </header>
      <div id="center">
        <main id="main">{body}</main>
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
