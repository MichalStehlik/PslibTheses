import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { useAppContext, SET_TITLE } from "../../../providers/ApplicationProvider";
import { ActionLink, PageTitle, Alert, CardContainer, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Loader, TableWrapper, Table, TableRow, TableHeader, TableBody, HeadCell, DataCell, CardFooter, TableFooter } from "../../general";
import LoadedUser from "../../common/LoadedUser";
import DateTime from "../../common/DateTime";
import styled from 'styled-components';
import axios from "axios";
import requireEvaluator from "../../Auth/requireEvaluator";
import Text from "./Text";
import Mark from "./Mark";
import Questions from "./Questions";

const Review = props => {
    const { id } = useParams();
    const { role } = useParams();
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [isWorkLoading, setIsWorkLoading] = useState(false);
    const [workError, setWorkError] = useState(false);
    const [workData, setWorkData] = useState(null);
    const [roleData, setRoleData] = useState(null);
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const [roleError, setRoleError] = useState(false);

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
    const fetchRoleData = useCallback((workId, roleId) => {
        setIsRoleLoading(true);
        setRoleError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + workId + "/roles/" + roleId, {
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
            })
            .then(() => {
                setIsRoleLoading(false);
            })
    }, [accessToken]);
    useEffect(() => {
        fetchWorkData(id);
        dispatch({ type: SET_TITLE, payload: "Posudek práce" });
    }, [id, role, dispatch, fetchWorkData]);
    useEffect(() => {
        if (workData) {
            fetchRoleData(id, role);
        }
    }, [role, workData, fetchRoleData, id]);
    return (
        <>
            <ActionLink to={"/works/" + id}>Tato práce</ActionLink>
            <CardContainer>
            {(isWorkLoading || isRoleLoading)
                ?
                <Card>
                    <Loader size="2em" />
                </Card>
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
                                    <Heading>Závěrečné posouzení práce</Heading>
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
                            {workData.state !== 1 && workData.state !== 3
                                ?
                                <Alert variant="warning" text="Práce není v hodnotitelném stavu." />
                                :
                                null
                            }
                            {role.finalized
                                ?
                                <Alert variant="info" text="´Hodnocení v této roli je uzavřené." />
                                :
                                null
                            }
                                {!role.finalized && !(workData.state !== 1 && workData.state !== 3)
                                    ?
                                    <>
                                        <Text work={workData} role={roleData} />
                                        <Questions work={workData} role={roleData} />
                                        <Mark work={workData} role={ roleData} />                                 
                                    </>
                                    :
                                    null
                                }
                        </>
                        :
                        <Loader size="2em" />
                }
                </CardContainer>
        </>
    );
}

export default requireEvaluator(Review);