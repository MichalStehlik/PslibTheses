import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody, Subheading, Loader } from "../../general";
import { EditableItemsList } from "../../common";
import { useAppContext, ADD_MESSAGE } from "../../../providers/ApplicationProvider";
import axios from "axios";

const Questions = ({ work, role}) => {
    const [{ accessToken }, dispatch] = useAppContext();
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const fetchQuestions = useCallback(() => {
        setIsLoading(true);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work.id + "/roles/" + role.id + "/reviewQuestions", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setList(response.data);
            })
            .catch(error => {
                if (error.response) {
                    dispatch({ type: ADD_MESSAGE, text: "Během získávání otázek došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                }
                else {
                    dispatch({ type: ADD_MESSAGE, text: "Během získávání otázek došlo k chybě.", variant: "error", dismissible: true, expiration: 3 });
                };
                setList([]);
            });
        setIsLoading(false);
    }, [accessToken, work.id, role.id, dispatch]);
    const addQuestion = useCallback((item) => {
        axios.post(process.env.REACT_APP_API_URL + "/works/" + work.id + "/roles/" + role.id + "/reviewQuestions", { text: item }, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                dispatch({ type: ADD_MESSAGE, text: "Otázka byla přidána", variant: "success", dismissible: true, expiration: 3 });
                setList([]);
                fetchQuestions();
            })
            .catch(error => {
                dispatch({ type: ADD_MESSAGE, text: "Během přidávání otázky došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
            });
    }, [work.id, role.id, accessToken, dispatch, fetchQuestions]);
    const updateQuestion = useCallback((id, item) => {
        axios.put(process.env.REACT_APP_API_URL + "/works/" + work.id + "/roles/" + role.id + "/reviewQuestions/" + id,
            {
                text: item
            },
            {
                headers: {
                    Authorization: "Bearer " + accessToken,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                dispatch({ type: ADD_MESSAGE, text: "Otázka byla aktualizována", variant: "success", dismissible: true, expiration: 3 });
                setList([]);
                fetchQuestions();
            })
            .catch(error => {
                dispatch({ type: ADD_MESSAGE, text: "Během aktualizace otázky došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
            });
    }, [work.id, role.id, accessToken, dispatch, fetchQuestions]);
    const removeQuestion = useCallback((id) => {
        axios.delete(process.env.REACT_APP_API_URL + "/works/" + work.id + "/roles/" + role.id + "/reviewQuestions/" + id, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                dispatch({ type: ADD_MESSAGE, text: "Otázka byla odstraněna", variant: "success", dismissible: true, expiration: 3 });
                setList([]);
                fetchQuestions();
            })
            .catch(error => {
                dispatch({ type: ADD_MESSAGE, text: "Během odstraňování otázky došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
            });
    }, [work.id, role.id, accessToken, dispatch, fetchQuestions]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
    if (isLoading) {
        return <Loader size="2" />
    } else {
        return (
            <Card>
                <CardHeader>
                    <Subheading>Otázky</Subheading>
                </CardHeader>
                <CardBody>
                    <EditableItemsList items={list} editable={true} addItemAction={addQuestion} removeItemAction={removeQuestion} updateItemAction={updateQuestion} />
                </CardBody>
            </Card>
        );
    }
}

export default Questions;