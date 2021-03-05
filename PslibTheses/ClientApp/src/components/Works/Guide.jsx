import React, {useState, useEffect, useCallback} from 'react';
import {useHistory} from "react-router-dom";
import { Alert, ActionLink } from "../general";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import requireEvaluator from "../Auth/requireEvaluator";
import Axios from 'axios';

export const Guide = props => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    const [sets, setSets] = useState(null);
    const [authors, setAuthors] = useState(null);
    const [evaluators, setEvaluators] = useState(null);
    let history = useHistory();

    const fetchSetsData = useCallback(() => {
        Axios.get(process.env.REACT_APP_API_URL + "/sets?active=true",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setSets(response.data.data);
        })
    },[accessToken]);
    const fetchAuthorsData = useCallback(() => {
        Axios.get(process.env.REACT_APP_API_URL + "/users?author=true",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setAuthors(response.data.data);
        })
    },[accessToken]);
    const fetchEvaluatorsData = useCallback(() => {
        Axios.get(process.env.REACT_APP_API_URL + "/users?evaluator=true",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setEvaluators(response.data.data);
        })
    },[accessToken]);

    return (
        <>
        <ActionLink to=".">Seznam</ActionLink>
        <Alert variant="info" text="Tady zatím nic není." />
        </>
    );
};

export default requireEvaluator(Guide);