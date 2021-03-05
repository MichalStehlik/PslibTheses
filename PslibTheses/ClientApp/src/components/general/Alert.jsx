import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import theme from "styled-theming";

const backgroundColor = theme.variants("mode", "variant", {
    default: 
    {
        light: props => props.theme.colors.defaultBackground, 
        dark: props => props.theme.colors.defaultBackground
    },
    info: 
    {
        light: props => props.theme.colors.infoBackground, 
        dark: props => props.theme.colors.infoBackground
    },
    success: 
    {
        light: props => props.theme.colors.successBackground, 
        dark: props => props.theme.colors.successBackground
    },
    warning: 
    {
        light: props => props.theme.colors.warningBackground, 
        dark: props => props.theme.colors.warningBackground
    },
    danger: 
    {
        light: props => props.theme.colors.errorBackground, 
        dark: props => props.theme.colors.errorBackground
    },
    error: 
    {
        light: props => props.theme.colors.errorBackground, 
        dark: props => props.theme.colors.errorBackground
    },
});

const foregroundColor = theme.variants("mode", "variant", {
    default: 
    {
        light: props => props.theme.colors.defaultForeground, 
        dark: props => props.theme.colors.defaultForeground
    },
    info: 
    {
        light: props => props.theme.colors.infoForeground, 
        dark: props => props.theme.colors.infoForeground
    },
    success: 
    {
        light: props => props.theme.colors.successForeground, 
        dark: props => props.theme.colors.successForeground
    },
    warning: 
    {
        light: props => props.theme.colors.warningForeground, 
        dark: props => props.theme.colors.warningForeground
    },
    danger: 
    {
        light: props => props.theme.colors.errorForeground, 
        dark: props => props.theme.colors.errorForeground
    },
    error: 
    {
        light: props => props.theme.colors.errorForeground, 
        dark: props => props.theme.colors.errorForeground
    },
});

const StyledAlert = styled.div`
background-color: ${backgroundColor};
color: ${foregroundColor};
padding: .7em 1.2em;
margin: 3px;
border: thin white solid;
display: flex;
flex-direction: row;
align-items: center;
justify-content: space-between;
z-index: 100;
`;

const StyledDismissButton = styled.span`
font-size: 12px;
fill: white;
margin: 3px;
cursor: default;
`;

const DismissCountdown = props => {
    const [counter, setCounter] = useState(props.expiration);
    useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
        if (counter === 0) {props.dismiss();}
    },[counter,props]);
    return (
    <StyledDismissButton>{"(" + counter + "s)"}</StyledDismissButton>
    );
}

const DismissButton = props => {   
    return (
        <StyledDismissButton onClick={props.dismiss}>&#10006;</StyledDismissButton>
    );
}

StyledAlert.defaultProps = {
    variant: "default"
};

const Alert = props => {
    return (
        <StyledAlert {...props}>
        {props.text}
        {(props.expiration && props.dismiss) ? <DismissCountdown expiration={props.expiration} dismiss={props.dismiss} /> : ""}
        {(props.dismissible === true && props.dismiss) ? <DismissButton dismiss={props.dismiss} /> : ""}
    </StyledAlert>
    );
};

export default Alert;