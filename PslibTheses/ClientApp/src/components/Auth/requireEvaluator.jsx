import React from 'react';
import {useAppContext} from "../../providers/ApplicationProvider";
import AccessDenied from "../messages/AccessDenied";
import Unauthorized from "../messages/Unauthorized";

const requireEvaluator = (WrappedComponent) => (props)  => {
    const [{accessToken, profile}] = useAppContext();
    if (accessToken === null) {
        return <Unauthorized />;
    } else if (profile.theses_admin !== "1" && profile.theses_evaluator !== "1" ){
        return <AccessDenied />;
    } else {
        return(
            <WrappedComponent {...props}>
                {props.children}
            </WrappedComponent>
        );
    }
    
}

export default requireEvaluator;