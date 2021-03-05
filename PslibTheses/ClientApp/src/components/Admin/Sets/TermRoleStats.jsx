import React, {useState, useEffect} from 'react';
import {useHistory} from "react-router-dom";
import {useAppContext} from "../../../providers/ApplicationProvider";
import styled from 'styled-components';
import axios from "axios";
import {Loader} from "../../general";

const StyledStats = styled.div`
    cursor: pointer;
`;

export const TermRoleStats = ({set, term, role}) => {
    const [{accessToken}] = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    let history = useHistory();
    useEffect(()=> {
        setIsLoading(true);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + set + "/summary/" + term + "/" + role,{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setError(false);
            setData(response.data);
        })
        .catch(error => {
            if (error.response) {
                setError({status: error.response.status, text: error.response.statusText});
            }
            else
            {
                setError({status: 0, text: "Neznámá chyba"});
            }         
            setData([]);
        })
        .then(()=>{
            setIsLoading(false);
        });  
    },[])
    if (set && term && role)
    {
        if (isLoading) {
            return <Loader size="2em"/>;
        } else if (error !== false) {
            return "Chyba";
        } else if (data) {
            return (
                <StyledStats onClick={e => {history.push("/admin/sets/" + set + "/questions/term/" + term + "/role/" + role)}} >
                    Otázky: <b>{data.questions}</b>
                    <br />
                    Body: <b>{data.points}</b>
                </StyledStats>
            );
        } else {
            return <Loader size="2em"/>;
        }
    }
    else
    {
        return "Chybné parametry";
    }
}

export default TermRoleStats;