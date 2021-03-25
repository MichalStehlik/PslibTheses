import React from 'react';
import { ADMIN_ROLE, EVALUATOR_ROLE, MANAGER_ROLE } from "../../configuration/constants"; 
import {useAppContext} from "../../providers/ApplicationProvider";
import AccessDenied from "../messages/AccessDenied";
import Unauthorized from "../messages/Unauthorized";

const requireEvaluator = (WrappedComponent) => (props)  => {
    const [{accessToken, profile}] = useAppContext();
    if (accessToken === null) {
        return <Unauthorized />;
    } else if (profile[ADMIN_ROLE] !== "1" && profile[EVALUATOR_ROLE] !== "1" && profile[MANAGER_ROLE] !== "1" ){
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