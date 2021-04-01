import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext, ADD_MESSAGE } from "../../../providers/ApplicationProvider";
import { Loader, Alert, CardBody, CardFooter, DeleteMiniButton } from "../../general";
import DateTime from "../../common/DateTime";
import LoadedUser from "../../common/LoadedUser";
import axios from "axios";
import styled from 'styled-components';
import { Card } from '../../general';
import { ReactComponent as CheckmarkIcon } from "../../../assets/icons/check.svg";
import { ReactComponent as CriticalIcon } from "../../../assets/icons/warning_triangle.svg";

const StyledAnswer = styled.div`
    display: grid;
    grid-template-columns: 40px 1fr 40px;
    grid-template-rows: auto auto;
    grid-template-areas: 
        "check text critical"
        "check description critical";
    border: 1px solid #cccccc;
    position: relative;
    overflow: hidden;
    & p {margin: 0;}
    &:hover {border-color: black};
`;

const StyledAnswerCheck = styled(CheckmarkIcon)`
    grid-area: check;
    fill:  red;
    stroke: ${props => props.theme.colors.successBackground};
    width: 18px;
    height: 18px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const StyledAnswerText = styled.div`
    grid-area: text;
    margin: .5em;
`;

const StyledAnswerDescription = styled.div`
    color: #aaa;
    grid-area: description;
    margin: .5em;
`;

const StyledAnswerCritical = styled(CriticalIcon)`
    grid-area: critical;
    fill:  red;
    stroke: ${props => props.theme.colors.errorBackground};
    width: 32px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const StyledQuestionText = styled.p`
    margin: 0;
`;

const StyledQuestionDescription = styled.div`
    color: #aaa;
    font-size: 8pt;
`;

const StyledQuestionFooter = styled(CardFooter)`
    display: flex;
    flex-direction: row;
    justify-content: space-between; 
    align-items: center;
`;

const StyledQuestionFooterAction = styled.span`

`;
const StyledQuestionFooterUser = styled.span`

`;
const StyledQuestionFooterDate = styled.span`

`;

const Answer = ({ answer, selected, editable, submitAction, work, question }) => {
    return (
        <StyledAnswer onClick={e => {
            if (editable) {
                submitAction(work.id, question.id, answer.id);
            }
        }}>
            {selected ? <StyledAnswerCheck /> : null}
            <StyledAnswerText>{answer.text}</StyledAnswerText>
            {answer.description ? <StyledAnswerDescription dangerouslySetInnerHTML={{ __html: answer.description }} /> : null}
            {answer.critical ? <StyledAnswerCritical /> :""}
        </StyledAnswer>
    )
}

