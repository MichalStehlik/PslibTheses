import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from "../../providers/ApplicationProvider";
import { Alert, CardTypeValueList, CardTypeValueItem, Loader } from "../general";
import axios from "axios";

const OverviewRoleStats = ({ role, work }) => {
    const [{ accessToken}] = useAppContext();
    const [statsData, setStatsData] = useState(null);
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(false);

    const fetchStatsData = useCallback((workId, roleId) => {
        setIsStatsLoading(true);
        setStatsError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + workId + "/statsForRole/" + roleId, { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
            .then(response => {
                setStatsData(response.data);
            })
            .catch(err => {
                if (err.response) {
                    setStatsError({ text: err.response.statusText, status: err.response.status });
                }
                else {
                    setStatsError({ text: "Neznámá chyba", status: "" });
                }
                setStatsData(null);
            })
            .then(() => {
                setIsStatsLoading(false);
            });
    }, [accessToken]);

    useEffect(() => {
        if (work && role)
            fetchStatsData(work.id, role.setRoleId);
    }, [work, role, fetchStatsData]);

    if (isStatsLoading) {
        return <Loader size="2em" />;
    }
    else if (statsError) {
        return <Alert variant="error" text="Při získávání statistik došlo k chybě." />;
    }
    else if (statsData) {
        return (
            <CardTypeValueList>
                <CardTypeValueItem type="Otázky (kritické / zodpovězené / celkem)" value={statsData.criticalAnswers + "/" + statsData.filledQuestions + "/" + statsData.totalQuestions} />
                <CardTypeValueItem type="Body (získané / z zodpovězených / ze všech)" value={statsData.gainedPoints + "/" + statsData.filledPoints + "/" + statsData.totalPoints} />
                <CardTypeValueItem type="Procenta" value={Math.round(statsData.gainedPoints / statsData.filledPoints * 100) + "%"} />
                <CardTypeValueItem type="Vypočítaná známka" value={statsData.calculatedMark} />
            </CardTypeValueList>
        );
    }
    else {
        return <Loader size="2em" />;
    }
}

export default OverviewRoleStats;