import React from 'react';
import {Route, Switch} from "react-router-dom";
import Sets from "./Sets";
import Works from "./Works";
import Summary from "./Summary";
import NotFound from "../NotFound";
import LayoutRoute from "../layouts/LayoutRoute";
import MessageLayout from "../layouts/MessageLayout";
import {mainTheme as theme} from "../../App";
import requireAuth from "../Auth/requireAuth";

const Index = props => {
    return (
        <Switch>
            <Route exact path="/overviews" component={Sets} />
            <Route path="/overviews/:set/details" component={Works} />
            <Route path="/overviews/:set/summary" component={Summary} />
            <Route path="/overviews/:set" component={Sets} />
            <LayoutRoute component={NotFound} layout={MessageLayout} backgroundColor={theme.colors.infoBackground} color={theme.colors.infoForeground} />   
        </Switch>
    );
}

export default requireAuth(Index);