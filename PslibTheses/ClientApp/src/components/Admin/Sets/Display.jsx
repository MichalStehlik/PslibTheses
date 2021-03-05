import React, {useState, useEffect} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import {Modal, ButtonBlock, CardHeader, CardBody, Subheading, CardTypeValueList, CardTypeValueItem, Button, CardFooter, Paragraph } from "../../general";
import Scale from "../../common/Scale";
import {useHistory} from "react-router-dom";
import {ADMIN_ROLE} from "../../../configuration/constants";
import axios from "axios";

const Display = props => {
    const [{accessToken, profile}, dispatch] = useAppContext();  
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    let history = useHistory();
    useEffect(() => {
        setShowDelete(false);
        setIsDeleting(false);
        return () => {setShowDelete(false); setIsDeleting(false);};
    },[]);
    useEffect(()=>{ 
        setIsEditable((profile !== null) && ((profile[ADMIN_ROLE] === "1")));
     },[accessToken, profile, props.owner]);
    return (
        <>
        <CardHeader><Subheading>Obecné informace</Subheading></CardHeader>
        <CardBody>
            <CardTypeValueList>
                <CardTypeValueItem type="Název" value={props.data.name} />
                <CardTypeValueItem type="Rok" value={props.data.year} />
                <CardTypeValueItem type="Aktivní" value={props.data.active ? "Ano" : "Ne"} />
                <CardTypeValueItem type="Šablona" value={props.data.template} />
                <CardTypeValueItem type="Škála známek" value={<Scale id={props.data.scaleId} />} />
                <CardTypeValueItem type="Minimální počet cílů" value={props.data.requiredGoals} />
                <CardTypeValueItem type="Minimální počet bodů osnovy" value={props.data.requiredOutlines} />
                <CardTypeValueItem type="Počet prací" value={props.worksCount} />
            </CardTypeValueList>
        </CardBody>
        {isEditable ? 
        <CardFooter>
            <ButtonBlock>
                <Button onClick={e => props.switchEditMode(true)}>Editace</Button>   
                <Button onClick={()=>{setShowDelete(true)}} disabled={isDeleting}>{!isDeleting ? "Smazání" : "Pracuji"}</Button>
            </ButtonBlock>
        </CardFooter>
        :
        ""
        }
        <Modal 
        active={showDelete} 
        variant="danger"
        onDismiss={()=>setShowDelete(false)} 
        title="Opravdu smazat sadu?"
        actions={
            <>
                <Button variant="light" outline onClick={async ()=>{
                    setIsDeleting(true);
                    axios.delete(process.env.REACT_APP_API_URL + "/sets/" + props.data.id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                    .then(response => {
                        dispatch({type: ADD_MESSAGE, text: "Sada byla smazána.", variant: "success", dismissible: true, expiration: 3});
                        history.push("/admin/sets");
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            if (error.response.status === 500)
                            {
                                dispatch({type: ADD_MESSAGE, text: "Server nedokázal smazat záznam sady. Důvodem může být chyba serveru nebo ochrana konzistence dat.", variant: "error", dismissible: true, expiration: 8});
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání sady se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                            }
                                
                        }
                        else
                        {
                            dispatch({type: ADD_MESSAGE, text: "Smazání sady se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                        }
                    })
                    .then(()=>{
                        setIsDeleting(false);
                        setShowDelete(false);
                    });
                }}>Smazat</Button>
                <Button variant="light" outline onClick={async ()=>{ setShowDelete(false); }}>Storno</Button>
            </>
        }
    >
        <Paragraph>Takto smazanou sadu nebude možné nijak obnovit.</Paragraph>
        <Paragraph>Smazání sady nebude úspěšné, pokud v ní již existují nějaké práce.</Paragraph>
    </Modal>
        </>
    ); 
};

export default Display;