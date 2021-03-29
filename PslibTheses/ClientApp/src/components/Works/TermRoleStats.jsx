import React, { useState, useEffect } from 'react';
import { useAppContext } from "../../providers/ApplicationProvider";
import { Loader, Alert } from "../general";
import axios from "axios";
import styled from 'styled-components';

const StyledTermRoleStatsContainer = styled.div`
    display: flex;
    flex-direction: column;
`;
const StyledTermRoleStatsQuestionsContainer = styled.div`
font-size: 12pt;
`;
const StyledTermRoleStatsPointsContainer = styled.div`
font-size: 8pt;
`;

const TermRoleStats = ({ termId, roleId, workId }) => {
    const [{ accessToken }] = useAppContext();
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + workId + "/stats/" + roleId + "/" + termId, {
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
                    setError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setError({ status: 0, text: "Neznámá chyba" });
                }
                setResponse([]);
            });
        setIsLoading(false);
    }, [accessToken, workId, roleId, termId]);
    if (isLoading) {
        return <Loader />;
    } else if (error !== false) {
        return <Alert text={"Chyba při získávání statistiky"} variant="error" />;
    } else if (response) {
        return (
            <StyledTermRoleStatsContainer>
                <StyledTermRoleStatsQuestionsContainer>
                    <small>Otázky:</small> {response.filledQuestions !== null ? (Number(response.filledQuestions) + "/") : ""}{Number(response.totalQuestions)}
                </StyledTermRoleStatsQuestionsContainer>
                <StyledTermRoleStatsPointsContainer>
                {response.totalPoints !== null
                ?
                "Body: " + Number(response.gainedPoints) + "/" + Number(response.totalPoints)
                :    
                ""
                }
                </StyledTermRoleStatsPointsContainer>
            </StyledTermRoleStatsContainer>
        );
    } else {
        return <Loader />;
    }
}

export default TermRoleStats;