const Question = ({ work, questionId, editable }) => {
    const [{ accessToken }, dispatch] = useAppContext();
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [answersResponse, setAnswersResponse] = useState([]);
    const [isAnswersLoading, setIsAnswersLoading] = useState(false);
    const [answersError, setAnswersError] = useState(false);
    const [evaluationResponse, setEvaluationResponse] = useState(null);
    const [isEvaluationLoading, setIsEvaluationLoading] = useState(false);
    const [evaluationError, setEvaluationError] = useState(false);
    const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work.id + "/questions/" + questionId, {
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
            setResponse(null);
        })
        .then(() => {
            setIsLoading(false);
        }); 
        setIsAnswersLoading(true);
        setAnswersError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work.id + "/questions/" + questionId + "/answers", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setAnswersResponse(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setAnswersError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setAnswersError({ status: 0, text: "Neznámá chyba" });
                }
                setAnswersResponse([]);
            })
            .then(() => {
                setIsAnswersLoading(false);
            }); 
    }, [accessToken, questionId, work]);
    const fetchEvaluation = useCallback((workId, qId) =>
    {
        setIsEvaluationLoading(true);
        setEvaluationError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + workId + "/questions/" + qId + "/evaluation", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setEvaluationResponse(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setEvaluationError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setEvaluationError({ status: 0, text: "Neznámá chyba" });
                }
                setEvaluationResponse(null);
            })
            .then(() => {
                setIsEvaluationLoading(false);
            }); 
    }, [accessToken]);
    const submitAnswer = useCallback((workId, qId, aId) => {
        setIsAnswerSubmitting(true);
        axios.post(process.env.REACT_APP_API_URL + "/works/" + workId + "/questions/" + qId + "/evaluation", {
            WorkId: workId,
            QuestionId: qId,
            AnswerId: aId
        }, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({ type: ADD_MESSAGE, text: "Odpověď byla uložena.", variant: "success", dismissible: true, expiration: 3 });
            fetchEvaluation(workId,qId);
        })
        .catch(error => {
            dispatch({ type: ADD_MESSAGE, text: "Uložení odpovědi se nepodařilo.", variant: "error", dismissible: true, expiration: 3 });
        })
        .then(() => {
            setIsAnswerSubmitting(false);
        })
    }, [accessToken, dispatch, fetchEvaluation]);
    const deleteAnswer = useCallback((workId, qId) => {
        setIsAnswerSubmitting(true);
        axios.delete(process.env.REACT_APP_API_URL + "/works/" + workId + "/questions/" + qId + "/evaluation",
            {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                dispatch({ type: ADD_MESSAGE, text: "Odpověď byla smazána.", variant: "success", dismissible: true, expiration: 3 });
                fetchEvaluation(workId, qId);
            })
            .catch(error => {
                dispatch({ type: ADD_MESSAGE, text: "Smazání odpovědi se nepodařilo.", variant: "error", dismissible: true, expiration: 3 });
            })
            .then(() => {
                setIsAnswerSubmitting(false);
            })
    }, [accessToken, dispatch, fetchEvaluation]);
    useEffect(() => { fetchEvaluation(work.id, questionId) }, [fetchEvaluation, work, questionId]);
    if (isLoading || isAnswersLoading) {
        return <Loader size="2em" />;
    } else if (error !== false || answersError) {
        return <Alert text={"Chyba při získávání otázky"} variant="error" />;
    } else if (response && answersResponse) {
        return (
            <Card>
                <CardBody>
                    <StyledQuestionText>{response.text}</StyledQuestionText>
                    {response.description !== null ? <StyledQuestionDescription dangerouslySetInnerHTML={{ __html: response.description }} /> : null}
                </CardBody>
                <CardBody>
                    {isEvaluationLoading ?
                        <Loader size="2em" />
                        :
                        evaluationError ?
                            <Alert text="Chyba při získávání odpovědi na otázku." variant="error" />
                            :
                            answersResponse.map((item, index) =>
                            (
                                <Answer key={index} answer={item} work={work} question={response} selected={evaluationResponse && (item.id === Number(evaluationResponse.setAnswerId))} editable={editable} submitAction={submitAnswer}/>
                            ))
                    }
                </CardBody>
                <StyledQuestionFooter>
                    {evaluationResponse
                        ?
                        <>
                            <StyledQuestionFooterDate>
                                <DateTime date={evaluationResponse.created} />
                            </StyledQuestionFooterDate>
                            <StyledQuestionFooterUser>
                                <LoadedUser id={evaluationResponse.createdById} />
                            </StyledQuestionFooterUser>
                            <StyledQuestionFooterAction>
                                {isAnswerSubmitting
                                    ?
                                    <Loader />
                                    :
                                    <DeleteMiniButton onClick={e => {
                                        if (editable) {
                                            deleteAnswer(work.id, questionId);
                                        }
                                    }} />
                                }
                            </StyledQuestionFooterAction>
                        </>
                        :
                        <p>Zatím nezodpovězeno.</p>
                    }
                </StyledQuestionFooter>
            </Card>
        );
    } else {
        return <Loader size="2em" />;
    }
}

export default Question;