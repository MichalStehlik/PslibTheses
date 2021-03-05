import React, {useState, useEffect, useCallback} from 'react';
import { Formik, ErrorMessage } from 'formik';
import { Alert, FormGroup, Button, Label, Form, FormTextInput, FormSelect, Subheading, CardBody, CardHeader } from "../general";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import axios from 'axios';
import {SHOW_ROLES, INVITE_ROLES, ASSIGN_ROLES} from "./Detail";
import requireAuth from "../Auth/requireAuth";

export const AddRole = ({editedRole, setEditedRole, switchMode, evaluators, work, fetchData, ...rest}) => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    useEffect(()=>{ 
        setFailed(false);
        setOk(false);
     },[dispatch]);
    return (
        <>
        <CardHeader>
            <Subheading>Přidání hodnotitele</Subheading>         
        </CardHeader>
        <CardBody>
        <Formik
            initialValues={{
                userId: ""
            }}
            validate={values=>{
                let errors = {};
                if (!values.userId) errors.userId = "Vyberte hodnotitele";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                axios.post(process.env.REACT_APP_API_URL + "/works/" + work + "/roles/" + editedRole + "/users", {
                    Id: values.userId
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    fetchData();
                    dispatch({type: ADD_MESSAGE, text: "Byl přidán nový hodnotitel.", variant: "success", dismissible: true, expiration: 3});
                    switchMode(SHOW_ROLES);
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
                {({isSubmitting, errors, touched, values, setFieldValue, handleBlur, dirty, isValid}) => (
                <Form>
                    {(failed !== false) ? <Alert text={"Přidání hodnotitele se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                    {(ok !== false) ? <Alert text={"Přidání hodnotitele se podařilo."}  variant="success" /> : ""}
                    <FormSelect name="userId" label="Hodnotitel" placeholder="xxxxxxxxx">
                        <option></option>
                        {Array.isArray(evaluators) ? evaluators.map((item,index) => (<option key={index} value={item.id}>{item.name + " (" + item.email + ")"}</option>)) : ""}
                    </FormSelect>
                    <div>
                        <Button type="submit" variant="primary" disabled={!((dirty && isValid) || isSubmitting)}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                        <Button onClick={e=>{switchMode(SHOW_ROLES)}}>Zpět</Button>
                    </div>
                </Form>
                )}
            </Formik>    
        </CardBody>
        </>
    )
};

export default requireAuth(AddRole);