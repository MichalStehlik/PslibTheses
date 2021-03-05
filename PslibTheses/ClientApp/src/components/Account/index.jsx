import React from 'react';
import {ActionLink, Button} from "../general";
import {Route, Switch} from "react-router-dom";
import {useAppContext} from "../../providers/ApplicationProvider";
import Tokens from "./Tokens";
import Profile from "./Profile";
import Offer from "./Offer";
import NotFound from "../NotFound";

const Account = props => {
    const [{accessToken, userManager}] = useAppContext();
    if (accessToken)
    {
        return (
            <>
            <div>
            <ActionLink to="/account">Profil</ActionLink>
            <ActionLink to="/account/tokens">Přihlašovací údaje</ActionLink>
            <ActionLink to="/account/offer">Nabídka námětů</ActionLink>
            <ActionLink to="/console">Konzola API</ActionLink>
            <ActionLink to="/test">Test rozhraní</ActionLink>
            </div>
            <Switch>
                <Route exact path="/account" component={Profile} />
                <Route path="/account/tokens" component={Tokens} />
                <Route path="/account/offer" component={Offer} />
                <Route component={NotFound} />   
            </Switch>
            </>
        );
    }
    else
    {
        return (
            <>
            <Button onClick={() => {userManager.signinRedirect()}}>Přihlásit</Button>
            <ActionLink to="/console">Konzola API</ActionLink>
            <ActionLink to="/test">Test rozhraní</ActionLink>
            </>
        );
    }    
}

export default Account;