import React from 'react';
import {Route, Switch} from "react-router-dom";
import requireAuth from "../Auth/requireAuth";
import List from "./List";
import Detail from "./Detail";

const Users = props => {
    return (
        <>
        <Switch>
            <Route exact path="/users" component={List} />
            <Route path="/users/:id" component={Detail} />
        </Switch>
        </>
    );
}

export default requireAuth(Users);