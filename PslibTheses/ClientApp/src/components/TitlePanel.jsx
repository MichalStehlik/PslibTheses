﻿import React from 'react';
import styled from 'styled-components';
import { useAppContext } from "../providers/ApplicationProvider";
import { Helmet } from "react-helmet";

const StyledTitlePanel = styled.p`
padding: 3px 10px;
overflow: hidden;
text-overflow: elipsis;
display: flex;
align-items: center;
margin: 0;
`;

const TitlePanel = props => {
    const [{title}] = useAppContext();
    return (
        <>
            <Helmet>
                <title>{title + " | Dlouhodobé práce SPŠSE"}</title>
            </Helmet>
            <StyledTitlePanel>{title}</StyledTitlePanel>
        </>
    );
}

export default TitlePanel;