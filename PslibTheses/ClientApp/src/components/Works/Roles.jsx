import React, {useState, useEffect, useCallback} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Loader, Paragraph, CardBody, Table, TableHeader, TableBody, TableRow, TableFooter, HeadCell, DataCell, Alert, CardHeader, Subheading, AddMiniButton, RemoveMiniButton, TableWrapper, Button} from "../general";
import {ADMIN_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";
import {SHOW_ROLES, INVITE_ROLES, ASSIGN_ROLES} from "./Detail";
import LoadedUser from "../common/LoadedUser";
import DateTime from "../common/DateTime";
import axios from "axios";
import styled from 'styled-components';

const StyledUsersInRole = styled.nav`
display: flex;
flex-direction: column;
`;

const StyledUserInRole = styled.nav`
display: flex;
flex-direction: row;
width: 100%;
justify-content: space-between;
`;

const CenteredContent = styled.nav`
display: flex;
flex-direction: row;
width: 100%;
justify-content: start;
padding: .5em;
`;

const UserInRole = ({userId, removeUserAction, isEditable}) => {
    return (
        <StyledUserInRole>
            <LoadedUser id={userId} />
            {isEditable ? <RemoveMiniButton onClick={e => removeUserAction()} /> : "" }
        </StyledUserInRole>
    )   
}

const UsersInRole = ({work, role, setEditedRole, switchMode, accessToken, removeUserAction, fetchAction, isEditable}) => {
    const [users, setUsers] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + work + "/roles/" + role.id + "/users",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setUsers(response.data);
        })
        .catch(error => {
            if (error.response) {
                setError({status: error.response.status, text: error.response.statusText});
            }
            else
            {
                setError({status: 0, text: "Neznámá chyba"});
            }         
            setUsers([]);
        });
        setIsLoading(false);
    },[accessToken, work, role]);
    useEffect(()=>{
        fetchData();
    },[work, role, accessToken]);
    if (isLoading)
    {
        return <Loader />;
    }
    else if (error) {
        return <Alert variant="error" text="Došlo k chybě." />;
    }
    else if (users)
    {
        return (
            <StyledUsersInRole>
                {Array.isArray(users) 
                ?
                users.map((item,index)=>(
                    <UserInRole key={index} userId={item.id} removeUserAction={e => {removeUserAction(work, role.id, item.id); fetchAction();}} isEditable={isEditable} />
                ))
                : 
                ""
                }
                {isEditable ?
                    <AddMiniButton onClick={e => {
                        setEditedRole(role.id);
                        switchMode(ASSIGN_ROLES);
                }}  />
                :
                ""
                }
            </StyledUsersInRole>
        ) 
    }
    else
    {
        return <Loader />;
    }
}

