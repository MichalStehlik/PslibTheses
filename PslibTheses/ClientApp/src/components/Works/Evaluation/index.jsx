import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { useAppContext, SET_TITLE } from "../../../providers/ApplicationProvider";
import { ActionLink, Alert, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Loader } from "../../general";
import LoadedUser from "../../common/LoadedUser";
import DateTime from "../../common/DateTime";
import styled from 'styled-components';
import axios from "axios";
import { ADMIN_ROLE, MANAGER_ROLE } from "../../../configuration/constants";
import requireEvaluator from "../../Auth/requireEvaluator";
import Questions from "./Questions";

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
    const isEditable = useMemo(() => {
        return (
            profile && workData && roleData &&
            (workData.state === 1 || workData.state === 3) &&
            (!roleData.finalized) &&
            (profile[ADMIN_ROLE] === "1" || roleData.workRoleUsers.map((item) => (item.userId)).includes(profile.sub)));
    }, [workData, roleData, profile]);
    const isVisible = useMemo(() => {
        return (profile && roleData && (profile[ADMIN_ROLE] === "1" || profile[MANAGER_ROLE] === "1" || roleData.workRoleUsers.map((item) => (item.userId)).includes(profile.sub)));
    }, [roleData, profile]);

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
                {(isWorkLoading || isTermLoading || isRoleLoading) 
                ?
                    <Loader size="2em" />
                :
                    (workError || termError || roleError) 
                        ?
                        <>
                            {workError ? <Alert variant="error" text="Při získávání dat práce došlo k chybě." /> : ""}
                            {termError ? <Alert variant="error" text="Při získávání dat termínu došlo k chybě." /> : ""}
                            {roleError ? <Alert variant="error" text="Při získávání dat role došlo k chybě." /> : ""}
                        </>
                        :
                            (workData && termData && roleData)
                            ?
                            <>
                                <Card>
                                    <CardHeader>
                                        <Heading>Hodnocení práce</Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <CardTypeValueList>
                                            <CardTypeValueItem type="Práce" value={workData.name} />
                                            <CardTypeValueItem type="Autor" value={<LoadedUser id={workData.authorId} />} />
                                            <CardTypeValueItem type="Termín" value={[termData.name, " (", <DateTime key="datedata" date={termData.date} showTime={false} />, ")"]} />
                                            <CardTypeValueItem type="Role" value={[roleData.setRole.name, " (", (roleData.finalized ? "Uzavřené hodnocení" : "Otevřené hodnocení"), ")"]} />
                                        <CardTypeValueItem type="Hodnotitelé" value={roleData.workRoleUsers.map((item, index) => (<LoadedUser key={ index } id={item.userId} />))} />
                                        </CardTypeValueList>
                                    </CardBody>
                                </Card>
                                {roleData.workRoleUsers.map((item) => (item.userId)).includes(profile.sub)
                                    ?
                                    null
                                    :
                                    <Alert variant="warning" text="V této práci a roli nejste hodnotitelem." />
                                }
                                {role.finalized
                                    ?
                                    <Alert variant="warning" text="´Hodnocení v této roli je již uzavřené." />
                                    :
                                    null
                                }
                                {workData.state !== 1 && workData.state !== 3
                                    ?
                                    <Alert variant="warning" text="Práce není v hodnotitelném stavu." />
                                    :
                                    null
                                }
                                {isEditable
                                    ?
                                    <Alert text="Odpověď u každé otázky vyberete kliknutím na ni." variant="info" />
                                    :
                                    null
                                }
                                {isVisible
                                    ?
                                    <Questions work={workData} role={roleData} term={termData} editable={isEditable } />
                                    :
                                    null
                                }
                            </>
                            :
                            <Loader size="2em" />
                }
            </StyledQuestionsLayout>
        </>
    );
}

export default requireEvaluator(Evaluation);