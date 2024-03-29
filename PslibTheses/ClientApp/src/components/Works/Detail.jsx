import React, {useState, useEffect, useCallback} from 'react';
import { useParams } from "react-router-dom";
import { CardContainer, Card, ActionLink, CardHeader, Subheading, Loader, Alert, PageTitle } from "../general";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import axios from "axios";
import { ADMIN_ROLE, MANAGER_ROLE, EVALUATOR_ROLE } from "../../configuration/constants";
import Edit from "./Edit";
import Display from "./Display";
import Goals from "./Goals";
import Outlines from "./Outlines";
import Costs from "./Costs";
import EditCosts from "./EditCosts";
import Roles from "./Roles";
import AddRole from "./AddRole";
import InviteRole from "./InviteRole";
import InviteRoleProcessing from "./InviteRoleProcessing";
import State from "./State";

export const SHOW_ROLES = 0;
export const ASSIGN_ROLES = 1;
export const INVITE_ROLES = 2;
export const INVITE_PROCESSING = 3;

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
    const [isEditable, setIsEditable] = useState(false);
    const [isRolesEditable, setIsRolesEditable] = useState(false);
    const [inviteFormData, setInviteFormData] = useState(null);
    const showRoles = () => {
        switch (rolesMode)
        {
            case SHOW_ROLES: return <Roles id={id} owner={response ? response.userId : false} switchMode={setRolesMode} editedRole={editedRole} setEditedRole={setEditedRole} isEditable={isEditable} isRolesEditable={isRolesEditable} work={id} workData={response} />;
            case ASSIGN_ROLES: return <AddRole id={id} owner={response ? response.userId : false} switchMode={setRolesMode} editedRole={editedRole} setEditedRole={setEditedRole} evaluators={evaluators} work={id} fetchData={fetchData} isEditable={isEditable} isRolesEditable={isRolesEditable} />;
            case INVITE_ROLES: return <InviteRole id={id} owner={response ? response.userId : false} switchMode={setRolesMode} editedRole={editedRole} setEditedRole={setEditedRole} evaluators={evaluators} work={id} fetchData={fetchData} isEditable={isEditable} isRolesEditable={isRolesEditable} inviteFormData={inviteFormData} setInviteFormData={ setInviteFormData}/>;
            case INVITE_PROCESSING: return <InviteRoleProcessing id={id} owner={response ? response.userId : false} switchMode={setRolesMode} editedRole={editedRole} setEditedRole={setEditedRole} evaluators={evaluators} work={id} fetchData={fetchData} isEditable={isEditable} isRolesEditable={isRolesEditable} inviteFormData={inviteFormData} setInviteFormData={setInviteFormData} />;
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
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: response ? ("Práce: " + response.name) : "Detail práce"});},[dispatch, response]);
    useEffect(()=>{
        fetchData();
        fetchEvaluatorsData();
    }, [fetchEvaluatorsData, fetchData]);
    useEffect(()=>{ 
        setIsEditable(
            (profile !== null) && (response !== null) && (
                (
                    profile[ADMIN_ROLE] === "1" 
                    || (response && profile.sub === response.userId && response.state === 0)
                    || (response && profile.sub === response.managerId && response.state === 0)
                )
                &&
                response.state < 4
            )
        );
        setIsRolesEditable(
            (profile !== null) && (response !== null) && (
                (
                    profile[ADMIN_ROLE] === "1"
                    || (response && profile.sub === response.userId && response.state === 0)
                    || (response && profile.sub === response.managerId && response.state <= 1)
                )
                &&
                //response.state < 4
                ([0, 1, 3].includes(response.state))
            )
        );
     },[accessToken, profile, response]);
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
                <Goals id={id} isEditable={isEditable} />
            </Card>
            <Card>
                <CardHeader><Subheading>Osnova</Subheading></CardHeader>
                <Outlines id={id} isEditable={isEditable} />
            </Card>
                {(profile[EVALUATOR_ROLE] === "1" || profile[ADMIN_ROLE] === "1" || profile[MANAGER_ROLE] === "1")
            ?    
            <Card>
                <CardHeader><Subheading>Stav práce</Subheading></CardHeader>
                <State id={id} owner={response ? response.userId :  false} isEditable={isEditable} data={response} fetchData={fetchData} />
            </Card>
            : 
            ""
            } 
            <Card>
                    {editingCosts ? <EditCosts data={response} id={id} isEditable={isEditable} owner={response ? response.userId : false} switchEditMode={setEditingCosts} fetchData={fetchData} /> : <Costs data={response} switchEditMode={setEditingCosts} isEditable={isEditable} />}
            </Card>    
        </CardContainer>
        </>
    );
    } else {
        return <Loader size="2em" />;
    }; 
};

export default Detail;