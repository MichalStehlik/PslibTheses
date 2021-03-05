import React from 'react';
import {Route, Switch} from "react-router-dom";
import requireAdmin from "../Auth/requireAdmin";
import Title from "./Title";
import Users from "./Users";
import Targets from "./Targets";
import Sets from "./Sets";
import Scales from "./Scales";
import NotFound from "../NotFound";

const Home = props => {
    return (
        <Switch>
            <Route exact path="/admin" component={Title} />
            <Route path="/admin/users" component={Users} />
            <Route path="/admin/targets" component={Targets} />
            <Route path="/admin/sets" component={Sets} />
            <Route path="/admin/scales" component={Scales} />
            <Route exact component={NotFound} />
        </Switch>
    );
}

export default requireAdmin(Home);