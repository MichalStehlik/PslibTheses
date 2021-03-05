import React, {useState} from 'react';
import {UpMiniButton, DownMiniButton, DeleteMiniButton, EditMiniButton, Modal, Paragraph, Button} from "../../../general";
import {useAppContext, ADD_MESSAGE} from "../../../../providers/ApplicationProvider";
import Axios from 'axios';
import styled from 'styled-components';

const QuestionLayout = styled.div`
width: 100%;
display: grid;
grid-template-areas: "text text" "description description" "points menu";
grid-template-columns: 1fr 1fr;
grid-template-rows: auto auto auto;
`;

const QuestionText = styled.div`
    grid-area: text;
    padding: 10px;
    font-size: 120%;
`;

const QuestionDescription = styled.div`
    grid-area: description;
    font-size: 80%;
    padding: 0px 10px 0px 45px;
    color: #aaa;
`;

const QuestionPoints = styled.div`
    grid-area: points;
    margin: 0 10px 10px 10px;
    align-self: center;
`;

const QuestionMenu = styled.div`
    grid-area: menu;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    margin: 0 5px;
    align-self: center;
`;

const Display = ({value, setEditMode, globalEditing, setId, fetchData, count, moveItemAction}) => {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [{accessToken}, dispatch] = useAppContext();
    return (
        <>
        <QuestionLayout onDoubleClick={e => {if (!globalEditing) setEditMode(true)}}>
            <QuestionText>
                {value.text}
            </QuestionText>
            {value.description 
            ?
            <QuestionDescription>
            {<span dangerouslySetInnerHTML={{__html: value.description }} />}
            </QuestionDescription>
            :
            ""
            }
            <QuestionPoints>
                <b>{value.points}</b> bodů
            </QuestionPoints>
            <QuestionMenu>
                {globalEditing 
                ?
                ""
                :
                <>
                    <DownMiniButton disabled={value.order === (count - 1)} onClick={(e) => {if (value.order < count) moveItemAction(value.order, value.order + 1)}} />
                    <UpMiniButton disabled={value.order === 0} onClick={(e) => {if (value.order > 0) moveItemAction(value.order, value.order - 1)}} />
                    <EditMiniButton onClick={e => setEditMode(true)} />
                    <DeleteMiniButton onClick={e => setShowDelete(true)} />
                </>
                }              
            </QuestionMenu>
        </QuestionLayout>
        <Modal 
        active={showDelete} 
        variant="danger"
        onDismiss={()=>setShowDelete(false)} 
        title="Opravdu smazat otázku?"
        actions={
            <>
                <Button variant="light" outline onClick={async ()=>{
                    setIsDeleting(true);
                    Axios.delete(process.env.REACT_APP_API_URL + "/sets/" + setId + "/questions/" + value.id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                    .then(response => {
                        dispatch({type: ADD_MESSAGE, text: "Otázka byla smazána.", variant: "success", dismissible: true, expiration: 3});
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            if (error.response.status === 500)
                            {
                                dispatch({type: ADD_MESSAGE, text: "Server nedokázal smazat otázku. Důvodem může být chyba serveru nebo ochrana konzistence dat.", variant: "error", dismissible: true, expiration: 8});
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání otázky se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                            }
                                
                        }
                        else
                        {
                            dispatch({type: ADD_MESSAGE, text: "Smazání otázky se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                        }
                    })
                    .then(()=>{
                        fetchData();
                        setIsDeleting(false);
                        setShowDelete(false);
                    });
                }}>Smazat</Button>
                <Button variant="light" outline onClick={async ()=>{ setShowDelete(false); }}>Storno</Button>
            </>
        }
    >
        <Paragraph>Takto smazanou otázku nebude možné nijak obnovit.</Paragraph>
        <Paragraph>Smazání otázky nebude úspěšné, pokud v ní již existují nějaké odpovědi.</Paragraph>
    </Modal>
</>
    );
}



export default Display;