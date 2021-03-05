import React from 'react';
import {Route, Switch} from "react-router-dom";
import List from "./List";
import Create from "./Create";
import Detail from "./Detail";
import Questions from "./Questions/";
import NotFound from "../../NotFound";
import LayoutRoute from "../../layouts/LayoutRoute";
import MessageLayout from "../../layouts/MessageLayout";
import {mainTheme as theme} from "../../../App";

const Sets = props => {
    return (
        <Switch>
            <Route exact path="/admin/sets" component={List} />
            <Route exact path="/admin/sets/create" component={Create} />
            <Route path="/admin/sets/:id/questions/term/:term/role/:role" component={Questions} />
            <Route path="/admin/sets/:id" component={Detail} />
            <LayoutRoute component={NotFound} layout={MessageLayout} backgroundColor={theme.colors.infoBackground} color={theme.colors.infoForeground} />   
        </Switch>
    );
}

export default Sets;