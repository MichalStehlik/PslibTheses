import React, {useState} from 'react';
import styled from 'styled-components';
import DisplayAnswer from "./DisplayAnswer";
import EditAnswer from "./EditAnswer";

const StyledAnswer = styled.div`
border-top: 1px solid silver;
`;

export const Answer = ({item, globalEditing, fetchData, setId, setGlobalEditing}) => {
    const [editMode, setEditMode] = useState(false);
    if (editMode)
    {
        return (
            <EditAnswer value={item} setEditMode={setEditMode} globalEditing={globalEditing} setId={setId} setGlobalEditing={setGlobalEditing} fetchData={fetchData} />
        );
    }
    else
    {
        return (
            <StyledAnswer>
                <DisplayAnswer value={item} setEditMode={setEditMode} globalEditing={globalEditing} fetchData={fetchData} setId={setId} />
            </StyledAnswer>
        );
    }
}

export default Answer;