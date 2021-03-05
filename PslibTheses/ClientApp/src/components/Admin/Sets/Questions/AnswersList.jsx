import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import axios from "axios";
import { Loader, Alert } from "../../../general";
import {useAppContext} from "../../../../providers/ApplicationProvider";
import CreateAnswer from "./CreateAnswer";
import Answer from "./Answer";

const StyledAnswersList = styled.div`
cursor: ${props => props.globalEditing === false ? "move" : "default"};
`;

const StyledEmptyParagraph = styled.p`
padding: 10px;
text-align: center;
`;

export const AnswersList = ({questionId, setId, setGlobalEditing, globalEditing}) => {
    const [{accessToken}, dispatch] = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState(null);
    const fetchAnswersData = useCallback(id => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + setId + "/questions/" + questionId + "/answers", {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
            setData(response.data);
        })
        .catch(err => {
            if (err.response)
            {
                setError({text:  err.response.statusText, status: err.response.status});
            }
            else
            {
                setError({text:  "Neznámá chyba", status: ""});
            }
            setData(null);
        })
        .then(()=>{
            setIsLoading(false);
        });  
    },[accessToken]);
    useEffect(()=>{ 
        fetchAnswersData();
      },[]);
      if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámá otázka"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }        
    } else if (data) {
    return (
        <StyledAnswersList>
        {data.length > 0 
        ?
        data.map((item, index) => (<Answer key={index} item={item} globalEditing={globalEditing} fetchData={fetchAnswersData} setId={setId} setGlobalEditing={setGlobalEditing} />))
        :
        <StyledEmptyParagraph>Zde nejsou žádné odpovědi.</StyledEmptyParagraph>
        }
        <CreateAnswer questionId={questionId} setId={setId} setGlobalEditing={setGlobalEditing} fetchData={fetchAnswersData} />
        </StyledAnswersList>
    )
    } else {
        return <Loader size="2em" />;
    };
}

export default AnswersList;