import React, {useState, useRef, useEffect, useCallback} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {Input, EditMiniButton, DeleteMiniButton, CreateMiniButton, CancelMiniButton, YesMiniButton, UpMiniButton, DownMiniButton} from "../general";
import styled from 'styled-components';
import {devices} from "../../configuration/layout";

const StyledDragItemsContainer = styled.ol`
padding: 0;
list-style: none;
counter-reset: steps;
`;
const StyledDragItemsList = styled.div`
display: flex;
flex-direction: column;
justify-content: space-between;
`;
const StyledDragItem = styled.li`
cursor: ${props => (props.editable === true && props.globalEditing === false) ? "move" : "default"};
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

const StyledDragItemWrapper = styled.div`
flex-grow: 1;
display: flex;
flex-direction: row;
align-items: center;
justify-content: space-between;
@media ${devices.mobile} {
    flex-direction: column;
}
`;

const StyledDragItemContent = styled.div`
flex-grow: 1;
& > input {
    display: block;
    width: 100%;
    box-sizing: border-box;
}
`;

const StyledDragItemIcons = styled.div`

`;

const DragItem = props => {
    const [ isEditing, setIsEditing ] = useState(false);
    const [ text, setText ] = useState(props.text);
    const [ editedText, setEditedText ] = useState(props.text);
    const ref = useRef(null);
    const [ , drop ] = useDrop({
        accept: props.itemType,
        hover(item, monitor) {
            if (props.globalEditing) return;
            if (!ref.current) return;
			const dragIndex = item.index;
            const hoverIndex = props.index;
            if (dragIndex === hoverIndex) return;
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
            props.movingItem(dragIndex,hoverIndex);      
            item.index = hoverIndex;
        },
        drop(item, monitor) {
            props.moveItemAction(item.order, item.index + 1);
        }
    });
    const [ { isDragging }, drag ] = useDrag({
		item: { type: props.itemType, order: props.order, index: props.index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
    });
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));
    if (isEditing) {
        return (
            <StyledDragItem style={{opacity: opacity}}>
                <StyledDragItemWrapper>
                    <StyledDragItemContent>
                    <Input autoFocus value={editedText} onChange={e => setEditedText(e.target.value)} onBlur={e=>{if (editedText === text) setIsEditing(false); props.setGlobalEditing(false);}} onKeyDown={
                        e => {
                            if (e.key === "Enter") 
                            {
                                setText(editedText); 
                                setIsEditing(false); 
                                props.setGlobalEditing(false);
                                props.updateItemAction(props.order, editedText);
                            } 
                            else if (e.key === "Escape")
                            {
                                setIsEditing(false);
                                props.setGlobalEditing(false); 
                            }
                        }
                    } />
                    </StyledDragItemContent>
                    {props.editable 
                    ?
                        <StyledDragItemIcons>
                            <YesMiniButton onClick={(e) => {setText(editedText); setIsEditing(false); props.setGlobalEditing(false); props.updateItemAction(props.order, editedText);}} />
                            <CancelMiniButton onClick={(e) => {setIsEditing(false); props.setGlobalEditing(false);}} />
                        </StyledDragItemIcons>
                    :
                    ""
                    }    
                </StyledDragItemWrapper>       
            </StyledDragItem>
        );
    }
    else
    {
        return (
            <StyledDragItem ref={(props.editable /*&& !props.globalEditing*/) ? ref : null} onDoubleClick={(e) => {if(props.editable) {
                    setEditedText(text);
                    setIsEditing(true);
                    props.setGlobalEditing(true);
                }}} {...props}>
                <StyledDragItemWrapper>
                    <StyledDragItemContent>
                    {text}
                    </StyledDragItemContent>                    
                    {props.editable 
                    ?
                    <StyledDragItemIcons>
                        <EditMiniButton onClick={(e) => {setEditedText(text); setIsEditing(true); props.setGlobalEditing(true);}} />
                        <DeleteMiniButton onClick={(e) => {props.removeItemAction(props.order);}} />
                        <DownMiniButton disabled={props.order === props.count} onClick={(e) => {if (props.order < props.count) props.moveItemAction(props.order, props.order + 1);}} />
                        <UpMiniButton disabled={props.order === 1} onClick={(e) => {if (props.order > 1) props.moveItemAction(props.order, props.order - 1);}} />
                    </StyledDragItemIcons>
                    :
                    ""
                    }     
                </StyledDragItemWrapper>          
            </StyledDragItem>
        );
    }    
}

const AddItemPanel = props => {
    const [ item, setItem ] = useState("");
    return (
        <StyledAddItemPanel>
        <Input onChange={(e) => setItem(e.target.value)} onKeyDown={
                    e => {
                        if (e.key === "Enter") 
                        {
                            props.addItemAction(item)
                        }
                    }
                }/>
        <CreateMiniButton disabled={item.length === 0} onClick={(e) => {if (item.length > 0) props.addItemAction(item); e.preventDefault();}} />
        </StyledAddItemPanel>
    );
}

const DragItemsContainer = ({items, editable, removeItemAction, updateItemAction, moveItemAction, itemType, ...rest}) => {
    const [ collection, setCollection ] = useState(items);
    const [ globalEditing, setGlobalEditing ] = useState(false);
    useEffect(()=>{setCollection(items)},[items])
    const movingItem = useCallback(
        (dragIndex, hoverIndex) => {
            let draggedItem = collection[dragIndex];
            let newCollection = [...collection];
            newCollection.splice(dragIndex, 1);
            newCollection.splice(hoverIndex, 0, draggedItem);
            setCollection(newCollection);
        },[collection]
    )
    if (Array.isArray(collection) && (collection.length > 0))
    {
        return (
            <>
            <StyledDragItemsContainer {...rest}>
            {collection.map((item, index) => (
            <DragItem 
                key={item.order} 
                index={index} 
                text={item.text} 
                order={item.order} 
                removeItemAction={removeItemAction} 
                updateItemAction={updateItemAction} 
                movingItem={movingItem}
                moveItemAction={moveItemAction} 
                editable={editable} 
                itemType={itemType}
                count={collection.length}
                globalEditing={globalEditing}
                setGlobalEditing={setGlobalEditing}
            />))}
            </StyledDragItemsContainer>
            </>
        );
    }
    else
    {
        return (
            <div>Žádný obsah</div>
        );
    }
}

const DragItemsList = ({addItemAction, editable, ...rest}) => {
    return (
        <StyledDragItemsList>
            <DragItemsContainer editable={editable} {...rest} />
            {editable ? <AddItemPanel addItemAction={addItemAction} /> : ""}
        </StyledDragItemsList>
    );
}

export default DragItemsList;