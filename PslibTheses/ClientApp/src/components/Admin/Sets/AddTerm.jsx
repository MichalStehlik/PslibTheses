import React from 'react';
import { Formik } from 'formik';
import { Subheading, CardHeader, CardBody, Button, Form, FormTextInput, FormCheckbox, Label} from "../../general";
import {useAppContext, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import {CONTENT_DISPLAY} from "./Content";
import Axios from 'axios';

export const AddTerm = props => {
    const [{accessToken}, dispatch] = useAppContext();
    return (
        <>
        <CardHeader>
            <Subheading>Přidání termínu</Subheading>
        </CardHeader>
        <CardBody>
            <Formik
                initialValues={{
                    name: "",
                    date: "",
                    warningdate: ""
                }}
                validate={values=>{
                    let errors = {};
                    if (!values.name) errors.name = "Vyplňte název";
                    if (!values.date) errors.date = "Vyplňte datum hodnocení";
                    if (!values.warningdate) errors.warningdate = "Vyplňte datum varování";
                    return errors;
                }}
                onSubmit={async (values, { setSubmitting }) => {
                    setSubmitting(true);
                    Axios.post(process.env.REACT_APP_API_URL + "/sets/" + props.setId + "/terms", {
                        Name: values.name,
                        Date: values.date,
                        WarningDate: values.warningdate,
                        SetId: Number(props.setId)
                    }, {
                        headers: {
                            Authorization: "Bearer " + accessToken,
                            "Content-Type": "application/json"
                        }
                    })
                    .then(response => {
                        dispatch({type: ADD_MESSAGE, text: "Termín byl přidán.", variant: "success", dismissible: true, expiration: 3});
                        props.fetchData();
                        props.setContentMode(CONTENT_DISPLAY);
                    })
                    .catch(error => {
                        dispatch({type: ADD_MESSAGE, text: "Přidání termínu se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                    })
                    .then(()=>{
                        setSubmitting(false); 
                    }); 
                }}
            >
                {({isSubmitting, isValid, dirty}) => (
                <Form>
                    <FormTextInput name="name" label="Název" placeholder="Kontrolní termín" />
                    <Label>Termíny</Label>
                    <FormTextInput name="date" label="Datum hodnocení" type="date" />
                    <FormTextInput name="warningdate" label="Datum zaslání upozornění" type="date" />
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

export default AddTerm;