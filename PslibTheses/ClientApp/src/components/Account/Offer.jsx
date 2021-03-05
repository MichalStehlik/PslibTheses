import React, {useState, useEffect, useCallback} from 'react';
import {useAppContext, ADD_MESSAGE, SET_TITLE} from "../../providers/ApplicationProvider";
import requireAuth from "../Auth/requireAuth";
import {Link} from "react-router-dom";
import {Heading, Loader, Alert, Table, TableHeader, TableRow, DataCell, HeadCell, TableBody, RemoveMiniButton, Button, Modal, Paragraph, PageTitle} from "../general";
import axios from "axios";

const Offer = props => {
const [{accessToken, profile}, dispatch] = useAppContext();
const [response, setResponse] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [showClear, setShowClear] = useState(false);
const [error, setError] = useState(false);
const fetchData = useCallback(() => {
    setIsLoading(true);
    setError(false);
    axios.get(process.env.REACT_APP_API_URL + "/users/" + profile.sub + "/offers",{
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
    },[accessToken, profile]);
    const removeOffer = useCallback((id) => {
        axios.delete(process.env.REACT_APP_API_URL + "/users/" + profile.sub + "/offers/" + id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Námět byl z nabídky odstraněn.", variant: "success", dismissible: true, expiration: 3});
            fetchData();
        })
        .catch(error => {
            if (error.response)
            {
                dispatch({type: ADD_MESSAGE, text: "Odstranění námětu se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
            }
            else
            {
                dispatch({type: ADD_MESSAGE, text: "Odstranění námětu se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
            }
        })
        .then(()=>{
            setIsDeleting(false);
        });
    },[accessToken,profile]);
    const clearOffer = useCallback(() => {
        axios.delete(process.env.REACT_APP_API_URL + "/users/" + profile.sub + "/offers", {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Seznam nabídek byl vymazán.", variant: "success", dismissible: true, expiration: 3});
            fetchData();
        })
        .catch(error => {
            if (error.response)
            {
                dispatch({type: ADD_MESSAGE, text: "Vymazání seznamu se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
            }
            else
            {
                dispatch({type: ADD_MESSAGE, text: "Vymazaní seznamu se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
            }
        })
        .then(()=>{
            setIsDeleting(false);
        });
    },[accessToken,profile]);
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Mnou nabízené náměty"});},[dispatch]);
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
                <PageTitle>Seznam mnou nabízených námětů</PageTitle>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <HeadCell>Název</HeadCell>
                            <HeadCell>Akce</HeadCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.isArray(response) && response.length > 0 
                        ?
                        response.map((item, index) => (
                            <TableRow key={index}>
                                <DataCell><Link to={"/ideas/" + item.id}>{item.name}</Link></DataCell>
                                <DataCell><RemoveMiniButton onClick={e => removeOffer(item.id)} /></DataCell>
                            </TableRow>
                        ))
                        :
                        <TableRow><DataCell colSpan="1000">Nyní žádné náměty nenabízíte</DataCell></TableRow>
                        }
                    </TableBody>
                </Table>
                <Modal 
                active={showClear} 
                variant="warning"
                onDismiss={()=>setShowClear(false)} 
                title="Opravdu vymazat seznam?"
                actions={
                    <>
                        <Button onClick={async ()=>{ clearOffer(); setShowClear(false); }}>Vymazat</Button>
                        <Button onClick={async ()=>{ setShowClear(false); }}>Storno</Button>
                    </>
                } 
                >
                    <Paragraph>Pokud budete chtít nějaké náměty nabízet k vypracování, budete muset seznam znovu vytvořit.</Paragraph>
                </Modal>
                <div>
                    {Array.isArray(response) && response.length > 0 
                    ?
                    <Button onClick={()=>{setShowClear(true)}} disabled={isDeleting}>{!isDeleting ? "Vymazat celý seznam" : "Pracuji"}</Button>
                    :
                    ""
                    }
                </div>
            </>
        )
    } else {
        return <Loader size="2em" />;
    };
};

export default requireAuth(Offer);