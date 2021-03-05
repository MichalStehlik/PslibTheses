import React from 'react';
import styled from 'styled-components';
import {useAppContext} from "../providers/ApplicationProvider";

const StyledTitlePanel = styled.p`
padding: 3px 10px;
overflow: hidden;
text-overflow: elipse;
display: flex;
align-items: center;
margin: 0;
`;

const TitlePanel = props => {
    const [{title}] = useAppContext();
    return (
        <StyledTitlePanel>
            {title}
        </StyledTitlePanel>
    );
}

export default TitlePanel;