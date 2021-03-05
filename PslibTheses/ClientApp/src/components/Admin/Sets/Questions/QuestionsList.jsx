import React, {useState, useEffect, useCallback} from 'react';
import {Question} from "./Question";
import styled from 'styled-components';
import axios from "axios";
import {useAppContext, ADD_MESSAGE} from "../../../../providers/ApplicationProvider";
import { useDrag, useDrop } from 'react-dnd';

const StyledEmptyParagraph = styled.p`
padding: 10px;
text-align: center;
`;

export const QuestionsList = ({data, setId, fetchData, roleId, termId}) => {
    const [ collection, setCollection ] = useState(data);
    const [ globalEditing, setGlobalEditing ] = useState(false);
    const [{accessToken}, dispatch] = useAppContext();

    const moveQuestion = useCallback((from, to) => {
        axios.put(process.env.REACT_APP_API_URL + "/sets/" + setId + "/questions/" + termId + "/" + roleId + "/" + from + "/moveto/" + to,{},{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Pořadí otázek bylo změněno", variant: "success", dismissible: true, expiration: 3});
            fetchData();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během změny pořadí otázek došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[data, accessToken, dispatch, fetchData]);

    useEffect(()=>{setCollection(data)},[data]);
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
            {collection.map((item,index) => (
                <Question 
                    key={index} 
                    value={item} 
                    index={index} 
                    globalEditing={globalEditing} 
                    setId={setId}
                    setGlobalEditing={setGlobalEditing} 
                    fetchData={fetchData}
                    count={collection.length}
                    moveItemAction={moveQuestion}
                    movingItem={movingItem}
                />
            ))}
            </>
        );
    }
    else
    {
        return <StyledEmptyParagraph>V tomto termínu nejsou pro tuto roli zatím žádné otázky. Tlačítkem "+" pod tímto textem můžete nějakou přidat.</StyledEmptyParagraph>
    }
}

export default QuestionsList;