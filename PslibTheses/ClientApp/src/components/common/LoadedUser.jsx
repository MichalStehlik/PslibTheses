import React from 'react';
import User from "./User";
import {useFetch, Loader } from "../general";
import {useAppContext} from "../../providers/ApplicationProvider";

const LoadedUser = ({id, ...rest}) => {
    const [{accessToken}] = useAppContext();
    const {response, error, isLoading} = useFetch(process.env.REACT_APP_API_URL + "/users/" + id,{
        method: "GET",
        headers: accessToken !== null ? {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json"
        } : {}
    },[accessToken]);
    if (isLoading) {
        return <Loader />;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return "Chyba";
            case 404: return "Neznámý uživatel";
            default: return "Nedostupná data uživatele";
        }        
    } else if (response) {
        return <User image={response.iconImage ? <img src={"data:" + response.iconImageType + ";base64," + response.iconImage} alt={response.name} /> : ""} name={response.name} detail={response.email ? response.email : ""} to={"/users/" + response.id}/>;
    }
    else {
        return <Loader />;
    };
}

export default LoadedUser;