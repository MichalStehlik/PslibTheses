import React, { useState, useEffect, useCallback } from 'react';
import { Alert, ButtonBlock, Button, Label, Form, FormTextInput, FormSelect, Subheading, CardBody, CardHeader } from "../general";
import { SHOW_ROLES, INVITE_ROLE } from "./Detail";
import { useAppContext, ADD_MESSAGE } from "../../providers/ApplicationProvider";

export const InviteRole = ({ editedRole, setEditedRole, switchMode, evaluators, work, fetchData, ...rest }) => {
    const [{ accessToken }, dispatch] = useAppContext();
    return (
        <Button onClick={e => { switchMode(SHOW_ROLES) }}>Storno</Button>
    );
}

export default InviteRole;