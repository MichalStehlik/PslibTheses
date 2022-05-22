import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext, ADD_MESSAGE } from "../../../providers/ApplicationProvider";
import { Alert, Card, CardHeader, CardBody, Paragraph, Subheading, Loader, ButtonBlock, Button } from "../../general";
import axios from "axios";
import { useHistory } from "react-router-dom";
import OverviewRoleStats from "../OverviewRoleStats";

const Mark = ({ work, role, storeTextAction }) => {
    const [{ accessToken }, dispatch] = useAppContext();
    const [setData, setSetData] = useState(null);
    const [isSetLoading, setSetIsLoading] = useState(false);
    const [setError, setSetError] = useState(false);
    const [scalesData, setScalesData] = useState(null);
    const [isScalesLoading, setScalesIsLoading] = useState(false);
    const [scalesError, setScalesError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    let history = useHistory();
    const fetchSetData = useCallback((setId) => {
        setSetIsLoading(true);
        setSetError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + setId, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setSetData(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setSetError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setSetError({ status: 0, text: "Neznámá chyba" });
                }
                setSetData(null);
            });
        setSetIsLoading(false);
    },[accessToken]);
    const fetchScalesData = useCallback((scaleId) => {
        setScalesIsLoading(true);
        setScalesError(false);
        axios.get(process.env.REACT_APP_API_URL + "/scales/" + scaleId + "/values", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setScalesData(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setScalesError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setScalesError({ status: 0, text: "Neznámá chyba" });
                }
                setScalesData(null);
            });
        setScalesIsLoading(false);
    }, [accessToken]);
    const storeMark = useCallback((workId, workRoleId, text, value, finalized) => {
        setIsSaving(true);
        axios.put(process.env.REACT_APP_API_URL + "/works/" + workId + "/roles/" + workRoleId + "/mark", {
            WorkId: Number(workId),
            WorkRoleId: Number(workRoleId),
            MarkText: text,
            MarkValue: Number(value),
            Finalized: finalized
        }, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({ type: ADD_MESSAGE, text: "Známka byla uložena.", variant: "success", dismissible: true, expiration: 3 });
            history.push("/works/" + workId);
        })
        .catch(error => {
            if (error.response) {
                dispatch({ type: ADD_MESSAGE, text: "Uložení známky se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
            }
            else {
                dispatch({ type: ADD_MESSAGE, text: "Uložení známky se nepodařilo.", variant: "error", dismissible: true, expiration: 3 });
            }
        })
        .then(() => {
            setIsSaving(false);
        });
    }, [accessToken, dispatch, history]);
    useEffect(() => {
        fetchSetData(work.setId);
    }, [fetchSetData, work.setId]);
    useEffect(() => {
        if (setData != null) {
            fetchScalesData(setData.scaleId);
        } 
    }, [fetchScalesData, setData]);
    return (
        <Card>
            <CardHeader>
                <Subheading>Výsledná známka</Subheading>
            </CardHeader>
            <CardBody>             
                {isSetLoading || isScalesLoading
                    ?
                    <Loader size="2em" />
                    :
                    setError || scalesError
                        ?
                        <Alert text="Při získávání stupňů hodnocení došlo k chybě." variant="error" />
                        :
                        scalesData !== null
                            ?
                            <>
                                <OverviewRoleStats work={work} role={role} />
                                <Paragraph>Volbou známky dojde k uzavření hodnocení práce v této roli.</Paragraph>
                                <ButtonBlock>
                                    {scalesData.map((item, index) => (
                                        <Button key={index} onClick={e => {
                                            storeTextAction();
                                            storeMark(work.id, role.id, item.name, item.mark, true);
                                        }}>{item.name + " (" + (Number(item.rate) * 100) + "%)"}</Button>
                                ))}
                                </ButtonBlock>
                            </>
                            :
                            <Loader size="2em" />
                    }
            </CardBody>
        </Card>
        );
}

export default Mark;