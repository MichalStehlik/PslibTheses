import React from 'react';
import { Route } from 'react-router-dom';

const LayoutRoute = ({component: Component, layout: Layout, ...rest}) => {
    if (Layout === undefined) {
        Layout = props => (<React.Fragment>{props.children}</React.Fragment>)
    }
    return (
        <Route {...rest} render={props => (
            <Layout {...rest}>
                <Component {...props} />
            </Layout>
        )} />
    );
}

export default LayoutRoute;