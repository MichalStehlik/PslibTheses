import React from 'react';
import {ActionLink, Button, ButtonBlock} from "../general";
import { Route, Switch, useHistory } from "react-router-dom";
import {useAppContext} from "../../providers/ApplicationProvider";
import Tokens from "./Tokens";
import Profile from "./Profile";
import Offer from "./Offer";
import NotFound from "../NotFound";

const Account = props => {
    const [{ accessToken, userManager }] = useAppContext();
    let history = useHistory();
    if (accessToken)
    {
        return (
            <>
                <ButtonBlock>
                    <Button onClick={e => { history.push("/account"); }}>Profil</Button>
                    <Button onClick={e => { history.push("/account/tokens"); }}>Přihlašovací údaje</Button>
                    <Button onClick={e => { history.push("/account/offer"); }}>Nabídka námětů</Button>
                    <Button onClick={() => { userManager.signoutRedirect() }} variant="danger">Odhlásit</Button>
            </ButtonBlock>
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
            <ButtonBlock>
                <Button onClick={() => { userManager.signinRedirect() }} variant="success" >Přihlásit</Button>
            </ButtonBlock>
        );
    }    
}

export default Account;