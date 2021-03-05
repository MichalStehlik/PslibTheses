import React from 'react';
import {useAppContext} from "../../providers/ApplicationProvider";
import Unauthorized from "../messages/Unauthorized";

const requireAuth = (WrappedComponent) => props  => {
    const [{accessToken}] = useAppContext();
    if (accessToken === null) {
        return <Unauthorized />;
    } else {
        return(
            <WrappedComponent {...props}>
                {props.children}
            </WrappedComponent>
        );
    }
    
}

export default requireAuth;