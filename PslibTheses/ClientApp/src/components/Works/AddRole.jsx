import React, {useState, useEffect, useCallback} from 'react';
import { Formik, ErrorMessage } from 'formik';
import { Alert, ButtonBlock, Button, Label, Form, Input, FormSelect, Subheading, CardBody, CardHeader } from "../general";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import axios from 'axios';
import { SHOW_ROLES, INVITE_ROLES } from "./Detail";
import requireAuth from "../Auth/requireAuth";

export const AddRole = ({editedRole, setEditedRole, switchMode, work, fetchData, ...rest}) => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [filter, setFilter] = useState("");
    const [evaluators, setEvaluators] = useState([]);
    const [ok, setOk] = useState(false);
    const handleFilterChange = e => {
        setFilter(e.target.value);
        console.log(e.target.value);
    }
    const fetchEvaluatorsData = useCallback((filter) => {
        let query = "/users?evaluator=true";
        axios.get(process.env.REACT_APP_API_URL + query + (filter !== "" ? ("&search=" + filter) : ""), {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setEvaluators(response.data.data);
            })
            .catch(error => {
                setEvaluators([]);
            })
    }, [accessToken, filter]);
    useEffect(()=>{ 
        setFailed(false);        
        setOk(false);
    }, [dispatch]);
    useEffect(() => {
        fetchEvaluatorsData(filter);
    },[filter])
    return (
        <>
        <CardHeader>
            <Subheading>Přidání hodnotitele</Subheading>         
        </CardHeader>
            <CardBody>
                <Input value={filter} onChange={handleFilterChange} />
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
                    {(ok !== false) ? <Alert text={"Přidání hodnotitele se podařilo."} variant="success" /> : ""}
                    <FormSelect name="userId" label="Hodnotitel" placeholder="xxxxxxxxx" size="10">
                        {Array.isArray(evaluators) ? evaluators.map((item,index) => (<option key={index} value={item.id}>{item.name + " (" + item.email + ")"}</option>)) : ""}
                    </FormSelect>
                    <ButtonBlock>
                        <Button type="submit" variant="primary" disabled={!((dirty && isValid) || isSubmitting)}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                        <Button onClick={e => { switchMode(SHOW_ROLES) }}>Storno</Button>
                        <Button onClick={e => { switchMode(INVITE_ROLES) }}>Pozvat nového hodnotitele</Button>
                    </ButtonBlock>
                </Form>
                        )}
            </Formik>    
        </CardBody>
        </>
    )
};

export default requireAuth(AddRole);