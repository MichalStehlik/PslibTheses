import React, {useState, useRef} from 'react';
import {Card} from "../../../general";
import styled from 'styled-components';
import { useDrag, useDrop } from 'react-dnd';
import Display from "./Display";
import Edit from "./Edit";
import AnswersList from "./AnswersList";

const ITEM = "question";

const StyledQuestion = styled(Card)`
cursor: ${props => props.globalEditing === false ? "move" : "default"};
`;

export const Question = ({value, globalEditing, setGlobalEditing, setId, fetchData, count, moveItemAction, index, movingItem}) => {
    const [editMode, setEditMode] = useState(false);
    const ref = useRef(null);

    const [ , drop ] = useDrop({
        accept: ITEM,
        hover(item, monitor) {
            if (!ref.current) return;
			const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
            movingItem(dragIndex,hoverIndex);      
            item.index = hoverIndex;
        },
        drop(item, monitor) {
            moveItemAction(item.order, item.index);
        }
    });

    const [ { isDragging }, drag ] = useDrag({
		item: { type: ITEM, order: value.order, index: index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
    });

    drag(drop(ref));
    const opacity = isDragging ? 0 : 1;
    return (
        <StyledQuestion globalEditing={globalEditing} ref={ref}>
            {editMode
            ?
            <Edit value={value} setEditMode={setEditMode} globalEditing={globalEditing} setId={setId} setGlobalEditing={setGlobalEditing} fetchData={fetchData} />
            :
            <>
                <Display value={value} setEditMode={setEditMode} globalEditing={globalEditing} setId={setId} setGlobalEditing={setGlobalEditing} fetchData={fetchData} count={count} moveItemAction={moveItemAction} />
                <AnswersList setId={setId} questionId={value.id} setGlobalEditing={setGlobalEditing} />
            </>
            }          
        </StyledQuestion>
    );
}

export default Question;