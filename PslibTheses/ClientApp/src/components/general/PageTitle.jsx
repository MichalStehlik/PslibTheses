import React from 'react';
import styled from 'styled-components';

const StyledPageHeaderTitle = styled.h1`
font-size: 3rem;
margin: .3em;
font-weight: 100;
`;

const StyledPageHeader = styled.header`
margin: 0;
`;

const PageTitle = props => (
    <StyledPageHeader>
        <StyledPageHeaderTitle>{props.children}</StyledPageHeaderTitle>
    </StyledPageHeader>
);

export default PageTitle;