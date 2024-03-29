﻿import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { useAppContext, SET_TITLE } from "../../providers/ApplicationProvider";
import { ActionLink, Alert, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Loader, TableWrapper, Table, TableRow, TableHeader, TableBody, HeadCell, DataCell, TableFooter } from "../general";
import LoadedUser from "../common/LoadedUser";
import DateTime from "../common/DateTime";
import styled from 'styled-components';
import axios from "axios";
import requireManager from "../Auth/requireManager";
import OverviewQuestions from "./OverviewQuestions";
import OverviewRoleStats from "./OverviewRoleStats";

const StyledUsersInRole = styled.nav`
display: flex;
flex-direction: column;
`;

const TermDate = styled.span`
font-weight: 100;
font-size: small;
`;


const UsersInRole = ({ role }) => {
    return (
        <StyledUsersInRole>
            {Array.isArray(role.workRoleUsers)
                ?
                role.workRoleUsers.map((item, index) => (
                    <LoadedUser key={index} id={item.userId} />
                ))
                :
                ""
            }
        </StyledUsersInRole>
    );
}

const StudentQuestions = ({ id, roleId }) => {
    const [{ accessToken }] = useAppContext();
    const [questionsData, setQuestionsData] = useState(null);
    const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
    const [questionsError, setQuestionsError] = useState(false);
    const fetchQuestionsData = useCallback((id, roleId) => {
        setIsQuestionsLoading(true);
        setQuestionsError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id + "/roles/" + roleId + "/reviewQuestions", { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
            .then(response => {
                setQuestionsData(response.data);
            })
            .catch(err => {
                if (err.response) {
                    setQuestionsError({ text: err.response.statusText, status: err.response.status });
                }
                else {
                    setQuestionsError({ text: "Neznámá chyba", status: "" });
                }
                setQuestionsData(null);
            })
            .then(() => {
                setIsQuestionsLoading(false);
            });
    }, [accessToken]);
    useEffect(() => {
        fetchQuestionsData(id, roleId);
    }, [roleId, fetchQuestionsData, id]);
    if (isQuestionsLoading) {
        return <Loader size="2" />
    }
    else if (questionsError) {
        return <Alert variant="error" text="Při získávání otázek došlo k chybě." />
    }
    else if (questionsData) {
        return (
            (Array.isArray(questionsData) && questionsData.length > 0)
                ?
                <ol>
                    {questionsData.map((item, index) => (<li key={index}>{item.text}</li>))}
                </ol>
                :
                <p><i>Źádné otázky nejsou.</i></p>
        );
    }
    else {
        return <Loader size="2" />
    }
}

const Summary = props => {
    const { id } = useParams();
    const { role } = useParams();
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [isWorkLoading, setIsWorkLoading] = useState(false);
    const [workError, setWorkError] = useState(false);
    const [workData, setWorkData] = useState(null);
    const [rolesResponse, setRolesResponse] = useState(null);
    const [isRolesLoading, setIsRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState(false);
    const [termsResponse, setTermsResponse] = useState(null);
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
    const fetchRolesData = useCallback((workId) => {
        setIsRolesLoading(true);
        setRolesError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + workId + "/roles", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setRolesResponse(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setRolesError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setRolesError({ status: 0, text: "Neznámá chyba" });
                }
                setRolesResponse([]);
            })
            .then(() => {
                setIsRolesLoading(false);
            })
    }, [accessToken]);
    const fetchTermsData = useCallback((setId) => {
        setIsTermsLoading(true);
        setTermsError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + workData.setId + "/terms", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setTermsResponse(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setTermsError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setTermsError({ status: 0, text: "Neznámá chyba" });
                }
                setTermsResponse([]);
            });
        setIsTermsLoading(false);
    }, [accessToken, workData]);
    useEffect(() => {
        fetchWorkData(id);
        dispatch({ type: SET_TITLE, payload: "Souhrn hodnocení práce" });
    }, [id, dispatch, fetchWorkData]);
    useEffect(() => {
        if (workData) {
            fetchTermsData(workData.setId);
            fetchRolesData(workData.id);
        }
    }, [role, workData, fetchRolesData, fetchTermsData, id]);

    const showRoles = () => {
        if (isRolesLoading || isTermsLoading) {
            return (
                <HeadCell colSpan="1000"><Loader /></HeadCell>
            );
        }
        else if (rolesError || termsError) {
            return (
                <HeadCell colSpan="1000"><Alert text="Při získávání seznamu rolí nebo termínů došlo k chybě." /></HeadCell>
            );
        } else if (rolesResponse && termsResponse) {
            return (
                rolesResponse.map((item, index) => (
                    <HeadCell key={index}>{item.setRole.name}</HeadCell>
                ))
            );
        } else {
            return (
                <HeadCell colSpan="1000"><Loader /></HeadCell>
            );
        }
    }
    const showAssignedRoles = () => {
        if (isRolesLoading) {
            return (
                <HeadCell colSpan="1000"><Loader /></HeadCell>
            );
        }
        else if (rolesError) {
            return (
                <HeadCell colSpan="1000"><Alert text="Při získávání seznamu obsazení rolí došlo k chybě." variant="error" /></HeadCell>
            );
        } else if (rolesResponse) {
            return (
                rolesResponse.map((item, index) => (
                    <DataCell key={index}>
                        <UsersInRole role={item} />
                    </DataCell>
                ))
            );
        } else {
            return (
                <HeadCell colSpan="1000"><Loader /></HeadCell>
            );
        }
    }

    return (
        <>
            <ActionLink to={"/works/" + id}>Tato práce</ActionLink>
            {(isWorkLoading)
                ?
                <Loader size="2em" />
                :
                (workError)
                    ?
                    <>
                        {workError ? <Alert variant="error" text="Při získávání dat práce došlo k chybě." /> : ""}
                    </>
                    :
                    (workData)
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
                                    </CardTypeValueList>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <Heading>Porovnání stavu hodnocení práce</Heading>
                                </CardHeader>
                                <CardBody>
                                    <TableWrapper>
                                        <Table width="100%">
                                            <TableHeader>
                                                <TableRow>
                                                    <HeadCell colSpan="2">Název role</HeadCell>
                                                    {showRoles()}
                                                </TableRow>
                                                <TableRow>
                                                    <HeadCell colSpan="2">Hodnotitel</HeadCell>
                                                    {showAssignedRoles()}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {
                                                    Array.isArray(termsResponse) && Array.isArray(rolesResponse)
                                                        ?
                                                        termsResponse.map((term, termIndex) => (
                                                            <TableRow key={termIndex}>
                                                                <HeadCell colSpan="2">{term.name}<br /><TermDate><DateTime date={term.date} showTime={false} /></TermDate></HeadCell>
                                                                {rolesResponse.map((role, roleIndex) => (
                                                                    <DataCell key={roleIndex}>
                                                                        <OverviewQuestions work={workData} term={term} role={role} />
                                                                    </DataCell>
                                                                ))}
                                                            </TableRow>
                                                        ))
                                                        :
                                                        null
                                                }
                                            </TableBody>
                                            <TableFooter>
                                                {
                                                    Array.isArray(rolesResponse)
                                                        ?
                                                        <>
                                                        <TableRow>
                                                            <HeadCell rowSpan="100">Celá role</HeadCell>
                                                            <DataCell>Uzavřené</DataCell>
                                                                {rolesResponse.map((role, roleIndex) => (
                                                                    <DataCell key={roleIndex}>
                                                                        {role.finalized ? "Ano" : "Ne"} 
                                                                    </DataCell>
                                                                ))}
                                                            </TableRow>
                                                            <TableRow>
                                                                <DataCell>Známka</DataCell>
                                                                {rolesResponse.map((role, roleIndex) => (
                                                                    <DataCell key={roleIndex}>
                                                                        {role.markText ? role.markText : <i>Žádná známka</i>}
                                                                    </DataCell>
                                                                ))}
                                                            </TableRow>
                                                            <TableRow>
                                                                <DataCell>Statistiky</DataCell>
                                                                {rolesResponse.map((role, roleIndex) => (
                                                                    <DataCell key={roleIndex}>
                                                                        <OverviewRoleStats work={workData} role={ role } />
                                                                    </DataCell>
                                                                ))}
                                                            </TableRow>
                                                            <TableRow>
                                                                <DataCell>Text posudku</DataCell>
                                                                {rolesResponse.map((role, roleIndex) => (
                                                                    <DataCell key={roleIndex}>
                                                                        {role.review ? <span dangerouslySetInnerHTML={{ __html: role.review }} /> : <i>Žádný text</i>}
                                                                    </DataCell>
                                                                ))}
                                                            </TableRow>
                                                            <TableRow>
                                                                <DataCell>Otázky pro studenta</DataCell>
                                                                {rolesResponse.map((role, roleIndex) => (
                                                                    <DataCell key={roleIndex}>
                                                                        <StudentQuestions id={ id } roleId={ role.id } />
                                                                    </DataCell>
                                                                ))}
                                                            </TableRow>
                                                        </>
                                                        :
                                                        null
                                                }
                                            </TableFooter>
                                        </Table>
                                    </TableWrapper>
                                </CardBody>
                            </Card>
                        </>
                        :
                        <Loader size="2em" />
            }
        </>
    )
}

export default requireManager(Summary);