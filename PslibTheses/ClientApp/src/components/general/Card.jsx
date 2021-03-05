import React from 'react';
import styled from 'styled-components';
import theme from "styled-theming";
import {devices} from "../../configuration/layout";

export const CardContainer = styled.div`
display: flex;
flex-wrap: wrap;
justify-content: flex-start;
align-items: stretch;
& > * {
    flex-basis: 45rem;
}
`;

export const Card = styled.section`
background-color: ${props => props.theme.colors.cardBackground};
color: ${props => props.theme.colors.cardForeground};
flex-grow: 1;
border: 1px solid #cccccc;
margin: 5px;
box-sizing: border-box;
`;
export const CardHeader = styled.header`
padding: 10px;
margin: 0;
&>* {
    margin: 0;
} 
`;
export const CardFooter = styled.footer`
padding: 10px;
margin: 0;
&>* {
    margin: 0;
} 
`;

export const CardBody = styled.div`
padding: 10px;
& > table {
    padding: 0;
}
`;

export const CardTypeValueList = styled.div`
display: flex;
flex-direction: column;
& > dl:first-child {
    border-top: none;
}
`;

const StyledCardTypeValueItem = styled.dl`
display: flex;
margin: 0;
flex-direction: row;
border-top: 1px solid #cccccc;
padding: 5px;
& > dt, & > dd {
    flex-basis: 50%;
}
& > dt {
    font-weight: 700;
}
& > dd {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
@media ${devices.mobile} {
    flex-direction: column;
    & > dt, & > dd {
        flex-basis: auto;
        margin: 3px;
    }
}
`;

export const CardTypeValueItem = props => (
    <StyledCardTypeValueItem>
        <dt>{props.type}</dt>
        <dd>{props.value}</dd>
    </StyledCardTypeValueItem>
);