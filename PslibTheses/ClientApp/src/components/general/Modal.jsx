import React, {useEffect, useState, useCallback} from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import theme from "styled-theming";
import {Heading} from ".";

import {breakpoints} from "../../configuration/layout";

const StyledModalOverlay = styled.div`
overflow: hidden;
display: block;
height: 100vh;
width: 100vw;
top: ${props => (props.active ? "0" : "100vh")};
left: 0;
position: fixed;
// backdrop-filter: ${props => (props.active ? "blur(10px)" : "none")};
//background-blend-mode: exclusion;
//transition: backdrop-filter .5s;
//background: rgba(255, 255, 255, .3);
//background-image: url(data:image/png;base64,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);
z-index: 10;
`;

const ModalOverlay = props => {
    const [isActive, setActive] = useState(false);
    const [isChildrenActive, setChildrenActive] = useState(false);
    useEffect(() => {
        if (props.active)
        {
            setActive(true);
            setChildrenActive(true);
        }
        else
        {
            setChildrenActive(false);
            let tout = setTimeout(()=>{setActive(false);}, 500);      
            return () => {clearTimeout(tout);};
        }
    },[props.active]);
    return(
        <StyledModalOverlay {...props} active={isActive}>
            {React.cloneElement(props.children, { active: isChildrenActive })}
        </StyledModalOverlay>
    );    
}

const backgroundColor = theme.variants("mode", "variant", {
    default: {light: props => props.theme.colors.defaultBackground, dark: props => props.theme.colors.defaultBackground},
    info: {light: props => props.theme.colors.infoBackground, dark: props => props.theme.colors.infoBackground},
    success: {light: props => props.theme.colors.successBackground, dark: props => props.theme.colors.successBackground},
    warning: {light: props => props.theme.colors.warningBackground, dark: props => props.theme.colors.warningBackground},
    danger: {light: props => props.theme.colors.errorBackground, dark: props => props.theme.colors.errorBackground},
    error: {light: props => props.theme.colors.errorBackground, dark: props => props.theme.colors.errorBackground},
});

const foregroundColor = theme.variants("mode", "variant", {
    default: {light: props => props.theme.colors.defaultForeground, dark: props => props.theme.colors.defaultForeground},
    info: {light: props => props.theme.colors.infoForeground, dark: props => props.theme.colors.infoForeground},
    success: {light: props => props.theme.colors.successForeground, dark: props => props.theme.colors.successForeground},
    warning: {light: props => props.theme.colors.warningForeground, dark: props => props.theme.colors.warningForeground},
    danger: {light: props => props.theme.colors.errorForeground, dark: props => props.theme.colors.errorForeground},
    error: {light: props => props.theme.colors.errorForeground, dark: props => props.theme.colors.errorForegroundd},
});

const StyledModalWindow = styled.div`
position: absolute;
overflow: hidden;
background-color: ${backgroundColor};
color: ${foregroundColor};
border: ${foregroundColor} 0px solid;
width: calc(100% - 10px);
top: 50%;
transform: translate(-50%, -50%) perspective(500px) rotate3d(1, 0, 0, ${props => (props.active ? "0" : "60deg")});
opacity: ${props => (props.active ? "1" : "0")};
left: 50%;
max-height: 100vh;
display: flex;
flex-direction: column;
justify-content: space-between;
transition: all .5s;
box-sizing: border-box;
box-shadow: 5px 5px 10px 5px rgba(10,10,5,.2);
margin: 7px;
@media (min-width: ${breakpoints.tablet}){
    max-width: calc(${breakpoints.tablet});
}
`;

StyledModalWindow.defaultProps = {
    variant: "default"
};

const StyledModalHeader = styled.div`
color: ${foregroundColor};
padding: .5rem;
flex-grow: 0;
flex-shrink: 0;
& h1 {
    margin: 0;
    font-size: 1.8rem;
}
`;

const StyledModalContent = styled.div`
margin: 0;
padding: .5rem;
flex-grow: 1;
overflow: auto;
`;

const StyledModalFooter = styled.div`
flex-grow: 0;
flex-shrink: 0;
display: flex;
flex-direction: row;
justify-content: flex-end;
padding: .5em;
`;

const Modal = props => {
    const {active, onDismiss, defaultAction, ...rest} = props;
    const keyProcessing = useCallback(e=>{
        if (e.key === "Escape") onDismiss();
        if (e.key === "Enter" && defaultAction && (typeof defaultAction === 'function')) defaultAction();
    },[defaultAction, onDismiss]);
    useEffect(()=>{
        document.addEventListener("keydown", keyProcessing, false);
        return () => {document.removeEventListener("keydown", keyProcessing, false);};
    },[keyProcessing]);
    return ReactDOM.createPortal(
        <ModalOverlay active={active} onClick={onDismiss}>
            <StyledModalWindow {...rest} onClick={e => e.stopPropagation()}>
                {props.title ? <StyledModalHeader><Heading>{props.title}</Heading></StyledModalHeader> : ""}
                <StyledModalContent>
                    {props.children}  
                </StyledModalContent>
                {props.actions ? <StyledModalFooter>{props.actions}</StyledModalFooter> : ""}
            </StyledModalWindow>
        </ModalOverlay>,
        document.querySelector("#modal")
    );
}

export default Modal;