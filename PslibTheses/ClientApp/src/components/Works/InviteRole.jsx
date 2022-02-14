import React, { useState, useEffect, useCallback } from 'react';
import { Formik } from 'formik';
import { Alert, ButtonBlock, Button, Label, Form, FormTextInput, FormSelect, Subheading, CardBody, CardHeader, FormRadioGroup } from "../general";
import { SHOW_ROLES, INVITE_PROCESSING } from "./Detail";
import { useAppContext, ADD_MESSAGE } from "../../providers/ApplicationProvider";
import { Genders } from "../../configuration/constants";

export const InviteRole = ({ editedRole, setEditedRole, switchMode, evaluators, work, fetchData, inviteFormData, setInviteFormData, ...rest }) => {
    const [{ accessToken }, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    useEffect(() => {
        setFailed(false);
        setOk(false);
    }, [dispatch]);

    return (
        <>
            <CardHeader>
                <Subheading>Vytvoření a přizvání nového hodnotitele</Subheading>
            </CardHeader>
            <CardBody>
            <Formik
                initialValues={{
                    firstname: "",
                    middlename: "",
                    lastname: "",
                    gender: 0,
                    email: "",
                    password: ""
                }}
                validate={values => {
                    let errors = {};
                    if (!values.firstname) errors.firstname = "Vyplňte jméno uživatele";
                    if (!values.lastname) errors.lastname = "Vyplňte příjmení uživatele";
                    if (values.gender === null) errors.gender = "Vyplňte pohlaví uživatele";
                    if (!values.email) errors.email = "Vyplňte email uživatele";
                    return errors;
                }}
                    onSubmit={async (values, { setSubmitting }) => {
                    setInviteFormData(values);
                    switchMode(INVITE_PROCESSING);
                }}
            >
                {({ isSubmitting, errors, touched, values, setFieldValue, dirty, isValid }) => (
                    <Form>
                        {(failed !== false) ? <Alert text={"Vytvoření uživatele se nepodařilo. (" + failed + ")"} variant="error" /> : ""}
                        {(ok !== false) ? <Alert text={"Vytvoření uživatele se podařilo."} variant="success" /> : ""}
                        <FormTextInput name="firstname" label="Jméno" placeholder="Jiří" required />
                        <FormTextInput name="middlename" label="Prostřední jméno" placeholder="" />
                        <FormTextInput name="lastname" label="Příjmení" placeholder="Novák" required />
                        <FormTextInput name="email" label="Email" type="email" placeholder="jirka@novaku.test" required />
                        <FormTextInput name="password" label="Heslo (nepovinné)" placeholder="Astg4jzDe" />
                        <FormRadioGroup name="gender" label="Pohlaví" values={Genders} />
                        <div>
                            <Button type="submit" variant="primary" disabled={!(isValid && dirty) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                            <Button onClick={e => { switchMode(SHOW_ROLES) }}>Zpět</Button>
                        </div>
                    </Form>
                )}
                </Formik>
                </CardBody>
        </>
    );
}

export default InviteRole;