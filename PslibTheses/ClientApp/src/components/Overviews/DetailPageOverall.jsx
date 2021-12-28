﻿import React, { useState, useCallback, useEffect } from 'react';
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
    const fetchData = useCallback(() => {
        setIsRoleLoading(true);
        setRoleError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work.id + "/statsForRole/" + role.id, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setRoleResponse(response.data);
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
    }, [accessToken, work.id]);

    useEffect(() => {
        fetchData();
    }, []);
    if (isRoleLoading) {
        return <Loader size="1" />
    } else if (roleError) {
        return <Alert text={"Chyba:" + roleError.status } variant="error" />
    } else if (roleResponse) {
        return (
            <TermStatistics 
                mark={role.finalized ? role.markText : (roleResponse.totalPoints > 0 ? (roundToTwo(Number(100 * (roleResponse.gainedPoints / roleResponse.totalPoints))) + "%") : "0%")}
                questions={roleResponse.criticalAnswers + "/" +  roleResponse.filledQuestions + "/" + roleResponse.totalQuestions}
                points={ roleResponse.gainedPoints + "/" + roleResponse.filledPoints + "/" + roleResponse.totalPoints}
                />
            );
    } else
        return <Loader size="1" />
}

export default DetailPageOverall;