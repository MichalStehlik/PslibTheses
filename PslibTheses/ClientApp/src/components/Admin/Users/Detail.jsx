import React, {useState, useEffect, useCallback} from 'react';
import { useParams } from "react-router-dom";
import { CardContainer, Card, ActionLink, Alert, Loader, PageTitle } from "../../general";
import {useAppContext, SET_TITLE} from "../../../providers/ApplicationProvider";
import axios from "axios";
import Edit from "./Edit";
import Display from "./Display";

export const Detail = props => {
    const { id } = useParams();
    const [{accessToken}, dispatch] = useAppContext();
    const [editing, setEditing] = useState(false);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/users/" + id,{
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
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Detail uživatele"}); },[dispatch]);
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
            <ActionLink to="..">Administrace</ActionLink>
            <ActionLink to=".">Seznam</ActionLink>
            <PageTitle>{response.name}</PageTitle> 
            <CardContainer>
                <Card>
                {editing ? <Edit data={response} id={id} switchEditMode={setEditing} fetchData={fetchData} /> : <Display data={response} id={id} switchEditMode={setEditing} />}
                </Card>
            </CardContainer>
            </>
        );
        
    } else {
        return <Loader size="2em" />;
    };
};

export default Detail;