import React from 'react';
import styled from 'styled-components';
import { Link } from "react-router-dom";

const StyledUser = styled.div`
display: flex;
flex-direction: row;
align-items: center;
& img {
    height: 38px;
    border: 1px solid white;
}
`;
const StyledUserContainer = styled.div`
margin: 5px;
display: flex;
flex-direction: column;
`;
const StyledUserName = styled.span`
text-decoration: none;
`;
const StyledUserNameLink = styled(Link)`
text-decoration: none;
color: inherit;
&:hover {
    text-decoration: underline;
}
`;
const StyledUserDetail = styled.span`
font-size: .7em;
`;

const User = props => (
    <StyledUser>
        {props.image !== null ? props.image : null}
        <StyledUserContainer>
            {props.to ? <StyledUserNameLink to={props.to}>{props.name}</StyledUserNameLink> : <StyledUserName>{props.name}</StyledUserName>}
            <StyledUserDetail>{props.detail}</StyledUserDetail>
        </StyledUserContainer>
    </StyledUser>
);

export default User;