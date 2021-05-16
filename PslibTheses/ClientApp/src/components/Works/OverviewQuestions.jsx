import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from "../../providers/ApplicationProvider";
import { Loader, Alert, CardTypeValueList, CardTypeValueItem } from "../general";
import axios from "axios";
import styled from 'styled-components';

const QuestionWrapper = styled.dl`
    display: flex;
    flex-direction: column;
    margin: 0;
`;

const QuestionsWrapper = styled.dl`
    display: block;
    padding: 5px;
    border: 1px solid #cccccc;
`;

const QuestionText = styled.dt`
margin: .1em;
font-weight: bold;
`;

const Answer = styled.dd`
margin: .1em;
font-style: ${props => props.notSet ? "italic" : "normal"};
color: ${props => props.critical ? props.theme.colors.errorBackground : props.termCritical ? props.theme.colors.warningBackground : "inherit"};
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
                <Answer critical={response.setAnswer.critical} termCritical={response.setAnswer.criticalInTerm}>{response.setAnswer.text}</Answer>
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
    const [responseSummary, setResponseSummary] = useState(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [errorSummary, setErrorSummary] = useState(false);
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
    const fetchSummary = useCallback((wid,rid,tid) => {
        setIsLoadingSummary(true);
        setErrorSummary(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + wid + "/statsForRoleTerm/" + rid + "/" + tid, { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
            .then(response => {
                setResponseSummary(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setErrorSummary({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setErrorSummary({ status: 0, text: "Neznámá chyba" });
                }
                setResponseSummary([]);
            })
            .then(() => {
                setIsLoadingSummary(false);
            })
    }, [accessToken]);
    useEffect(() => {
        fetchData();
        fetchSummary(work.id, role.setRole.id, term.id);
    }, [fetchData, fetchSummary, work, role, term]);
    if (isLoading || isLoadingSummary)
        return <Loader size="2em" />
    else if (error || errorSummary)
        return <Alert variant="error" text="Chyba při získávání seznamu otázek." />
    else if (response && responseSummary && Array.isArray(response)) {
        if (response.length > 0) {
            return (
                <>
                    <QuestionsWrapper>
                        {response.map((item, index) => (
                            <OverviewQuestion key={index} role={role} term={term} work={work} question={item} />
                        ))}
                    </QuestionsWrapper>
                    <CardTypeValueList>
                        <CardTypeValueItem type="Otázky (kritické v termínu / zodpovězené / celkem)" value={responseSummary.criticalInTerm + "/" + responseSummary.filledQuestions + "/" + responseSummary.totalQuestions} />
                        <CardTypeValueItem type="Body (získané / z zodpovězených / ze všech)" value={responseSummary.gainedPoints + "/" + responseSummary.filledPoints + "/" + responseSummary.totalPoints} />
                        <CardTypeValueItem type="Procenta" value={responseSummary.filledPoints > 0 ? Math.round(responseSummary.gainedPoints / responseSummary.filledPoints * 100) + "%" : "0%"} />
                        <CardTypeValueItem type="Vypočítaná známka" value={responseSummary.calculatedMark} />
                    </CardTypeValueList>
                </>
                );
        }
        else {
            return (<i>Žádné otázky</i>);
        }
    }
    else
        return <Loader size="2em" />
}

export default OverviewQuestions;