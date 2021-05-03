import React from 'react';
import styled from 'styled-components';
import theme from "styled-theming";
import { devices } from "../../configuration/layout";

export const ColumnsContainer = styled.div`
display: flex;
flex-direction: row;
flex-wrap: wrap;
justify-content: flex-start;
align-items: stretch;
overflow: auto;
& > * {
    flex-basis: 45rem;
}
`;

export const Column = styled.div`

`;
