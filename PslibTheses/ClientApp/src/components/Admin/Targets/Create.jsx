import React, {useState, useEffect} from 'react';
import { Formik } from 'formik';
import { Alert, Button, Form, ActionLink, Card, CardContainer, FormTextInput } from "../../general";
import {useHistory} from "react-router-dom";
import {useAppContext, SET_TITLE, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import Axios from 'axios';

const Create = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    let history = useHistory();
    useEffect(() => {
        dispatch({type: SET_TITLE, payload: "Vytvoření cílové skupiny"});
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
                            text: "",
                            color: "#0000f0",
                        }}
                        validate={values=>{
                            let errors = {};
                            if (!values.text) errors.text = "Vyplňte text";
                            if (!values.color) errors.color = "Vyberte barvu";
                            return errors;
                        }}
                        onSubmit={async (values, { setSubmitting }) => {
                            setSubmitting(true);
                            Axios.post(process.env.REACT_APP_API_URL + "/targets", {
                                Text: values.text,
                                Color: values.color
                            }, {
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "application/json"
                                }
                            })
                            .then(response => {
                                setOk(true);
                                setFailed(false);
                                dispatch({type: ADD_MESSAGE, text: "Cílová skupina byla vytvořena.", variant: "success", dismissible: true, expiration: 3});
                                history.push("/admin/targets");
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
                            {(failed !== false) ? <Alert text={"Uložení skupiny se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                            {(ok !== false) ? <Alert text={"Uložení skupiny se podařilo."}  variant="success" /> : ""}
                            <FormTextInput name="text" label="Text" placeholder="MP 2021/22" />
                            <FormTextInput name="color" label="Barva" type="color" />
                            <div>
                                <Button type="submit" variant="primary" disabled={!(isValid && dirty) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                                <Button onClick={e => {history.push("/admin/targets")}}>Zpět</Button>
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