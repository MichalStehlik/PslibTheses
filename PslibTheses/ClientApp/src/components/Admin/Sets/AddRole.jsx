import React from 'react';
import { Formik } from 'formik';
import { Subheading, CardHeader, CardBody, Button, Form, FormTextInput, FormCheckbox, Label} from "../../general";
import {useAppContext, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import {CONTENT_DISPLAY} from "./Content";
import Axios from 'axios';

export const AddRole = props => {
    const [{accessToken}, dispatch] = useAppContext();
    return (
        <>
        <CardHeader>
            <Subheading>Přidání role</Subheading>
        </CardHeader>
        <CardBody>
            <Formik
                initialValues={{
                    name: "",
                    manager: false,
                    classteacher: false,
                    printedinapplication: false,
                    printedinreview: false
                }}
                validate={values=>{
                    let errors = {};
                    if (!values.name) errors.name = "Vyplňte název";
                    return errors;
                }}
                onSubmit={async (values, { setSubmitting }) => {
                    setSubmitting(true);
                    Axios.post(process.env.REACT_APP_API_URL + "/sets/" + props.setId + "/roles", {
                        Name: values.name,
                        Manager: values.manager,
                        ClassTeacher: values.classteacher,
                        PrintedInApplication: values.printedinapplication,
                        PrintedInReview: values.printedinreview,
                        SetId: Number(props.setId)
                    }, {
                        headers: {
                            Authorization: "Bearer " + accessToken,
                            "Content-Type": "application/json"
                        }
                    })
                    .then(response => {
                        dispatch({type: ADD_MESSAGE, text: "Role byla přidána.", variant: "success", dismissible: true, expiration: 3});
                        props.fetchData();
                        props.setContentMode(CONTENT_DISPLAY);
                    })
                    .catch(error => {
                        dispatch({type: ADD_MESSAGE, text: "Přidání role se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                    })
                    .then(()=>{
                        setSubmitting(false); 
                    }); 
                }}
            >
                {({isSubmitting, isValid, dirty}) => (
                <Form>
                    <FormTextInput name="name" label="Název" placeholder="Božský imperátor Duny" />
                    <Label>Naplnění role</Label>
                    <FormCheckbox name="manager" label="Role je naplněna manažerem práce" />
                    <FormCheckbox name="classteacher" label="Role je naplněna třídním učitelem" />
                    <Label>Tiskové sestavy</Label>
                    <FormCheckbox name="printedinapplication" label="Tisknuta na přihlášku" />
                    <FormCheckbox name="printedinreview" label="Tisknuta na hodnocení" />
                    <div>
                        <Button type="submit" variant="primary" disabled={!(isValid && dirty) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                        <Button onClick={e => {props.fetchData(); props.setContentMode(CONTENT_DISPLAY)}}>Zpět</Button>
                    </div>
                </Form>
            )}
            </Formik>
        </CardBody>
        </>
    );
}

export default AddRole;