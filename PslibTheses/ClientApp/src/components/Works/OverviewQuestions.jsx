import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from "../../providers/ApplicationProvider";
import { Loader, Alert } from "../general";
import axios from "axios";
import styled from 'styled-components';

const QuestionWrapper = styled.dl`
    display: flex;
    flex-direction: column;
    margin: 0;
`;

const QuestionText = styled.dt`
margin: .1em;
font-weight: bold;
`;

const Answer = styled.dd`
margin: .1em;
font-style: ${props => props.notSet ? "italic" : "normal"};
color: ${props => props.critical ? props.theme.colors.errorBackground : "inherit"};
`;

const OverviewQuestion = ({ role, term, work, question }) => {
    const [{ accessToken }] = useAppContext();
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const fetchEvaluation = useCallback((workId, qId) => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + workId + "/questions/" + qId + "/evaluation", {
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
                    if (error.response.status !== 404) {
                        setError({ status: error.response.status, text: error.response.statusText });
                    } 
                }
                else {
                    setError({ status: 0, text: "Neznámá chyba" });
                }
                setResponse(null);
            })
            .then(() => {
                setIsLoading(false);
            });
    }, [accessToken]);
    useEffect(() => { fetchEvaluation(work.id, question.id) }, [fetchEvaluation, work, question]);

    if (isLoading)
        return <Loader size="2em" />
    else if (error)
        return <Alert variant="error" text="Chyba při získávání seznamu otázek." />
    else if (response) {
        return (
            <QuestionWrapper>
                <QuestionText>{question.text}</QuestionText>
                <Answer critical={response.setAnswer.critical}>{response.setAnswer.text}</Answer>
            </QuestionWrapper>
        );
    }
    else
        return (
            <QuestionWrapper>
                <QuestionText>{question.text}</QuestionText>
                <Answer notSet={ true} >Nezodpovězeno</Answer>
            </QuestionWrapper>
            );
}

const OverviewQuestions = ({ work, term, role }) => {
    const [{ accessToken }] = useAppContext();
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work.id + "/questions/" + role.setRole.id + "/" + term.id, { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
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
            })
            .then(() => {
                setIsLoading(false);
            })
    }, [accessToken, work, term, role]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    if (isLoading)
        return <Loader size="2em" />
    else if (error)
        return <Alert variant="error" text="Chyba při získávání seznamu otázek." />
    else if (response && Array.isArray(response)) {
        return (response.map((item, index) => (
            <OverviewQuestion key={index} role={role} term={term} work={work} question={item} />
        )));
    }
    else
        return <Loader size="2em" />
}

export default OverviewQuestions;