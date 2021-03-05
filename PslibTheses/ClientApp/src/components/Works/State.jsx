import React, {useState, useEffect, useCallback} from 'react';
import {Button, CardBody, Paragraph, ButtonBlock, Loader, Alert } from "../general";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import axios from "axios";
import {WorkStates, ADMIN_ROLE, MANAGER_ROLE} from "../../configuration/constants";

const State = ({id, isEditable, fetchData, data}) => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const fetchNextStates = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id + "/nextstates",{
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
    useEffect(()=>{
        fetchNextStates();
    },[]);
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
        <CardBody>
            <Paragraph>Stav práce je: <b>{WorkStates[data.state]}</b>.</Paragraph>
            {profile[ADMIN_ROLE] === "1" /*|| (profile.sub === data.managerId)*/ || (profile[MANAGER_ROLE] === "1")
            ?
            Array.isArray(response) && response.length === 0
                ?
                <Paragraph>Stav práce již nelze změnit.</Paragraph>
                :
                <>
                <Paragraph>Další možné stavy jsou:</Paragraph>
                <ButtonBlock>
                {response.map((item, index) => (
                <Button key={index} onClick={e => {
                    axios.put(process.env.REACT_APP_API_URL + "/works/" + id + "/state/" + item.code, {
                        newState: item.description
                    }, {
                        headers: {
                            Authorization: "Bearer " + accessToken,
                            "Content-Type": "application/json"
                        }
                    })
                    .then(response => {
                        dispatch({type: ADD_MESSAGE, text: "Stav práce byl změněn.", variant: "success", dismissible: true, expiration: 3});
                    })
                    .catch(error => {
                        if (error.response)
                        {
                            dispatch({type: ADD_MESSAGE, text: "Stav práce se nepodařilo změnit. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                        }
                        else
                        {
                            dispatch({type: ADD_MESSAGE, text: "Stav práce se nepodařilo změnit.", variant: "error", dismissible: true, expiration: 3});
                        }
                    })
                    .then(()=>{fetchData();})                 
                }}>{WorkStates[item.code]}</Button>
                ))}
                </ButtonBlock>
                </> 
            :
            ""
            }    
        </CardBody>
    );
    } else {
        return <Loader size="2em" />;
    }; 
}

export default State;