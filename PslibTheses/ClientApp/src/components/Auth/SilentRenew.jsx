import React from "react";
import {Redirect} from "react-router";
import {ADD_MESSAGE, useAppContext} from "../../providers/ApplicationProvider";

const SilentRenew = props => {
    const [{userManager},dispatch] = useAppContext();
    userManager.signinSilentCallback();
    dispatch({type: ADD_MESSAGE, variant: "info", text: "Byl načten aktualizovaný bezpečnostní token.", dismissable: true});
    return <Redirect to="/" />;
}
   
export default SilentRenew;