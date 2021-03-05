import React from "react";
import {Redirect} from "react-router";
import {useAppContext} from "../../providers/ApplicationProvider";

const SignOutCallback = props => {
    const [{userManager}] = useAppContext();
    userManager.signoutRedirectCallback();
    return <Redirect to="/" />;
}
   
export default SignOutCallback;