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
        <Formik
            initialValues={{
                rate: 0,
                mark: 1,
                name: "",
            }}
            validate={values=>{
                let errors = {};
                if (!values.name) errors.name = "Vyplňte slovní hodnocení";
                if (isNaN(values.mark)) errors.mark = "Vyplňte číselné hodnocení";
                if (isNaN(values.rate)) errors.rate = "Vyplňte horní hranici";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.post(process.env.REACT_APP_API_URL + "/scales/" + props.id + "/values", {
                    Name: values.name,
                    Mark: Number(values.mark),
                    Rate: Number(values.rate),
                    ScaleId: Number(props.id),
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    dispatch({type: ADD_MESSAGE, text: "Nová hodnota škály byla vytvořena.", variant: "success", dismissible: true, expiration: 3});
                    props.fetchData();
                    props.setMode();
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
                {(failed !== false) ? <Alert text={"Uložení hodnoty škály se nepodařilo (" + failed + "). Toto může znamenat, že položka pro tuto hranici již existuje."}  variant="error" /> : ""}
                {(ok !== false) ? <Alert text={"Uložení hodnoty škály se podařilo."}  variant="success" /> : ""}
                <FormTextInput name="rate" type="number" min="0" max="1" step="0.01" label="Horní hranice hodnocení" placeholder="1" />
                <FormTextInput name="mark" type="number" min="1" max="5" step="0.5" label="Číselné hodnocení" placeholder="1" />
                <FormTextInput name="name" label="Slovní hodnocení" placeholder="Výborný" />               
                <div>
                    <Button type="submit" variant="primary" disabled={!(isValid && dirty) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                    <Button onClick={e => {props.setMode()}}>Zpět</Button>
                </div>
            </Form>
            )}
        </Formik>
    );
};

export default Create;