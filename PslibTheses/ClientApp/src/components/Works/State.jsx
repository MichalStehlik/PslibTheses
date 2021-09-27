import React, {useState, useEffect, useCallback} from 'react';
import {Button, CardBody, Paragraph, ButtonBlock, Loader, Alert } from "../general";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import axios from "axios";
import { WorkStates, ADMIN_ROLE, MANAGER_ROLE, EVALUATOR_ROLE } from "../../configuration/constants";

const State = ({id, fetchData, data}) => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [response, setResponse] = useState(null);
    const [responseAll, setResponseAll] = useState(null);
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
    }, [accessToken, id]);
    const fetchAllStates = useCallback(() => {
        axios.get(process.env.REACT_APP_API_URL + "/works/allstates", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setResponseAll(response.data);
            })
            .catch(error => {
                setResponseAll([]);
            });
    }, [accessToken]);
    useEffect(()=>{
        fetchNextStates();
        fetchAllStates();
    },[fetchNextStates, fetchAllStates]);
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
            {profile[ADMIN_ROLE] === "1" || profile[EVALUATOR_ROLE] === "1" || (profile[MANAGER_ROLE] === "1")
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
            {(profile[ADMIN_ROLE] === "1" || profile[MANAGER_ROLE] === "1") && Array.isArray(responseAll)
                ?
                <>
                    <Paragraph>Administrátor může změnit stav také na:</Paragraph>
                    <ButtonBlock>
                        {responseAll.map((item, index) => (
                            <Button variant="warning" key={index} onClick={e => {
                                axios.put(process.env.REACT_APP_API_URL + "/works/" + id + "/state/" + item.code, {
                                    newState: item.description
                                }, {
                                    headers: {
                                        Authorization: "Bearer " + accessToken,
                                        "Content-Type": "application/json"
                                    }
                                })
                                    .then(response => {
                                        dispatch({ type: ADD_MESSAGE, text: "Stav práce byl změněn.", variant: "success", dismissible: true, expiration: 3 });
                                    })
                                    .catch(error => {
                                        if (error.response) {
                                            dispatch({ type: ADD_MESSAGE, text: "Stav práce se nepodařilo změnit. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                                        }
                                        else {
                                            dispatch({ type: ADD_MESSAGE, text: "Stav práce se nepodařilo změnit.", variant: "error", dismissible: true, expiration: 3 });
                                        }
                                    })
                                    .then(() => { fetchData(); })
                            }}>{WorkStates[item.code]}</Button>
                        ))}
                    </ButtonBlock>
                </>
                :
                null
            }
        </CardBody>
    );
    } else {
        return <Loader size="2em" />;
    }; 
}

export default State;