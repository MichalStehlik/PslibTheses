import React, {useState, useEffect, useCallback} from 'react';
import { useParams } from "react-router-dom";
import { CardContainer, Card, ActionLink, CardHeader, Subheading, Loader, Alert, PageTitle } from "../general";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import axios from "axios";
import {ADMIN_ROLE} from "../../configuration/constants";
import Edit from "./Edit";
import Display from "./Display";
import Goals from "./Goals";
import Outlines from "./Outlines";
import Costs from "./Costs";
import EditCosts from "./EditCosts";
import Roles from "./Roles";
import AddRole from "./AddRole";
import State from "./State";

export const SHOW_ROLES = 0;
export const ASSIGN_ROLES = 1;
export const INVITE_ROLES = 2;

export const Detail = props => {
    const { id } = useParams();
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [editing, setEditing] = useState(false);
    const [rolesMode, setRolesMode] = useState(SHOW_ROLES);
    const [editedRole, setEditedRole] = useState(null);
    const [editingCosts, setEditingCosts] = useState(false);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [evaluators, setEvaluators] = useState([]);
    const [isEditable, setIsEditable] = useState(true);
    const showRoles = () => {
        switch (rolesMode)
        {
            case SHOW_ROLES: return <Roles id={id} owner={response ? response.userId :  false} switchMode={setRolesMode} editedRole={editedRole} setEditedRole={setEditedRole} isEditable={isEditable} work={id} workData={response} />;
            case ASSIGN_ROLES: return <AddRole id={id} owner={response ? response.userId :  false} switchMode={setRolesMode} editedRole={editedRole} setEditedRole={setEditedRole} evaluators={evaluators} work={id} fetchData={fetchData} isEditable={isEditable} />;
        }
    }
    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id,{
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
                setError({status: error.response.status, text: error.response.statusText});
            }
            else
            {
                setError({status: 0, text: "Neznámá chyba"});
            }         
            setResponse([]);
        });
        setIsLoading(false);
    },[accessToken, id]);
    const fetchEvaluatorsData = useCallback(() => {
        axios.get(process.env.REACT_APP_API_URL + "/users?evaluator=true",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setEvaluators(response.data.data);
        })
        .catch(error => {
            setEvaluators([]);
        })
    },[accessToken]);
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Detail práce"});},[dispatch]);
    useEffect(()=>{
        fetchData();
        fetchEvaluatorsData();
    },[]);
    useEffect(()=>{ 
        setIsEditable(
            (profile !== null) && (
                (
                    profile[ADMIN_ROLE] === "1" 
                    || (response && profile.sub === response.userId && props.data.state === 0)
                    || (response && profile.sub === response.managerId && props.data.state === 0)
                    || (response && profile.sub === response.userId && props.data.state === 0)  
                )
            )
        );
     },[accessToken, profile]);
    if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámý námět"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }        
    } else if (response) {
    return (
        <>
        <ActionLink to=".">Seznam</ActionLink>
        <PageTitle>{response.name}</PageTitle>
        <CardContainer>
            <Card>
                {editing ? <Edit data={response} id={id} owner={response ? response.userId :  false} switchEditMode={setEditing} fetchData={fetchData} /> : <Display data={response} isEditable={isEditable} switchEditMode={setEditing} fetchData={fetchData} />}
            </Card>
            <Card>
                {showRoles()}
            </Card>       
            <Card>
                <CardHeader><Subheading>Cíle</Subheading></CardHeader>
                <Goals id={id} owner={response ? response.userId :  false} isEditable={isEditable} />
            </Card>
            <Card>
                <CardHeader><Subheading>Osnova</Subheading></CardHeader>
                <Outlines id={id} owner={response ? response.userId :  false} isEditable={isEditable} />
            </Card>
            { profile[ADMIN_ROLE] === "1" || (profile.sub === props.managerId && props.data.state === 0) || (profile.sub === props.userId && props.data.state === 0)
            ?    
            <Card>
                <CardHeader><Subheading>Stav práce</Subheading></CardHeader>
                <State id={id} owner={response ? response.userId :  false} isEditable={isEditable} data={response} fetchData={fetchData} />
            </Card>
            : 
            ""
            } 
            <Card>
            {editingCosts ? <EditCosts data={response} id={id} isEditable={isEditable} owner={response ? response.userId :  false} switchEditMode={setEditingCosts} fetchData={fetchData} /> : <Costs data={response} owner={response ? response.userId :  false} switchEditMode={setEditingCosts} />}
            </Card>    
        </CardContainer>
        </>
    );
    } else {
        return <Loader size="2em" />;
    }; 
};

export default Detail;