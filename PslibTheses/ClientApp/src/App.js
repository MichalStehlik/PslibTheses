import React from 'react';
import { Router } from "react-router-dom";
import { Route, Switch } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { createBrowserHistory } from "history";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createGlobalStyle } from 'styled-components';

import LayoutRoute from "./components/layouts/LayoutRoute";
import MessageLayout from "./components/layouts/MessageLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";

import TopErrorBoundary from "./components/errors/TopErrorBoundary";

import {ApplicationProvider} from "./providers/ApplicationProvider";

import Home from "./components/Home";
import NotFound from "./components/NotFound";
import SignInCallback from "./components/Auth/SignInCallback";
import SilentRenew from "./components/Auth/SilentRenew";
import SignOutCallback from "./components/Auth/SignOutCallback";
import Account from "./components/Account";
import Console from "./components/Console";
import Alerts from "./components/Alerts";
import Test from "./components/Test";
import Users from "./components/Users";
import Admin from "./components/Admin";
import Ideas from "./components/Ideas";
import Works from "./components/Works";
import Overviews from "./components/Overviews";

const history = createBrowserHistory(/*{ basename: "/prace/"}*/);

const GlobalStyle = createGlobalStyle`
  body {
    font-size: 10pt;
    font-family: ${props => props.theme.fonts.main}, sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.fonts.heading}, sans-serif;
  }
`;
/* colors
rgb(153, 216, 52)

*/
export const mainTheme = {
  mode: "light",
  colors: {
    menuBackground: "#00A956",
    menuForeground: "white",
    selectedMenuBackground: "#eee",
    selectedMenuForeground: "#333",
    desktopBackground: "#eee",
    desktopForeground: "#333",
    cardBackground: "#fff",
    cardForeground: "#111",
    logoBackground: "black",
    logoForeground: "white",
    logoAccent: "#00A956",
    headerBackground: "white",
    headerForeground: "black",
    successBackground: "#00A956",
    successForeground: "rgb(255, 255, 255)",
    darkSuccessBackground: "rgb(100,150,35)",
    darkSuccessForeground: "rgb(255, 255, 255)",
    infoBackground: "rgb(52, 161, 216)",
    infoForeground: "rgb(255, 255, 255)",
    warningBackground: "rgb(219, 164, 55)",
    warningForeground: "rgb(255, 255, 255)",
    errorBackground: "rgb(219, 68, 55)",
    errorForeground: "rgb(255, 255, 255)",
    defaultBackground: "rgb(255, 255, 255)",
    defaultForeground: "rgb(10, 10, 10)",
    disabledBackground: "rgb(250, 250, 250)",
    disabledForeground: "rgb(200, 200, 200)",
    lightBackground: "rgb(255, 255, 255)",
    lightForeground: "rgb(0, 0, 0)",
    darkBackground: "rgb(0, 0, 0)",
    darkForeground: "rgb(255, 255, 255)",
  },
  fonts: {
    heading: "Quicksand",
    main: "OpenSans"
  },
  spacing: {
    small: "3px",
    medium: "10px",
    large: "1rem"
  }
}

function App() {
  return (
    <ThemeProvider theme={mainTheme}>
      <TopErrorBoundary>
        <ApplicationProvider>
          <DndProvider backend={HTML5Backend}>      
            <>
              <GlobalStyle whiteColor />
              <Router history={history}>
                <Switch>
                  <Route path="/oidc-callback" component={SignInCallback} />
                  <Route path="/oidc-signout-callback" component={SignOutCallback} />
                  <Route path="/oidc-silent-renew" component={SilentRenew} />
                  <Route path="/sign-in" component={Account} />
                  <Route path="/sign-out" component={Account} />
                  <LayoutRoute path="/account" component={Account} layout={DashboardLayout} />
                  <LayoutRoute path="/alerts" component={Alerts} layout={DashboardLayout} />
                  <LayoutRoute path="/console" component={Console} layout={DashboardLayout} />
                  <LayoutRoute path="/test" component={Test} layout={DashboardLayout} />
                  <LayoutRoute path="/admin" component={Admin} layout={DashboardLayout} />
                  <LayoutRoute path="/users" component={Users} layout={DashboardLayout} />
                  <LayoutRoute path="/ideas" component={Ideas} layout={DashboardLayout} />
                  <LayoutRoute path="/works" component={Works} layout={DashboardLayout} />
                  <LayoutRoute path="/overviews" component={Overviews} layout={DashboardLayout} />
                  <LayoutRoute exact path="/" component={Home} layout={DashboardLayout} />
                  <LayoutRoute component={NotFound} layout={MessageLayout} backgroundColor={mainTheme.colors.infoBackground} color={mainTheme.colors.infoForeground} />     
                </Switch>
              </Router>
            </>
          </DndProvider>
        </ApplicationProvider>     
      </TopErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
