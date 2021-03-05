import React, {useState, useEffect, useCallback} from 'react';
import { useParams } from "react-router-dom";
import { CardContainer, Card, ActionLink, CardHeader, Subheading, Loader, Alert, PageTitle, Modal, Paragraph, Button } from "../general";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import axios from "axios";
import {ADMIN_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";
import Edit from "./Edit";
import Display from "./Display";
import Targets from "./Targets";
import Goals from "./Goals";
import Outlines from "./Outlines";
import Offers from "./Offers";

export const Detail = props => {
    const { id, onBoarding } = useParams();
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [editing, setEditing] = useState(false);
    const [showOnBoarding, setShowOnBoarding] = useState(onBoarding === "1");
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/ideas/" + id,{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setResponse(response.data);
        })
        .catch(error => {
            if (error.response) {
                setError({status: error.response.status, text: error.response.statusText});
            }
            else
            {
                setError({status: 0, text: "Neznámá chyba"});
            }         
            setResponse([]);
        });
        setIsLoading(false);
    },[accessToken, id]);
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Detail námětu"});},[dispatch]);
    useEffect(()=>{fetchData();},[]);
    if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámý námět"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }        
    } else if (response) {
    return (
        <>
        <ActionLink to="/ideas">Seznam</ActionLink>
        <PageTitle>{response.name}</PageTitle>
        <CardContainer>
            <Card>
                {editing ? <Edit data={response} id={id} owner={response ? response.userId :  false} switchEditMode={setEditing} fetchData={fetchData} /> : <Display data={response} owner={response ? response.userId :  false} switchEditMode={setEditing} />}
            </Card>
            {accessToken !== null 
            ?
            <Card>
                <CardHeader><Subheading>Nabídka námětů a vytváření zadání</Subheading></CardHeader>
                <Offers id={id} owner={response ? response.userId :  false} admin={(profile && profile[ADMIN_ROLE] === "1") ? true : false} evaluator={(profile && profile[EVALUATOR_ROLE] === "1") ? true : false} />
            </Card>
            :
            ""
            }         
            <Card>
                <CardHeader><Subheading>Cíle</Subheading></CardHeader>
                <Goals id={id} owner={response ? response.userId :  false} />
            </Card>
            <Card>
                <CardHeader><Subheading>Osnova</Subheading></CardHeader>
                <Outlines id={id} owner={response ? response.userId :  false} />
            </Card>
            <Card>
                <CardHeader><Subheading>Cílové skupiny</Subheading></CardHeader>
                <Targets id={id} owner={response ? response.userId :  false} />
            </Card>      
        </CardContainer>
        <Modal 
            active={showOnBoarding} 
            variant="success"
            onDismiss={()=>setShowOnBoarding(false)} 
            defaultAction={()=>setShowOnBoarding(false)} 
            title="Nový námět"
            actions={
                <>
                    <Button outline variant="light" onClick={async ()=>{ setShowOnBoarding(false); }}>OK</Button>
                </>
            }
        >
            <Paragraph>Nový námět byl vytvořen.</Paragraph>
            <Paragraph>Nyní můžete:</Paragraph>
            <ol>
                <li>Přidat nějaké <b>cíle</b>, jejichž vyhotovéní je možné očekávat.</li>
                <li>Přidat <b>body osnovy</b>, které popíší, co všechno bude nutné udělat pro úspěšné vypracování práce.</li>
                <li>Vybrat <b>cílové skupiny</b> studentů, kteří by toto zadání mohli vypracovat.</li>
                <li>Vyučující mohou tento námět <b>nabídnout studentům</b> k vypracování.</li>
            </ol>
            <Paragraph>Autor nebo administrátoři mohou tento námět také libovolně upravovat a mohou ho také smazat.</Paragraph>
        </Modal>
        </>
    );
    } else {
        return <Loader size="2em" />;
    }; 
};

export default Detail;