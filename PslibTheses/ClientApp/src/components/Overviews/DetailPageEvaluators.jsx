import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppContext } from "../../providers/ApplicationProvider";
import { Loader, Alert } from "../general";
import LoadedUser from "../common/LoadedUser";
import axios from "axios";

export const DetailPageEvaluators = ({ mode, set, role, work }) => {
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [roleResponse, setRoleResponse] = useState(null);
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const fetchData = useCallback(() => {
        setIsRoleLoading(true);
        setRoleError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work.id + "/roles", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                for (let i of response.data) {
                    if (i.setRoleId === role.id) {
                        setRoleResponse(i);
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
    }, [accessToken, work.id]);

    useEffect(() => {
        fetchData();
    }, []);
    if (isRoleLoading) {
        return <Loader size="1" />
    } else if (roleError) {
        return <Alert text="Chyba" variant="error" />
    } else if (roleResponse) {
        return <p>{roleResponse.workRoleUsers.map((item, index) => (<LoadedUser key={ index} id={ item.userId } />))}</p>
    } else
        return <Loader size="1" />
}

export default DetailPageEvaluators;