import React from 'react';
import styled from 'styled-components';

const MessageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 15px;
    box-sizing: border-box;
    font-size: ${props => props.size ? props.size : "inherit"};
    color: ${props => props.color ? props.color : "inherit"};
    background-color: ${props => props.backgroundColor ? props.backgroundColor : "inherit"};
`;

const Message = props => (
    <MessageWrapper {...props}>
        {props.children}
    </MessageWrapper>
);

export default Message;