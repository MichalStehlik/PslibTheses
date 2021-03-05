import React from 'react';
import {Route, Switch} from "react-router-dom";
import List from "./List";
import Create from "./Create";
import Detail from "./Detail";
import NotFound from "../../NotFound";
import LayoutRoute from "../../layouts/LayoutRoute";
import MessageLayout from "../../layouts/MessageLayout";
import {mainTheme as theme} from "../../../App";

const Targets = props => {
    return (
        <Switch>
            <Route exact path="/admin/targets" component={List} />
            <Route exact path="/admin/targets/create" component={Create} />
            <Route path="/admin/targets/:id" component={Detail} />
            <LayoutRoute component={NotFound} layout={MessageLayout} backgroundColor={theme.colors.infoBackground} color={theme.colors.infoForeground} />   
        </Switch>
    );
}

export default Targets;