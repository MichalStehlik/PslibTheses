import React from 'react';
import {Route, Switch} from "react-router-dom";
import List from "./List";
import Create from "./Create";
import CreateFromIdea from "./CreateFromIdea";
import Guide from "./Guide";
import Detail from "./Detail";
import Summary from "./Summary";
import Review from "./Review/";
import Overview from "./Overview";
import NotFound from "../NotFound";
import Evaluation from "./Evaluation";
import LayoutRoute from "../layouts/LayoutRoute";
import MessageLayout from "../layouts/MessageLayout";
import {mainTheme as theme} from "../../App";
import requireAuth from "../Auth/requireAuth";

const Works = props => {
    return (
        <Switch>
            <Route exact path="/works" component={List} />
            <Route exact path="/works/create/:id" component={CreateFromIdea} />
            <Route exact path="/works/create" component={Create} />
            <Route exact path="/works/guide" component={Guide} />
            <Route exact path="/works/:id/overview/:role" component={Overview} />
            <Route exact path="/works/:id/overview" component={Summary} />
            <Route exact path="/works/:id/evaluation/:role/:term" component={Evaluation} />
            <Route exact path="/works/:id/review/:role" component={Review} />
            <Route exact path="/works/:id" component={Detail} />
            <LayoutRoute component={NotFound} layout={MessageLayout} backgroundColor={theme.colors.infoBackground} color={theme.colors.infoForeground} />   
        </Switch>
    );
}

export default requireAuth(Works);