import React from 'react';
import {Route, Switch} from "react-router-dom";
import Sets from "./Sets";
import NotFound from "../NotFound";
import LayoutRoute from "../layouts/LayoutRoute";
import MessageLayout from "../layouts/MessageLayout";
import {mainTheme as theme} from "../../App";
import requireAuth from "../Auth/requireAuth";

const Works = props => {
    return (
        <Switch>
            <Route exact path="/evaluation" component={Sets} />
            <LayoutRoute component={NotFound} layout={MessageLayout} backgroundColor={theme.colors.infoBackground} color={theme.colors.infoForeground} />   
        </Switch>
    );
}

export default requireAuth(Works);

/*
            <Route path="/evaluation/:id" component={Detail} />
*/