import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from "../../../providers/ApplicationProvider";
import { Loader, Alert } from "../../general";
import axios from "axios";
import Question from "./Question";

const Questions = ({ work, term, role, editable }) => {
    const [{ accessToken }] = useAppContext();
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
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
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    if (isLoading)
        return <Loader size="2em" />
    else if (error)
        return <Alert variant="error" text="Chyba při získávání seznamu otázek." />
    else if (response) {
        return (response.map((item, index) => (
            <Question key={index} role={role} term={term} work={work} questionId={item.id} editable={ editable} />
        )));
    }
    else
        return <Loader size="2em" />
}

export default Questions;