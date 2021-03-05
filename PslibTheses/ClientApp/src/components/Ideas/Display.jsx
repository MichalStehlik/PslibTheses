import React, {useState, useEffect} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Modal, CardHeader, CardBody, Subheading, CardTypeValueList, CardTypeValueItem, Button, CardFooter, Paragraph, ButtonBlock } from "../general";
import {DateTime, LoadedUser} from "../common";
import {useHistory} from "react-router-dom";
import {ADMIN_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";
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
        setIsEditable((profile !== null) && ((profile.sub === props.owner || profile[ADMIN_ROLE] === "1" || profile[EVALUATOR_ROLE] === "1")));
     },[accessToken, profile, props.owner]);
        return (
            <>
            <CardHeader><Subheading>Obecné informace</Subheading></CardHeader>
            <CardBody>
                <CardTypeValueList>
                    <CardTypeValueItem type="Název" value={props.data.name} />
                    <CardTypeValueItem type="Předmět" value={props.data.subject} />
                    <CardTypeValueItem type="Popis" value={<span dangerouslySetInnerHTML={{__html: props.data.description }} />} />
                    <CardTypeValueItem type="Prostředky" value={props.data.resources} />
                    <CardTypeValueItem type="Počet spolupracovníků" value={props.data.participants} />
                    <CardTypeValueItem type="Autor" value={<LoadedUser id={props.data.userId} />} />
                    <CardTypeValueItem type="Vytvořeno" value={<DateTime date={props.data.created} />} />
                    <CardTypeValueItem type="Aktualizováno" value={<DateTime date={props.data.updated} />} />
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
            title="Opravdu smazat námět?"
            actions={
                <>
                    <Button outline variant="light" onClick={async ()=>{
                        setIsDeleting(true);
                        axios.delete(process.env.REACT_APP_API_URL + "/ideas/" + props.data.id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                        .then(response => {
                            dispatch({type: ADD_MESSAGE, text: "Námět byl smazán.", variant: "success", dismissible: true});
                            history.push("/ideas");
                        })
                        .catch(error => {
                            if (error.response)
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání námětu se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true});
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání námětu se nepodařilo.", variant: "error", dismissible: true});
                            }
                        })
                        .then(()=>{
                            setIsDeleting(false);
                            setShowDelete(false);
                        });
                        setShowDelete(false); 
                    }}>Smazat</Button>
                    <Button outline variant="light" onClick={async ()=>{ setShowDelete(false); }}>Storno</Button>
                </>
            }
        >
            <Paragraph>Takto smazaný námět nebude možné nijak obnovit.</Paragraph>
        </Modal>
            </>
        );
};

export default Display;