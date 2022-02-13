import React, { useState, useEffect, useCallback } from 'react';
import { Alert, ButtonBlock, Button, Subheading, CardBody, CardHeader } from "../general";
import { SHOW_ROLES, INVITE_ROLE } from "./Detail";
import { useAppContext, ADD_MESSAGE } from "../../providers/ApplicationProvider";

export const InviteRoleProcessing = ({ editedRole, setEditedRole, switchMode, evaluators, work, fetchData, inviteFormData, setInviteFormData, ...rest }) => {
    const [{ accessToken }, dispatch] = useAppContext();
    return (
        <>
            <CardHeader>
                <Subheading>Výsledek vytvoření hodnotitele</Subheading>
            </CardHeader>
            <CardBody>
            <pre>
                {JSON.stringify(inviteFormData," ",4)}
            </pre>
                <Button onClick={e => { switchMode(SHOW_ROLES) }}>Zpět na přehled rolí</Button>
            </CardBody>
        </>
    );
}

export default InviteRoleProcessing;