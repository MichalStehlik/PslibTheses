import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { useAppContext, SET_TITLE } from "../../providers/ApplicationProvider";
import { ActionLink, Alert, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Subheading, Loader } from "../general";
import LoadedUser from "../common/LoadedUser";
import DateTime from "../common/DateTime";
import styled from 'styled-components';
import axios from "axios";
import requireEvaluator from "../Auth/requireEvaluator";
import OverviewQuestions from "./OverviewQuestions";

const StyledQuestionsLayout = styled.span`
    display: flex;
    flex-direction: column;
    max-width: 70em;
`;

const Overview = props => {
    const { id } = useParams();
    const { role } = useParams();
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [isWorkLoading, setIsWorkLoading] = useState(false);
    const [workError, setWorkError] = useState(false);
    const [workData, setWorkData] = useState(null);
    const [roleData, setRoleData] = useState(null);
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const [termsData, setTermsData] = useState(null);
    const [isTermsLoading, setIsTermsLoading] = useState(false);
    const [termsError, setTermsError] = useState(false);

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

    const fetchTermsData = useCallback(id => {
        setIsTermsLoading(true);
        setTermsError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + workData.setId + "/terms", { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
            .then(response => {
                setTermsData(response.data);
            })
            .catch(err => {
                if (err.response) {
                    setTermsError({ text: err.response.statusText, status: err.response.status });
                }
                else {
                    setTermsError({ text: "Neznámá chyba", status: "" });
                }
                setTermsData(null);
            })
            .then(() => {
                setIsTermsLoading(false);
            });
    }, [accessToken, workData]);

    useEffect(() => {
        fetchWorkData(id);
        dispatch({ type: SET_TITLE, payload: "Otázky pro hodnocení práce" });
    }, [id, role, dispatch, fetchWorkData]);
    useEffect(() => {
        if (workData) {
            fetchRoleData(role);
            fetchTermsData(id);
        }
    }, [role, workData, fetchRoleData, fetchTermsData, id]);

    return (
        <>
            <ActionLink to={"/works/" + id}>Tato práce</ActionLink>
            <StyledQuestionsLayout>
                {(isWorkLoading ||  isRoleLoading)
                    ?
                    <Loader size="2em" />
                    :
                    (workError || roleError)
                        ?
                        <>
                            {workError ? <Alert variant="error" text="Při získávání dat práce došlo k chybě." /> : ""}
                            {roleError ? <Alert variant="error" text="Při získávání dat role došlo k chybě." /> : ""}
                        </>
                        :
                        (workData && roleData)
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
                                            <CardTypeValueItem type="Role" value={[roleData.setRole.name, " (", (roleData.finalized ? "Uzavřené hodnocení" : "Otevřené hodnocení"), ")"]} />
                                            <CardTypeValueItem type="Hodnotitelé" value={roleData.workRoleUsers.map((item, index) => (<LoadedUser key={index} id={item.userId} />))} />
                                        </CardTypeValueList>
                                    </CardBody>
                                </Card>
                                {role.finalized
                                    ?
                                    <Alert variant="info" text="´Hodnocení v této roli je uzavřené." />
                                    :
                                    null
                                }
                                {workData.state !== 1 && workData.state !== 3
                                    ?
                                    <Alert variant="warning" text="Práce není v hodnotitelném stavu." />
                                    :
                                    null
                                }
                            </>
                            :
                            <Loader size="2em" />
                }
                {(isTermsLoading)
                    ?
                    <Loader size="2em" />
                    :
                    (termsError)
                        ?
                        <>
                            {termsError ? <Alert variant="error" text="Při získávání seznamu termínů došlo k chybě." /> : ""}
                        </>
                        :
                        (termsData && roleData)
                            ?
                            termsData.map((item, index) => (
                                <Card key={ index}>
                                    <CardHeader>
                                        <Subheading>{ item.name }</Subheading>
                                    </CardHeader>
                                    <CardBody>
                                        <OverviewQuestions work={workData} term={item} role={ roleData} />
                                    </CardBody>
                                </Card>
                            ))
                            :
                            <Loader size="2em" />
                }
            </StyledQuestionsLayout>
        </>
    );
}

export default requireEvaluator(Overview);