import React, {useState, useEffect} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import {Modal, ButtonBlock, CardHeader, CardBody, Subheading, CardTypeValueList, CardTypeValueItem, Badge, Button, CardFooter, Paragraph } from "../../general";
import {useHistory} from "react-router-dom";
import {ADMIN_ROLE} from "../../../configuration/constants";
import axios from "axios";
import {invertColor} from "../../../helpers/colors";

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
        setIsEditable((profile !== null) && ((profile.sub === props.owner || profile[ADMIN_ROLE] === "1")));
     },[accessToken, profile, props.owner]);
        return (
            <>
            <CardHeader><Subheading>Obecné informace</Subheading></CardHeader>
            <CardBody>
                <CardTypeValueList>
                    <CardTypeValueItem type="ID" value={props.data.id} />
                    <CardTypeValueItem type="Text" value={props.data.text} />
                    <CardTypeValueItem type="Barva" value={<Badge background={"#" + props.data.color.name.substring(2,8)} color={invertColor("#" + props.data.color.name.substring(2,8))}>{"#" + props.data.color.name.substring(2,8)}</Badge>} />
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
            title="Opravdu smazat cílovou skupinu?"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{
                        setIsDeleting(true);
                        axios.delete(process.env.REACT_APP_API_URL + "/targets/" + props.data.id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                        .then(response => {
                            dispatch({type: ADD_MESSAGE, text: "Cíl byl smazán.", variant: "success", dismissible: true, expiration: 3});
                            history.push("/admin/targets");
                        })
                        .catch(error => {
                            if (error.response)
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání cílové skupiny se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání cílové skupiny se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
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
            <Paragraph>Takto smazaný záznam nebude možné nijak obnovit.</Paragraph>
            <Paragraph>Tato skupina bude odstraněna ze všech námětů, které na ni cílily.</Paragraph>
        </Modal>
            </>
        ); 
};

export default Display;