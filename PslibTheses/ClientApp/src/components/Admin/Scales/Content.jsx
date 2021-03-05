import React, {useState, useEffect, useCallback} from 'react';
import { Alert, Loader } from "../../general";
import {useAppContext, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import ContentTable from "./ContentTable";
import CreateContent from "./CreateContent";
import axios from "axios";

export const CONTENT_DISPLAY = 0;
export const CONTENT_ADD_VALUE = 1;

export const Content = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [contentMode, setContentMode] = useState(CONTENT_DISPLAY);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/scales/" + props.id + "/values",{
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
    },[accessToken, props.id]);
    const removeData = useCallback(rate => {
        axios.delete(process.env.REACT_APP_API_URL + "/scales/" + props.id + "/values/" + rate,{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Položka škály byla odstraněna.", variant: "success", dismissible: true, expiration: 3});
            fetchData();
        })
        .catch(error => {
            if (error.response)
            {
                dispatch({type: ADD_MESSAGE, text: "Odstranění položky škály se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
            }
            else
            {
                dispatch({type: ADD_MESSAGE, text: "Odstranění položky škály se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
            }
        });
    },[accessToken, props.id]);
    useEffect(()=>{
        fetchData();
    },[]);  
    if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámá škála"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }
    } else if (response) {
        switch (contentMode)
        {
            case (CONTENT_ADD_VALUE) :  return <CreateContent id={props.id} setMode={() => {setContentMode(CONTENT_DISPLAY)}} fetchData={() => fetchData()} />;
            default : return <ContentTable data={response} setMode={() => {setContentMode(CONTENT_ADD_VALUE)}} fetchData={() => fetchData()} removeData={rate => removeData(rate)} />;
        }
    } else {
        return <Loader size="2em" />;
    };
};

export default Content;