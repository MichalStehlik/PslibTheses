import React, {useState, useEffect} from 'react';
import { Formik } from 'formik';
import { Alert, Button, Label, Form, FormTextInput, FormCheckbox, FormRadioGroup } from "../../general";
import {useAppContext, SET_TITLE, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import {Genders} from "../../../configuration/constants";
import Axios from 'axios';

const Edit = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    useEffect(() => {
        dispatch({type: SET_TITLE, payload: "Editace uživatele"});
        setFailed(false);
        setOk(false);
    },[dispatch]);
    return (
        <Formik
            initialValues={{
                id: props.data.id ? props.data.id : "",
                firstname: props.data.firstName ? props.data.firstName : "",
                middlename: props.data.middleName ? props.data.middleName : "",
                lastname: props.data.lastName ? props.data.lastName : "",
                gender: props.data.gender !== undefined ? props.data.gender : 0,
                email: props.data.email ? props.data.email : "",
                canbeauthor: props.data.canBeAuthor ? props.data.canBeAuthor : false,
                canbeevaluator: props.data.canBeEvaluator ? props.data.canBeEvaluator : false,
                lockedicon: props.data.lockedIcon ? props.data.lockedIcon : false,
                lockedchange: props.data.lockedChange ? props.data.lockedChange : false
            }}
            validate={values=>{
                let errors = {};
                if (!values.id) errors.id = "Vyplňte ID";
                if (!values.firstname) errors.firstname = "Vyplňte jméno uživatele";
                if (!values.lastname) errors.lastname = "Vyplňte příjmení uživatele";
                if (values.gender === null) errors.gender = "Vyplňte pohlaví uživatele";
                if (!values.email) errors.email = "Vyplňte email uživatele";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.put(process.env.REACT_APP_API_URL + "/users/" + props.data.id, {
                    Id: values.id,
                    FirstName: values.firstname,
                    MiddleName: values.middlename,
                    LastName: values.lastname,
                    Gender: Number(values.gender),
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
                    dispatch({type: ADD_MESSAGE, text: "Uživatel byl uložen.", variant: "success", dismissible: true, expiration: 3});
                    props.fetchData();
                    props.switchEditMode(false);
                })
                .catch(error => {
                    if (error.response)
                        {
                            setFailed(error.response.status);
                            dispatch({type: ADD_MESSAGE, text: "Při uložení uživatele došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
                        }
                        else
                        {
                            setFailed("Neznámá chyba");
                            dispatch({type: ADD_MESSAGE, text: "Při uložení uživatele došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
                        }
                        setOk(false);
                })
                .then(()=>{
                    setSubmitting(false); 
                }); 
            }}
        >
            {({isSubmitting, isValid, dirty}) => (
            <Form>
                {(failed !== false) ? <Alert text={"Uložení uživatele se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                {(ok !== false) ? <Alert text={"Uložení uživatele se podařilo."}  variant="success" /> : ""}
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
                <Alert text="Při přihlášení uživatele může dojít k automatické aktualizaci údajů." variant="info"/>
                <div>
                    <Button type="submit" variant="primary" disabled={!(isValid) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                    <Button onClick={e => props.switchEditMode(false)}>Zpět</Button>
                </div>
            </Form>
            )}
        </Formik>
    );
};

export default Edit;