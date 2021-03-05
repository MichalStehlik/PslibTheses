import React, {useState, useEffect} from 'react';
import { Formik } from 'formik';
import { Alert, Button, Label, Form, CardContainer, Card, ActionLink, FormTextInput, FormCheckbox, FormRadioGroup } from "../../general";
import {useHistory} from "react-router-dom";
import {useAppContext, SET_TITLE} from "../../../providers/ApplicationProvider";
import {Genders} from "../../../configuration/constants";
import Axios from 'axios';

export const Create = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    let history = useHistory();
    useEffect(()=>{ 
        dispatch({type: SET_TITLE, payload: "Nový uživatel"});
        setFailed(false);
        setOk(false); },[dispatch]);
    return (
        <>
        <>
        <ActionLink to="..">Administrace</ActionLink>
        <ActionLink to=".">Seznam</ActionLink>
        </>
        <CardContainer>
            <Card>
            <Formik
            initialValues={{
                id: "",
                firstname: "",
                middlename: "",
                lastname: "",
                gender: 0,
                email: "",
                canbeauthor: false,
                canbeevaluator: false,
                lockedicon: false,
                lockedchange: false
            }}
            validate={values=>{
                let errors = {};
                if (!values.id) errors.id = "Vyplňte identifikátor uživatele";
                if (!values.firstname) errors.firstname = "Vyplňte jméno uživatele";
                if (!values.lastname) errors.lastname = "Vyplňte příjmení uživatele";
                if (values.gender === null) errors.gender = "Vyplňte pohlaví uživatele";
                if (!values.email) errors.email = "Vyplňte email uživatele";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.post(process.env.REACT_APP_API_URL + "/users", {
                    Id: values.id,
                    FirstName: values.firstname,
                    MiddleName: values.middlename,
                    LastName: values.lastname,
                    Gender: values.gender,
                    Email: values.email,
                    CanBeAuthor: values.canbeauthor,
                    CanBeEvaluator: values.canbeevaluator,
                    LockedIcon: values.lockedicon,
                    LockedChange: values.lockedchange
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    history.push("/admin/users");
                })
                .catch(error => {
                    if (error.response)
                        {
                            setFailed(error.response.status);
                        }
                        else
                        {
                            setFailed("Neznámá chyba");
                        }
                        setOk(false);
                })
                .then(()=>{
                    setSubmitting(false); 
                });
            }}
        >
                {({isSubmitting, errors, touched, values, setFieldValue, dirty, isValid}) => (
                <Form>
                    {(failed !== false) ? <Alert text={"Vytvoření uživatele se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                    {(ok !== false) ? <Alert text={"Vytvoření uživatele se podařilo."}  variant="success" /> : ""}
                    <FormTextInput name="id" label="Id" placeholder="xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
                    <FormTextInput name="firstname" label="Jméno" placeholder="Jiří" required />
                    <FormTextInput name="middlename" label="Prostřední jméno" placeholder="" />
                    <FormTextInput name="lastname" label="Příjmení" placeholder="Novák" required />
                    <FormTextInput name="email" label="Email" type="email" placeholder="jirka@novaku.test" required />
                    <FormRadioGroup name="gender" label="Pohlaví" values={Genders} />
                    <Label>Vlastnosti účtu</Label>
                    <FormCheckbox name="canbeauthor" label="Může být autorem práce" />
                    <FormCheckbox name="canbeevaluator" label="Může hodnotit práce" />
                    <FormCheckbox name="lockedchange" label="Data účtu se nebudou při přihlášení aktualizovat" />
                    <FormCheckbox name="lockedicon" label="Ikona účtu se nebude při přihlášení aktualizovat" />
                    <div>
                        <Button type="submit" variant="primary" disabled={!(isValid && dirty) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                        <Button onClick={e => {history.push("/admin/users")}}>Zpět</Button>
                    </div>
                </Form>
                )}            
                </Formik>
            </Card>
        </CardContainer>
        </>
    );
};

export default Create;