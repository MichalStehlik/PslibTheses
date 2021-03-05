import React from 'react';
import styled from 'styled-components';
import theme from "styled-theming";
import {useAppContext, DISMISS_MESSAGE} from "../providers/ApplicationProvider";
import {Alert} from "./general";

const StyledAlertContainer = styled.div`
position: fixed;
bottom: 60px;
right: 0;
display: flex;
flex-direction: column;
align-items: flex-end;
justify-content: flex-end;
max-width: 100%;
z-index: 100;
`;

const AlertContainer = props => {
    const [{messages}, dispatch] = useAppContext();
    return (
        <StyledAlertContainer>
        {messages.slice(-5).map((item, index) => (
            <Alert key={index} text={item.text} variant={item.variant} dismissible={item.dismissible} expiration={item.expiration} dismiss={() => dispatch({type: DISMISS_MESSAGE, id: index})} />
        ))}
        </StyledAlertContainer>
    );
};

export default AlertContainer;