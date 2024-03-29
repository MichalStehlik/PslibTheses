import React, {useState, useEffect, useCallback} from 'react';
import { useAppContext, ADD_MESSAGE } from "../../providers/ApplicationProvider";
import { Loader, CardBody, Table, TableHeader, TableBody, TableRow, HeadCell, DataCell, Alert, CardHeader, Subheading, AddMiniButton, RemoveMiniButton, EditMiniButton, TableWrapper, Button, TableFooter, ButtonBlock } from "../general";
import {ADMIN_ROLE, MANAGER_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";
import { ASSIGN_ROLES } from "./Detail";
import { useHistory } from "react-router-dom";
import LoadedUser from "../common/LoadedUser";
import DateTime from "../common/DateTime";
import axios from "axios";
import styled from 'styled-components';
import TermRoleStats from "./TermRoleStats";

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

const TermDate = styled.span`
font-weight: 100;
font-size: small;
`;

const RoleTermWrapper = styled.div`
display: flex;
flex-direction: row;
`;

const UserInRole = ({userId, removeUserAction, isEditable, isRolesEditable}) => {
    return (
        <StyledUserInRole>
            <LoadedUser id={userId} />
            {isRolesEditable ? <RemoveMiniButton onClick={e => removeUserAction()} /> : "" }
        </StyledUserInRole>
    )   
}

const UsersInRole = ({ work, role, setEditedRole, switchMode, removeUserAction, isEditable, isRolesEditable }) => {
    return (
        <StyledUsersInRole>
            {Array.isArray(role.workRoleUsers)
                ?
                role.workRoleUsers.map((item, index) => (
                    <UserInRole key={index} userId={item.userId} removeUserAction={e => { removeUserAction(work, role.id, item.userId); }} isRolesEditable={isRolesEditable} />
                ))
                :
                ""
            }
            {isRolesEditable ?
                <AddMiniButton onClick={e => {
                    setEditedRole(role.id);
                    switchMode(ASSIGN_ROLES);
                }} />
                :
                ""
            }
        </StyledUsersInRole>
    );
}

const Roles = ({id, owner, switchMode, editedRole, setEditedRole, isEditable, isRolesEditable, workData, ...rest}) => {
    const [{ accessToken, profile }, dispatch] = useAppContext();
    let history = useHistory();
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
        })
        .then(() => {
            setIsRolesLoading(false);
        })
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
    },[accessToken, workData]);
    const removeUser = useCallback((work, role, user) => {
        axios.delete(process.env.REACT_APP_API_URL + "/works/" + work + "/roles/" + role + "/users/" + user,{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            dispatch({ type: ADD_MESSAGE, text: "Hodnotitel byl odebrán.", variant: "success", dismissible: true, expiration: 3 });
            fetchData();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Při odebírání hodnotitele došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
        });
    },[accessToken, dispatch, fetchData]);
    useEffect(()=>{
        fetchData();
        fetchTerms();
    }, [fetchData, fetchTerms]);

    const setFinalized = useCallback((workId, workRoleId, finalized) => {
        axios.put(process.env.REACT_APP_API_URL + "/works/" + workId + "/roles/" + workRoleId + "/finalized/" + finalized, {
        }, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                dispatch({ type: ADD_MESSAGE, text: "Stav hodnocení práce byl změně.", variant: "success", dismissible: true, expiration: 3 });
                fetchData();
            })
            .catch(error => {
                if (error.response) {
                    dispatch({ type: ADD_MESSAGE, text: "Uložení stavu se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                }
                else {
                    dispatch({ type: ADD_MESSAGE, text: "Uložení stavu se nepodařilo.", variant: "error", dismissible: true, expiration: 3 });
                }
            })
            .then(() => {
            });
    }, [accessToken, dispatch, fetchData]);


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
                        <UsersInRole
                            work={id}
                            role={item}
                            switchMode={switchMode}
                            setEditedRole={setEditedRole}
                            removeUserAction={removeUser}
                            isEditable={isEditable}
                            isRolesEditable={isRolesEditable}
                        />
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
                    Array.isArray(termsResponse) && Array.isArray(rolesResponse)
                    ?
                    termsResponse.map((term, termIndex) => (
                        <TableRow key={termIndex}>
                            <HeadCell>{term.name}<br /><TermDate><DateTime date={term.date} showTime={false}/></TermDate></HeadCell>
                            {rolesResponse.map((role, roleIndex) => (
                                <DataCell key={roleIndex}>
                                    <RoleTermWrapper onClick={e => { history.push("/works/" + workData.id + "/evaluation/" + role.id + "/" + term.id) }}>
                                        {(profile[EVALUATOR_ROLE] === "1" || profile[MANAGER_ROLE] === "1" || profile[ADMIN_ROLE] === "1")
                                            ?
                                            <TermRoleStats termId={term.id} roleId={role.setRole.id} workId={workData.id} />
                                            :
                                            null
                                        }
                                        {!role.finalized && role.workRoleUsers.map((item) => (item.userId)).includes(profile.sub) && (workData.state === 1 || workData.state === 3) ? <EditMiniButton onClick={e => { history.push("/works/" + workData.id + "/evaluation/" + role.id + "/" + term.id)} } /> : null}
                                    </RoleTermWrapper>
                            </DataCell>
                            ))}
                        </TableRow>
                    ))
                    :
                    null
                    }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <HeadCell>Stav hodnocení</HeadCell>
                            {Array.isArray(rolesResponse) ? rolesResponse.map((role, roleIndex) => (
                                <DataCell key={roleIndex}>
                                    {role.finalized
                                        ?
                                        "Uzavřené"
                                        :
                                        "Otevřené"
                                    }
                                </DataCell>
                            )) : null}
                        </TableRow>
                        {
                            (profile) && (
                                (
                                    profile[ADMIN_ROLE] === "1"
                                    || profile[MANAGER_ROLE] === "1"
                                    || profile[EVALUATOR_ROLE] === "1"
                                )
                            )
                                ?
                                    <>
                                    <TableRow>
                                        <HeadCell>Známka</HeadCell>
                                        {Array.isArray(rolesResponse) ? rolesResponse.map((role, roleIndex) => (
                                            <DataCell key={roleIndex}>
                                                {role.finalized
                                                    ?
                                                    role.markText
                                                    :
                                                    "?"
                                                }
                                            </DataCell>
                                        )) : null}
                                    </TableRow>
                                    <TableRow>
                                        <HeadCell>Akce</HeadCell>
                                        {Array.isArray(rolesResponse) ? rolesResponse.map((role, roleIndex) => (
                                            <DataCell key={roleIndex}>
                                                <ButtonBlock>
                                                    {role.workRoleUsers.map((item) => (item.userId)).includes(profile.sub) && (workData.state === 3)
                                                        ?
                                                        role.finalized ? <Button size="8pt" variant="warning" outline onClick={e => {setFinalized(workData.id, role.id, false) }}>Otevřít hodnocení</Button> : <Button size="8pt" variant="success" outline onClick={e => { history.push("/works/" + workData.id + "/review/" + role.id) }}>Upravit posudek</Button>
                                                        :
                                                        null
                                                    }
                                                    <Button size="8pt" onClick={e => { history.push("/works/" + workData.id + "/overview/" + role.id) }} >Přehled role</Button>
                                                 </ButtonBlock>
                                            </DataCell>
                                        )) : null}
                                    </TableRow>
                                    </>
                                :
                                null
                        }
                    </TableFooter>
                </Table>
                {(profile) && (profile[ADMIN_ROLE] === "1" || profile[MANAGER_ROLE] === "1")
                    ?
                    <CardBody>
                        <ButtonBlock>
                            <Button size="8pt" onClick={e => { history.push("/works/" + workData.id + "/overview") }} >Přehled hodnocení</Button>
                        </ButtonBlock>
                    </CardBody>
                    : null}
            </TableWrapper>
            {
                (profile) && (
                    (
                        profile[ADMIN_ROLE] === "1" 
                        || profile[MANAGER_ROLE] === "1" 
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
                <ButtonBlock>
                        <Button size="8pt" variant="success" onClick={e => {
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
                </ButtonBlock>
            }
            {
                workData.state < 4
                ?
                <Alert variant="info" text="Dokud není práce zhodnocená, nelze vygenerovat žádný posudek." />
                :
                <ButtonBlock>
                        <Button size="8pt" variant="success" onClick={e => {
                        axios({
                            url: process.env.REACT_APP_API_URL + "/works/" + id + "/review",
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
                            link.setAttribute('download', 'hodnoceni.html');
                            document.body.appendChild(link);
                            link.click();
                            dispatch({ type: ADD_MESSAGE, text: "Posudek byl uložen.", variant: "success", dismissible: true, expiration: 3 });
                        }).catch((error) => {
                            dispatch({ type: ADD_MESSAGE, text: "Při získávání posudku došlo k chybě.", variant: "error", dismissible: true, expiration: 3 });
                        })
                        }}>Uložit posudek</Button>
                        {(profile) && (profile[ADMIN_ROLE] === "1" || profile[MANAGER_ROLE] === "1")
                            ?
                            <Button size="8pt" variant="warning" onClick={e => {
                                axios({
                                    url: process.env.REACT_APP_API_URL + "/works/" + id + "/review",
                                    method: 'GET',
                                    responseType: 'blob',
                                    headers: {
                                        Authorization: "Bearer " + accessToken,
                                        "Content-Type": "text/html"
                                    },
                                    params: {
                                        summary: true
                                    }
                                }).then((response) => {
                                    let fileContent = new Blob([response.data]);
                                    const url = window.URL.createObjectURL(fileContent);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'hodnoceni.html');
                                    document.body.appendChild(link);
                                    link.click();
                                    dispatch({ type: ADD_MESSAGE, text: "Posudek byl uložen.", variant: "success", dismissible: true, expiration: 3 });
                                }).catch((error) => {
                                    dispatch({ type: ADD_MESSAGE, text: "Při získávání posudku došlo k chybě.", variant: "error", dismissible: true, expiration: 3 });
                                })
                            }}>Uložit posudek se známkami</Button>
                            :
                            null
                        }
                </ButtonBlock>
            }
            </CardBody>
            :
            ""
            }
        </>
    );
}

export default Roles;