import React, {useEffect, useState, useCallback} from 'react';
import {Loader } from "../general";
import {useAppContext} from "../../providers/ApplicationProvider";
import {Link} from "react-router-dom";
import axios from "axios"

const Scale = ({id}) => {
    const [{accessToken}] = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState(null);
    const fetchData = useCallback(id => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/scales/" + id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
            setData(response.data);
        })
        .catch(err => {
            if (err.response)
            {
                setError({text:  err.response.statusText, status: error.response.status});
            }
            else
            {
                setError({text:  "Neznámá chyba", status: ""});
            }
            setData(null);
        })
        .then(()=>{
            setIsLoading(false);
        });  
    },[accessToken]);
    useEffect(() => {
        fetchData(id);
    },[]);
    if (isLoading) {
        return <Loader />;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return "Chyba";
            case 404: return "Neznámá škála";
            default: return "Nedostupná data";
        }        
    } else if (data) {
        return <Link to={"/admin/scales/" + id}>{data.name}</Link>;
    }
    else {
        return <Loader />;
    };
}

export default Scale;