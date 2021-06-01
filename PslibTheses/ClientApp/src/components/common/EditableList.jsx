import React, { useState, useEffect } from 'react';
import { Input, EditMiniButton, DeleteMiniButton, CreateMiniButton, CancelMiniButton, YesMiniButton } from "../general";
import styled from 'styled-components';
import { devices } from "../../configuration/layout";

const StyledEditableItemsContainer = styled.ol`
padding: 0;
list-style: none;
counter-reset: steps;
`;
const StyledEditableItemsList = styled.div`
display: flex;
flex-direction: column;
justify-content: space-between;
`;
const StyledEditableItem = styled.li`
border-top: 1px solid #bbb;
margin-bottom: .5rem;
display: flex;
flex-direction: row;
align-items: center;
justify-content: flex-start;
padding: 3px;
min-height: 2em;
margin: 0;
counter-increment: steps;
position: relative;
&::before {
    flex-shrink: 0;
    content: counter(steps);
    margin-right: 0.5rem;
    background: #bbb;
    color: white;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
    display: inline-grid;
    place-items: center;
    line-height: 1.2em;
}
& > span {
    position: absolute;
    right: 0;
    top: 3px;
}
& > input {
    width: 100%;
}
`;

const StyledAddItemPanel = styled.div`
display: flex;
padding-top: 1em;
flex-direction: row;
align-items: center;
width: 100%;
justify-content: space-between;
& input {
    flex-grow: 1;
    margin-right: 3px;
}
`;

const StyledEditableItemWrapper = styled.div`
flex-grow: 1;
display: flex;
flex-direction: row;
align-items: center;
justify-content: space-between;
@media ${devices.mobile} {
    flex-direction: column;
}
`;

const StyledEditableItemContent = styled.div`
flex-grow: 1;
& > input {
    display: block;
    width: 100%;
    box-sizing: border-box;
}
`;

const StyledEditableItemIcons = styled.div`

`;


const EditableItem = ({ id, displayedText, removeItemAction, updateItemAction, editable, globalEditing, setGlobalEditing, ...rest }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(displayedText);
    const [editedText, setEditedText] = useState(displayedText);
    if (isEditing) {
        return (
            <StyledEditableItem>
                <StyledEditableItemWrapper>
                    <StyledEditableItemContent>
                        <Input autoFocus value={editedText} onChange={e => setEditedText(e.target.value)} onBlur={e => { if (editedText === text) setIsEditing(false); setGlobalEditing(false); }} onKeyDown={
                            e => {
                                if (e.key === "Enter") {
                                    setText(editedText);
                                    setIsEditing(false);
                                    setGlobalEditing(false);
                                    updateItemAction(id, editedText);
                                }
                                else if (e.key === "Escape") {
                                    setIsEditing(false);
                                    setGlobalEditing(false);
                                }
                            }
                        } />
                    </StyledEditableItemContent>
                    {editable
                        ?
                        <StyledEditableItemIcons>
                            <YesMiniButton onClick={(e) => { setText(editedText); setIsEditing(false); setGlobalEditing(false); updateItemAction(id, editedText); }} />
                            <CancelMiniButton onClick={(e) => { setIsEditing(false); setGlobalEditing(false); }} />
                        </StyledEditableItemIcons>
                        :
                        ""
                    }
                </StyledEditableItemWrapper>
            </StyledEditableItem>
        );
    }
    else {
        return (
            <StyledEditableItem onDoubleClick={(e) => {
                if (editable) {
                    setEditedText(text);
                    setIsEditing(true);
                    setGlobalEditing(true);
                }
            }} {...rest}>
                <StyledEditableItemWrapper>
                    <StyledEditableItemContent>
                        {text}
                    </StyledEditableItemContent>
                    {editable
                        ?
                        <StyledEditableItemIcons>
                            <EditMiniButton onClick={(e) => { setEditedText(text); setIsEditing(true); setGlobalEditing(true); }} />
                            <DeleteMiniButton onClick={(e) => { removeItemAction(id); }} />
                        </StyledEditableItemIcons>
                        :
                        ""
                    }
                </StyledEditableItemWrapper>
            </StyledEditableItem>
        );
    }
}

const AddItemPanel = props => {
    const [item, setItem] = useState("");
    return (
        <StyledAddItemPanel>
            <Input onChange={(e) => setItem(e.target.value)} onKeyDown={
                e => {
                    if (e.key === "Enter") {
                        props.addItemAction(item)
                    }
                }
            } />
            <CreateMiniButton disabled={item.length === 0} onClick={(e) => { if (item.length > 0) props.addItemAction(item); e.preventDefault(); }} />
        </StyledAddItemPanel>
    );
}

const EditableItemsContainer = ({ items, editable, removeItemAction, updateItemAction, ...rest }) => {
    const [collection, setCollection] = useState(items);
    const [globalEditing, setGlobalEditing] = useState(false);
    useEffect(() => { setCollection(items) }, [items])
    if (Array.isArray(collection) && (collection.length > 0)) {
        return (
            <>
                <StyledEditableItemsContainer {...rest}>
                    {collection.map((item, index) => (
                        <EditableItem
                            key={item.id}
                            index={index}
                            displayedText={item.text}
                            id={item.id}
                            removeItemAction={removeItemAction}
                            updateItemAction={updateItemAction}
                            editable={editable}
                            count={collection.length}
                            globalEditing={globalEditing}
                            setGlobalEditing={setGlobalEditing}
                        />))}
                </StyledEditableItemsContainer>
            </>
        );
    }
    else {
        return (
            <div>Žádný obsah</div>
        );
    }
}

const EditableItemsList = ({ addItemAction, editable, ...rest }) => {
    return (
        <StyledEditableItemsList>
            <EditableItemsContainer editable={editable} {...rest} />
            {editable ? <AddItemPanel addItemAction={addItemAction} /> : ""}
        </StyledEditableItemsList>
    );
}

export default EditableItemsList;