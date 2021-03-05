import React, {useState, useEffect} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import {Modal, ButtonBlock, CardHeader, CardBody, Subheading, CardTypeValueList, CardTypeValueItem, Button, CardFooter, Paragraph } from "../../general";
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
        setIsEditable((profile !== null) && (profile[ADMIN_ROLE] === "1") && (Number(props.data.sets) === 0 ));
     },[accessToken, profile, props.owner]);
        return (
            <>
            <CardHeader><Subheading>Obecné informace</Subheading></CardHeader>
            <CardBody>
                <CardTypeValueList>
                    <CardTypeValueItem type="Název" value={props.data.name} />
                    <CardTypeValueItem type="Počet sad, kde je použita" value={props.data.sets} />
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
            title="Opravdu smazat hodnotící škálu?"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{
                        setIsDeleting(true);
                        axios.delete(process.env.REACT_APP_API_URL + "/scales/" + props.data.id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                        .then(response => {
                            dispatch({type: ADD_MESSAGE, text: "Škála byla smazána.", variant: "success", dismissible: true, expiration: 3});
                            history.push("/admin/scales");
                        })
                        .catch(error => {
                            if (error.response)
                            {
                                if (error.response.status === 500)
                                {
                                    dispatch({type: ADD_MESSAGE, text: "Server nedokázal smazat záznam škály. Důvodem může být chyba serveru nebo ochrana konzistence dat.", variant: "error", dismissible: true, expiration: 8});
                                }
                                else
                                {
                                    dispatch({type: ADD_MESSAGE, text: "Smazání škály se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                                }
                                   
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání škály se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                            }
                        })
                        .then(()=>{
                            setIsDeleting(false);
                            setShowDelete(false);
                        });
                        setShowDelete(false); 
                    }}>Smazat</Button>
                    <Button variant="light" outline onClick={async ()=>{ setShowDelete(false); }}>Storno</Button>
                </>
            }
        >
            <Paragraph>Takto smazanou škálu hodnocení nebude možné nijak obnovit.</Paragraph>
            <Paragraph>Její smazání nebude úspěšné, pokud je použita v nějaké sadě.</Paragraph>
        </Modal>
            </>
        ); 
};

export default Display;