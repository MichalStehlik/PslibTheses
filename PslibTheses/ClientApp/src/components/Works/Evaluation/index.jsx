import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useAppContext, SET_TITLE } from "../../../providers/ApplicationProvider";
import { ActionLink, Alert, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Loader } from "../../general";
import LoadedUser from "../../common/LoadedUser";
import DateTime from "../../common/DateTime";
import styled from 'styled-components';
import axios from "axios";
import requireEvaluator from "../../Auth/requireEvaluator";

const StyledQuestionsLayout = styled.span`
    display: flex;
    flex-direction: column;
    max-width: 70em;
`;

const Evaluation = props => {
    const { id } = useParams();
    const { term } = useParams();
    const { role } = useParams();
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [isWorkLoading, setIsWorkLoading] = useState(false);
    const [workError, setWorkError] = useState(false);
    const [workData, setWorkData] = useState(null);
    const [roleData, setRoleData] = useState(null);
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const [termData, setTermData] = useState(null);
    const [isTermLoading, setIsTermLoading] = useState(false);
    const [termError, setTermError] = useState(false);

    const fetchWorkData = useCallback(id => {
        setIsWorkLoading(true);
        setWorkError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id, { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
            .then(response => {
                setWorkData(response.data);
            })
            .catch(err => {
                if (err.response) {
                    setWorkError({ text: err.response.statusText, status: err.response.status });
                }
                else {
                    setWorkError({ text: "Neznámá chyba", status: "" });
                }
                setWorkData(null);
            })
            .then(() => {
                setIsWorkLoading(false);
            });
    }, [accessToken]);
    const fetchTermData = useCallback(termId => {
        setIsTermLoading(true);
        setTermError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + workData.setId + "/terms/" + termId, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setTermData(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setTermError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setTermError({ status: 0, text: "Neznámá chyba" });
                }
                setTermData([]);
            });
        setIsTermLoading(false);
    }, [accessToken, workData]);
    const fetchRoleData = useCallback(roleId => {
        setIsRoleLoading(true);
        setRoleError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id + "/roles/" + roleId, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setRoleData(response.data);
                console.log(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setRoleError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setRoleError({ status: 0, text: "Neznámá chyba" });
                }
                setRoleData([]);
            });
        setIsRoleLoading(false);
    }, [accessToken, id]);

    useEffect(() => {
        fetchWorkData(id);
        dispatch({ type: SET_TITLE, payload: "Otázky pro hodnocení práce" });
    }, [id, term, role, dispatch, fetchWorkData]);
    useEffect(() => {
        if (workData) {
            fetchTermData(term);
            fetchRoleData(role);
        }
    }, [term, role, workData, fetchTermData, fetchRoleData]);

    return (
        <>
            <ActionLink to={"/works/" + id}>Tato práce</ActionLink>
            <StyledQuestionsLayout>
                {(workData && termData && roleData) ?
                    <>
                        <Card>
                            <CardHeader>
                                <Heading>Práce, termín a role</Heading>
                            </CardHeader>
                            <CardBody>
                                <CardTypeValueList>
                                    <CardTypeValueItem type="Práce" value={workData.name} />
                                    <CardTypeValueItem type="Autor" value={<LoadedUser id={workData.authorId} />} />
                                    <CardTypeValueItem type="Termín" value={[termData.name," (",<DateTime date={termData.date} showTime={false} />,")"]} />
                                    <CardTypeValueItem type="Role" value={[roleData.setRole.name," (",(roleData.finalized ? "Uzavřené hodnocení" : "Otevřené hodnocení"),")"]} />
                                </CardTypeValueList>
                            </CardBody>
                        </Card>
                    </>
                    :
                    (workError || termError || roleError) ?
                        <>
                            {workError ? <Alert variant="error" text="Při získávání dat sady došlo k chybě." /> : ""}
                            {termError ? <Alert variant="error" text="Při získávání dat termínu došlo k chybě." /> : ""}
                            {roleError ? <Alert variant="error" text="Při získávání dat role došlo k chybě." /> : ""}
                        </>
                        :
                        <Loader size="2em" />
                }
            </StyledQuestionsLayout>
        </>
    );
}

export default requireEvaluator(Evaluation);