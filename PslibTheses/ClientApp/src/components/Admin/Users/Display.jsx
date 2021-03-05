import React, {useState, useEffect} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import {Modal, ButtonBlock, CardHeader, CardBody, Subheading, CardTypeValueList, CardTypeValueItem, Button, CardFooter, Paragraph } from "../../general";
import {useHistory} from "react-router-dom";
import {Genders, ADMIN_ROLE} from "../../../configuration/constants";
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
        setIsEditable((profile !== null) && ((profile.sub === props.owner || profile[ADMIN_ROLE] === "1")));
     },[accessToken, profile, props.owner]);
        return (
            <>
            <CardHeader><Subheading>Obecné informace</Subheading></CardHeader>
            <CardBody>
                <CardTypeValueList>
                    <CardTypeValueItem type="ID" value={props.data.id} />
                    <CardTypeValueItem type="Jméno" value={props.data.firstName} />
                    <CardTypeValueItem type="Prostřední jméno" value={props.data.middleName} />
                    <CardTypeValueItem type="Příjmení" value={props.data.lastName} />
                    <CardTypeValueItem type="Pohlaví" value={Genders[props.data.gender]} />
                    <CardTypeValueItem type="Může vypracovávat práci" value={props.data.canBeAuthor ? "ano" : "ne"}/>
                    <CardTypeValueItem type="Může hodnotit práci" value={props.data.canBeEvaluator ? "ano" : "ne"} />
                    <CardTypeValueItem type="Ikona" value={props.data.iconImage ? <img src={"data:" + props.data.iconImageFormat + ";base64," + props.data.iconImage} alt="" /> : "není"} />
                    <CardTypeValueItem type="Email" value={<a href={"mailto:" + props.data.email}>{props.data.email}</a>} />
                    <CardTypeValueItem type="Uzamčená ikona" value={props.data.lockedIcon ? "ano" : "ne"} />
                    <CardTypeValueItem type="Uzamčená data" value={props.data.lockedChange ? "ano" : "ne"} />
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
            title="Opravdu smazat uživatele?"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{
                        setIsDeleting(true);
                        axios.delete(process.env.REACT_APP_API_URL + "/users/" + props.data.id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                        .then(response => {
                            dispatch({type: ADD_MESSAGE, text: "Uživatel byl smazán.", variant: "success", dismissible: true, expiration: 3});
                            history.push("/admin/users");
                        })
                        .catch(error => {
                            if (error.response)
                            {
                                if (error.response.status === 500)
                                {
                                    dispatch({type: ADD_MESSAGE, text: "Server nedokázal smazat záznam uživatele. Důvodem může být chyba serveru nebo ochrana konzistentnosti dat.", variant: "error", dismissible: true, expiration: 3});
                                }
                                else
                                {
                                    dispatch({type: ADD_MESSAGE, text: "Smazání uživatele se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                                }
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání uživatele se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
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
            <Paragraph>Pokud uživatel má nějaké vlastní náměty, je autorem nebo hodnotitelem práce, smazání nebude úspěšné.</Paragraph>
        </Modal>
            </>
        ); 
};

export default Display;