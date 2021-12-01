import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useAppContext, SET_TITLE } from "../../providers/ApplicationProvider";
import { ActionLink, Alert, Loader } from "../general";
import List from "./List";
import axios from "axios";

export const Works = props => {
    const { set } = useParams();
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [isSetLoading, setIsSetLoading] = useState(false);
    const [setError, setSetError] = useState(false);
    const [setData, setSetData] = useState(null);
    const [rolesResponse, setRolesResponse] = useState(null);
    const [isRolesLoading, setIsRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState(false);
    const [termsResponse, setTermsResponse] = useState(null);
    const [isTermsLoading, setIsTermsLoading] = useState(false);
    const [termsError, setTermsError] = useState(false);

    const fetchSetData = useCallback(id => {
        setIsSetLoading(true);
        setSetError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id, { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
            .then(response => {
                setSetData(response.data);
            })
            .catch(err => {
                if (err.response) {
                    setSetError({ text: err.response.statusText, status: err.response.status });
                }
                else {
                    setSetError({ text: "Neznámá chyba", status: "" });
                }
                setSetData(null);
            })
            .then(() => {
                setIsSetLoading(false);
            });
    }, [accessToken]);

    const fetchRoles = useCallback(id => {
        setIsRolesLoading(true);
        setRolesError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id + "/roles", {
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

    const fetchTerms = useCallback(id => {
        setIsTermsLoading(true);
        setTermsError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id + "/terms", {
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
    }, [accessToken]);

    useEffect(() => {
        fetchSetData(set);
        dispatch({ type: SET_TITLE, payload: "Přehled prací v sadě" });
    }, [set, fetchSetData]);
    useEffect(() => {
        if (setData != null) {
            fetchRoles(setData.id);
            fetchTerms(setData.id);
        }  
    }, [setData, fetchRoles, fetchTerms]);

    return (
        <>
            <div>
                <ActionLink to={"/overviews"}>Seznam sad</ActionLink>
            </div>
            {(isSetLoading || isRolesLoading || isTermsLoading)
                ?
                <Loader size="2em" />
                :
                (setError || rolesError || termsError)
                    ?
                        <>
                        {setError ? <Alert variant="error" text="Při získávání dat sady došlo k chybě." /> : ""}
                        {rolesError ? <Alert variant="error" text="Při získávání dat rolí došlo k chybě." /> : ""}
                        {termsError ? <Alert variant="error" text="Při získávání dat termínů došlo k chybě." /> : ""}
                        </>
                    :
                    (setData && rolesResponse && termsResponse)
                        ?
                        <List set={setData} roles={rolesResponse} terms={termsResponse} />
                        :
                        <Loader size="2em" />

                }
        </>
        );
}

export default Works;