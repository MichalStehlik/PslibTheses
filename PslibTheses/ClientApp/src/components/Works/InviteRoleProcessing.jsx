import React, { useState, useEffect, useCallback } from 'react';
import { Alert, ButtonBlock, Button, Subheading, CardBody, CardHeader, Loader } from "../general";
import { SHOW_ROLES, INVITE_ROLE } from "./Detail";
import { useAppContext } from "../../providers/ApplicationProvider";
import axios from 'axios';

export const InviteRoleProcessing = ({ editedRole, setEditedRole, switchMode, evaluators, work, fetchData, inviteFormData, setInviteFormData, ...rest }) => {
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [remoteFailed, setRemoteFailed] = useState(false);
    const [remoteOk, setRemoteOk] = useState(false);
    const [remoteSubmitting, setRemoteSubmitting] = useState(false);
    const [localFailed, setLocalFailed] = useState(false);
    const [localOk, setLocalOk] = useState(false);
    const [localSubmitting, setLocalSubmitting] = useState(false);
    const [assignFailed, setAssignFailed] = useState(false);
    const [assignOk, setAssignOk] = useState(false);
    const [assignSubmitting, setAssignSubmitting] = useState(false);
    const [createdUserId, setCreatedUserId] = useState(null);
    const createRemoteUser = (input, profile) => {
        setRemoteSubmitting(true);
        setRemoteOk(false);
        setRemoteFailed(false);
        axios.post(process.env.REACT_APP_AUTH_URL + "/api/users/invite", {
            FirstName: input.firstname,
            MiddleName: input.middlename,
            LastName: input.lastname,
            Gender: Number(input.gender),
            Email: input.email,
            Password: input.password,
            InviterId: profile.sub,
            Role: "Externista"
        }, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            setRemoteOk(true);
            setCreatedUserId(response.data.id);
        })
        .catch(error => {
            setRemoteFailed(true);
        })
        .then(() => {
            setRemoteSubmitting(false);
        })
    };
    const createLocalUser = (userData, userId) => {
        setLocalSubmitting(true);
        setLocalOk(false);
        setLocalFailed(false);
        axios.get(process.env.REACT_APP_API_URL + "/users/" + userId, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setLocalOk(true);
            })
            .catch(error => {
                if (error.response && error.response.status === 404) {
                    axios.post(process.env.REACT_APP_API_URL + "/users", {
                        Id: userId,
                        FirstName: userData.firstname,
                        LastName: userData.lastname,
                        Gender: Number(userData.gender),
                        Email: userData.email,
                        CanBeAuthor: false,
                        CanBeEvaluator: true
                    }, {
                        headers: {
                            Authorization: "Bearer " + accessToken,
                            "Content-Type": "application/json"
                        }
                    })
                        .then(response => {
                            setLocalOk(true);
                        })
                        .catch(error => {
                            setLocalFailed(true);
                        })
                }
                else {
                    setLocalFailed(true);
                }
            })
            .then(() => {
                setLocalSubmitting(false);
            })
    };
    const assignUserToRole = (workId, roleId, userId) => {
        setAssignSubmitting(true);
        setAssignOk(false);
        setAssignFailed(false);
        axios.post(process.env.REACT_APP_API_URL + "/works/" + workId + "/roles/" + roleId + "/users", {
            Id: userId
        }, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setAssignOk(true);
            })
            .catch(error => {
                setAssignFailed(true);
            })
            .then(() => {
                setAssignSubmitting(false);
            })
    };
    useEffect(() => {
        setRemoteFailed(false);
        setRemoteOk(false);
        setRemoteSubmitting(false);
        createRemoteUser(inviteFormData, profile);
    }, []);
    useEffect(() => {
        if (createdUserId) {
            createLocalUser(inviteFormData, createdUserId);
        }
    }, [createdUserId, inviteFormData]);
    useEffect(() => {
        if (localOk === true) {
            assignUserToRole(work, editedRole, createdUserId);
        }
    }, [localOk, work, editedRole, createdUserId]);
    return (
        <>
            <CardHeader>
                <Subheading>Výsledek vytvoření hodnotitele</Subheading>
            </CardHeader>
            <CardBody>
            <pre>
                {JSON.stringify(inviteFormData," ",4)}
            </pre>
                <p>Vytvoření vzdáleného účtu uživatele</p>
                {
                    remoteSubmitting
                        ?
                        <Loader />
                        :
                        remoteOk
                            ?
                            <Alert text={"Vytvoření uživatele se podařilo."} variant="success" />
                            :
                            remoteFailed
                                ?
                                <Alert text={"Při vytváření uživatele došlo k chybě."} variant="error" />
                                :
                                <Loader />
                }
                <pre>{ createdUserId }</pre>
                <p>Lokální záznam hodnotitele</p>
                {
                    localSubmitting
                        ?
                        <Loader />
                        :
                        localOk
                            ?
                            <Alert text={"Vytvoření záznamu se podařilo."} variant="success" />
                            :
                            localFailed
                                ?
                                <Alert text={"Při vytváření záznamu došlo k chybě."} variant="error" />
                                :
                                <p>...</p>
                }
                <p>Přiřazení hodnotitele práci</p>
                {
                    assignSubmitting
                        ?
                        <Loader />
                        :
                        assignOk
                            ?
                            <Alert text={"Přiřazení se podařilo."} variant="success" />
                            :
                            assignFailed
                                ?
                                <Alert text={"Při přiřazování došlo k chybě."} variant="error" />
                                :
                                <Loader />
                }
                <div>
                    <Button onClick={e => { switchMode(SHOW_ROLES) }}>Zpět na přehled rolí</Button>
                </div>
            </CardBody>
        </>
    );
}

export default InviteRoleProcessing;