const Roles = ({id, owner, switchMode, editedRole, setEditedRole, isEditable, workData, ...rest}) => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [rolesResponse, setRolesResponse] = useState(null);
    const [isRolesLoading, setIsRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState(false);
    const [termsResponse, setTermsResponse] = useState(null);
    const [isTermsLoading, setIsTermsLoading] = useState(false);
    const [termsError, setTermsError] = useState(false);
    const fetchData = useCallback(() => {
        setIsRolesLoading(true);
        setRolesError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id + "/roles",{
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
                setRolesError({status: error.response.status, text: error.response.statusText});
            }
            else
            {
                setRolesError({status: 0, text: "Neznámá chyba"});
            }         
            setRolesResponse([]);
        });
        setIsRolesLoading(false);
    },[accessToken, id]);
    const fetchTerms = useCallback(() => {
        setIsTermsLoading(true);
        setTermsError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + workData.setId + "/terms",{
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
                setTermsError({status: error.response.status, text: error.response.statusText});
            }
            else
            {
                setTermsError({status: 0, text: "Neznámá chyba"});
            }         
            setTermsResponse([]);
        });
        setIsTermsLoading(false);
    },[accessToken, id, workData]);
    const removeUser = useCallback((work, role, user) => {
        axios.delete(process.env.REACT_APP_API_URL + "/works/" + work + "/roles/" + role + "/users/" + user,{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Hodnotitel byl odebrán.", variant: "success", dismissible: true, expiration: 3});
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Při odebírání hodnotitele došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
        });
    },[accessToken, id]);
    useEffect(()=>{
        fetchData();
        fetchTerms();
    },[accessToken]);

    const showRoles = () => {
        if (isRolesLoading || isTermsLoading) {
            return (
                <HeadCell colSpan="1000"><Loader /></HeadCell>
            );
        }          
        else if (rolesError || termsError) {
            return (
                <HeadCell colSpan="1000"><Alert text="Při získávání seznamu rolí nebo termínů došlo k chybě." /></HeadCell>
            );
        } else if (rolesResponse && termsResponse) {
            return (
                rolesResponse.map((item,index)=>(
                    <HeadCell key={index}>{item.setRole.name}</HeadCell>
                ))
            );
        } else {
            return (
                <HeadCell colSpan="1000"><Loader /></HeadCell>
            );
        }
    }

    const showAssignedRoles = () => {
        if (isRolesLoading) {
            return (
                <HeadCell colSpan="1000"><Loader /></HeadCell>
            );
        }          
        else if (rolesError) {
            return (
                <HeadCell colSpan="1000"><Alert text="Při získávání seznamu obsazení rolí došlo k chybě." variant="error" /></HeadCell>
            );
        } else if (rolesResponse) {
            return (
                rolesResponse.map((item,index)=>(
                    <DataCell key={index}>
                        <UsersInRole work={id} role={item} switchMode={switchMode} setEditedRole={setEditedRole} accessToken={accessToken} removeUserAction={removeUser} fetchAction={fetchData} isEditable={isEditable} />
                    </DataCell>
                ))
            );
        } else {
            return (
                <HeadCell colSpan="1000"><Loader /></HeadCell>
            );
        }
    }

    return (
        <>
        <CardHeader>
            <Subheading>Role</Subheading>
        </CardHeader>
        <TableWrapper>
            <Table width="100%">
                <TableHeader>
                    <TableRow>
                        <HeadCell>Název role</HeadCell>
                        {showRoles()}
                    </TableRow>
                    <TableRow>
                        <HeadCell>Hodnotitel</HeadCell>
                        {showAssignedRoles()}
                    </TableRow>
                </TableHeader>
                <TableBody>
                {
                Array.isArray(termsResponse)
                ?
                termsResponse.map((item, index) => (
                    <TableRow key={index}>
                        <HeadCell>{item.name}</HeadCell>
                        <DataCell colSpan="9999"><DateTime date={item.date} /></DataCell>
                    </TableRow>
                ))
                :
                ""
                }
                </TableBody>
            </Table>
        </TableWrapper>
        {
            (profile !== null) && (
                (
                    profile[ADMIN_ROLE] === "1" 
                    || (profile.sub === workData.authorId)
                    || (profile.sub === workData.managerId)
                    || (profile.sub === workData.userId)  
                )
            )
            ?
        <CardBody>
        <Subheading>Přihlášky a hodnocení</Subheading>
        {
            workData.state === 0
            ?
            <Alert variant="info" text="Pro práce ve stavu přípravy nelze vygenerovat přihlášku. Přepněte stav práce alespoň na Běžící." />
            :
            <CenteredContent>
            <Button onClick={e => {
                axios({
                    url: process.env.REACT_APP_API_URL + "/works/" + id + "/application",
                    method: 'GET',
                    responseType: 'blob',
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "text/html"
                    } 
                  }).then((response) => {
                        let fileContent = new Blob([response.data]);
                        const url = window.URL.createObjectURL(fileContent);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'prihlaska.html');
                        document.body.appendChild(link);
                        link.click();
                        dispatch({type: ADD_MESSAGE, text: "Přihláška byla uložena.", variant: "success", dismissible: true, expiration: 3});
                  }).catch((error)=>{
                        dispatch({type: ADD_MESSAGE, text: "Při získávání přihlášky došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
                  })
            }}>Uložit přihlášku</Button>
        </CenteredContent>
        }
        </CardBody>
        :
        ""
        }
        </>
    );
}

export default Roles;