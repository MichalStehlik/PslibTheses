import React, {useState} from 'react';
import {DeleteMiniButton, EditMiniButton, Modal, Paragraph, Button} from "../../../general";
import {useAppContext, ADD_MESSAGE} from "../../../../providers/ApplicationProvider";
import {ReactComponent as WarningIcon} from "../../../../assets/icons/warning_triangle.svg";
import Axios from 'axios';
import styled from 'styled-components';

const AnswerLayout = styled.div`
width: 100%;
display: grid;
grid-template-areas: "text coeficient menu" "description description menu";
grid-template-columns: 1fr 100px 50px;
grid-template-rows: auto auto;
`;

const AnswerText = styled.div`
    grid-area: text;
    padding: 10px;
`;

const AnswerDescription = styled.div`
    grid-area: description;
    font-size: 80%;
    padding: 0px 10px 0px 45px;
    color: #aaa;
`;

const AnswerCoeficient = styled.div`
    grid-area: coeficient;
    padding: 10px;
    align-self: center;
    text-align: right;
    color: ${props => props.critical ? "red" : "gray"};
`;

const AnswerMenu = styled.div`
    grid-area: menu;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    margin: 0 5px;
    align-self: flex-start;
`;

const Sign = styled.span`
    display: inline-flex;
    color: gray;
    align-items: center;
    & svg {
        fill: gray;
        stroke: gray;
        height: 1em;
        stroke-width: .15em;
    }
`;

const DisplayAnswer = ({value, setEditMode, globalEditing, setId, fetchData, count, moveItemAction}) => {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [{accessToken}, dispatch] = useAppContext();
    return (
        <>
        <AnswerLayout onDoubleClick={e => {if (!globalEditing) setEditMode(true)}}>
            <AnswerText>{value.text}</AnswerText>
            <AnswerCoeficient critical={value.critical}>{value.critical ? <Sign><WarningIcon /></Sign> : ""} {value.rating}%</AnswerCoeficient>
            {value.description 
            ?
            <AnswerDescription>
            {<span dangerouslySetInnerHTML={{__html: value.description }} />}
            </AnswerDescription>
            :
            ""
            }
            <AnswerMenu>
            {globalEditing 
                ?
                ""
                :
                <>
                    <EditMiniButton onClick={e => setEditMode(true)} />
                    <DeleteMiniButton onClick={e => setShowDelete(true)} />
                </>
                } 
            </AnswerMenu>
        </AnswerLayout>
        <Modal 
        active={showDelete} 
        variant="danger"
        onDismiss={()=>setShowDelete(false)} 
        title="Opravdu smazat odpověď?"
        actions={
            <>
                <Button variant="light" outline onClick={async ()=>{
                    setIsDeleting(true);
                    Axios.delete(process.env.REACT_APP_API_URL + "/sets/" + setId + "/answers/" + value.id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                    .then(response => {
                        dispatch({type: ADD_MESSAGE, text: "Odpověď byla smazána.", variant: "success", dismissible: true, expiration: 3});
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            if (error.response.status === 500)
                            {
                                dispatch({type: ADD_MESSAGE, text: "Server nedokázal smazat odpověď. Důvodem může být chyba serveru nebo ochrana konzistence dat.", variant: "error", dismissible: true, expiration: 8});
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání odpovědi se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                            }
                                
                        }
                        else
                        {
                            dispatch({type: ADD_MESSAGE, text: "Smazání odpovědi se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
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
        <Paragraph>Takto smazanou odpověď nebude možné nijak obnovit.</Paragraph>
        <Paragraph>Smazání odpovědi nebude úspěšné, pokud ji již někdo použil.</Paragraph>
    </Modal>
        </>
    );
}

export default DisplayAnswer;