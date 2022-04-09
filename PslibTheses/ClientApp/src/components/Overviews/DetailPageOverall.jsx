import React, { useState, useCallback, useEffect } from 'react';
import { useAppContext } from "../../providers/ApplicationProvider";
import { Loader, Alert } from "../general";
import { TermStatistics } from "./TermStatistics";
import axios from "axios";

const roundToTwo = (num) => {
    return +(Math.round(num + "e+2") + "e-2");
}

export const DetailPageOverall = ({ mode, set, role, work }) => {
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [roleResponse, setRoleResponse] = useState(null);
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work.id + "/statsForRole/" + role.id, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
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
                setResponse(null);
            })
            .then(() => {
                setIsLoading(false);
            })
    }, [accessToken, work.id, role.id]);

    const fetchRoleData = useCallback(() => {
        setIsRoleLoading(true);
        setRoleError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work.id + "/roles/", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                for (var res in response.data) {
                    if (response.data[res].setRoleId === role.id) {
                        setRoleResponse(response.data[res]);
                    }
                }
            })
            .catch(error => {
                if (error.response) {
                    setRoleError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setRoleError({ status: 0, text: "Neznámá chyba" });
                }
                setRoleResponse(null);
            })
            .then(() => {
                setIsRoleLoading(false);
            })
    }, [accessToken, work.id, role.id]);

    useEffect(() => {
        fetchRoleData();
        fetchData();
    }, []);
    if (isLoading || isRoleLoading) {
        return <Loader size="1" />
    } else if (error || roleError) {
        return <Alert text={"Chyba:" + roleError.status } variant="error" />
    } else if (response && roleResponse) {
        return (
            <TermStatistics 
                mark={roleResponse.finalized ? roleResponse.markText : (response.totalPoints > 0 ? (roundToTwo(Number(100 * (response.gainedPoints / response.totalPoints))) + "%") : "0%")}
                questions={response.criticalAnswers + "/" +  response.filledQuestions + "/" + response.totalQuestions}
                points={ response.gainedPoints + "/" + response.filledPoints + "/" + response.totalPoints}
                />
            );
    } else
        return <Loader size="1" />
}

export default DetailPageOverall;