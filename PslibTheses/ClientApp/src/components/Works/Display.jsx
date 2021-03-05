import React, {useState, useEffect, useCallback} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Modal, CardHeader, CardBody, Subheading, CardTypeValueList, CardTypeValueItem, Button, CardFooter, Paragraph, ButtonBlock } from "../general";
import {DateTime, LoadedUser} from "../common";
import {useHistory} from "react-router-dom";
import {Link} from "react-router-dom";
import {ADMIN_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";
import {WorkStates} from "../../configuration/constants";
import axios from "axios";

const Display = props => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [setResponse, setSetResponse] = useState(null);
    const fetchSetData = useCallback(() => {
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + props.data.setId,{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setSetResponse(response.data);
        })
    },[props.data]);
    let history = useHistory();
    useEffect(() => {
        setShowDelete(false);
        setIsDeleting(false);
        fetchSetData();
        return () => {setShowDelete(false); setIsDeleting(false);};
    },[]);
    return (
        <>
        <CardHeader><Subheading>Obecné informace</Subheading></CardHeader>
        <CardBody>
            <CardTypeValueList>
                <CardTypeValueItem type="Název" value={props.data.name} />
                <CardTypeValueItem type="Předmět" value={props.data.subject} />
                <CardTypeValueItem type="Popis" value={<span dangerouslySetInnerHTML={{__html: props.data.description }} />} />
                <CardTypeValueItem type="Prostředky" value={props.data.resources} />
                <CardTypeValueItem type="Třída" value={props.data.className} />
                <CardTypeValueItem type="Odkaz na repozitář" value={props.data.repositoryURL ? <a href={props.data.repositoryURL}>{props.data.repositoryURL}</a> : ""} />
                <CardTypeValueItem type="Autor" value={<LoadedUser id={props.data.authorId} />} />
                <CardTypeValueItem type="Odpovědný vedoucí práce" value={<LoadedUser id={props.data.managerId} />} />
                <CardTypeValueItem type="Stav" value={WorkStates[props.data.state]} />
                <CardTypeValueItem type="Sada" value={setResponse ? <Link to={"/admin/sets/" + setResponse.id}>{setResponse.name}</Link> : ""} />
                <CardTypeValueItem type="Rok" value={setResponse ? setResponse.year : ""} />
                <CardTypeValueItem type="Vytvořil" value={<LoadedUser id={props.data.userId} />} />
                <CardTypeValueItem type="Vytvořeno" value={<DateTime date={props.data.created} />} />
                <CardTypeValueItem type="Aktualizováno" value={<DateTime date={props.data.updated} />} />
            </CardTypeValueList>
        </CardBody>
        {props.isEditable ? 
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
        title="Opravdu smazat práci?"
        actions={
            <>
                <Button outline variant="light" onClick={async ()=>{
                    setIsDeleting(true);
                    axios.delete(process.env.REACT_APP_API_URL + "/works/" + props.data.id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                    .then(response => {
                        dispatch({type: ADD_MESSAGE, text: "Práce byla smazána.", variant: "success", dismissible: true, expiration: 3});
                        history.push("/works");
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            dispatch({type: ADD_MESSAGE, text: "Smazání práce se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                        }
                        else
                        {
                            dispatch({type: ADD_MESSAGE, text: "Smazání práce se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                        }
                        props.fetchData();
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
        <Paragraph>Takto smazanou práci nebude možné nijak obnovit.</Paragraph>
    </Modal>
        </>
    );
};

export default Display;