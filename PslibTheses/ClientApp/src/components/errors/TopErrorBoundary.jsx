import React from 'react';
import ErrorBoundary from "./ErrorBoundary";
import MessageLayout from "../layouts/MessageLayout";
import Error from "../messages/Error";
import {mainTheme as theme} from "../../App";
 
export default class TopErrorBoundary extends ErrorBoundary {
    render() {
        if (this.state.hasError) {
            return (
            <MessageLayout backgroundColor={theme.colors.errorBackground} color={theme.colors.errorForeground}>
                <Error />
                <div><a style={{color: theme.colors.errorForeground}} href="/">Na titulní stránku, znovunačíst aplikaci.</a></div>
                <details>
                    <summary>Více informací</summary>
                    {this.state.errorInfo && this.state.errorInfo.componentStack.toString()}
                </details>
            </MessageLayout>
            );
        }
        return this.props.children;
    }
}