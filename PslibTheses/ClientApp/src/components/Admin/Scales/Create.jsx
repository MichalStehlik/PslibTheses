import React, {useState, useEffect} from 'react';
import { Formik } from 'formik';
import { Alert, Button, Form, FormTextInput, ActionLink, Card, CardContainer} from "../../general";
import {useHistory} from "react-router-dom";
import {useAppContext, SET_TITLE, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import Axios from 'axios';

const Create = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    let history = useHistory();
    useEffect(() => {
        dispatch({type: SET_TITLE, payload: "Vytvoření škály"});
        setFailed(false);
        setOk(false);
    },[dispatch]);
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
                name: "",
                year: "",
                active: true,
                template: 0,
                maxGrade: 5,
                requiredGoals: 3,
                requiredOutlines: 3,
            }}
            validate={values=>{
                let errors = {};
                if (!values.name) errors.name = "Vyplňte název";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.post(process.env.REACT_APP_API_URL + "/scales", {
                    Name: values.name,
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    dispatch({type: ADD_MESSAGE, text: "Škála byla vytvořena.", variant: "success", dismissible: true, expiration: 3});
                    history.push("/admin/scales");
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
            {({isSubmitting, isValid, dirty}) => (
            <Form>
                {(failed !== false) ? <Alert text={"Uložení škály se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                {(ok !== false) ? <Alert text={"Uložení škály se podařilo."}  variant="success" /> : ""}
                <FormTextInput name="name" label="Název" placeholder="Standardní škála" />
                <div>
                    <Button type="submit" variant="primary" disabled={!(isValid && dirty) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                    <Button onClick={e => {history.push("/admin/scales")}}>Zpět</Button>
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