import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { useAppContext, SET_TITLE } from "../../providers/ApplicationProvider";
import { ActionLink, Alert, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Loader } from "../general";
import LoadedUser from "../common/LoadedUser";
import DateTime from "../common/DateTime";
import styled from 'styled-components';
import axios from "axios";
import { ADMIN_ROLE, MANAGER_ROLE } from "../../configuration/constants";
import requireManager from "../Auth/requireManager";

const Summary = props => {
    const { id } = useParams();
    const { term } = useParams();
    const { role } = useParams();
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [isWorkLoading, setIsWorkLoading] = useState(false);
    const [workError, setWorkError] = useState(false);
    const [workData, setWorkData] = useState(null);

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

    useEffect(() => {
        fetchWorkData(id);
        dispatch({ type: SET_TITLE, payload: "Souhrn hodnocení práce" });
    }, [id, term, role, dispatch, fetchWorkData]);

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
                        :
                        <Loader size="2em" />
            }
        </>
    )
}

export default requireManager(Summary);