import React, {useState, useEffect} from 'react';
import { Formik } from 'formik';
import { Alert, Button, Form, FormTextInput} from "../../general";
import {useAppContext, SET_TITLE, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import Axios from 'axios';

const Edit = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    useEffect(() => {
        dispatch({type: SET_TITLE, payload: "Editace škály"});
        setFailed(false);
        setOk(false);
    },[dispatch]);
    return (
        <Formik
            initialValues={{
                name: props.data.name ? props.data.name : "",
            }}
            validate={values=>{
                let errors = {};
                if (!values.name) errors.name = "Vyplňte název";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.put(process.env.REACT_APP_API_URL + "/scales/" + props.data.id, {
                    Name: values.name,
                    Id: Number(props.id)
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    dispatch({type: ADD_MESSAGE, text: "Škála byla uložena.", variant: "success", dismissible: true, expiration: 3});
                    props.fetchData();
                    props.switchEditMode(false);
                })
                .catch(error => {
                    if (error.response)
                        {
                            setFailed(error.response.status);
                            dispatch({type: ADD_MESSAGE, text: "Při ukládání škály došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
                        }
                        else
                        {
                            setFailed("Neznámá chyba");
                            dispatch({type: ADD_MESSAGE, text: "Při ukládání škály došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
                        }
                        setOk(false);
                })
                .then(()=>{
                    setSubmitting(false); 
                }); 
            }}
        >
            {({isSubmitting, isValid}) => (
            <Form>
                {(failed !== false) ? <Alert text={"Uložení škály se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                {(ok !== false) ? <Alert text={"Uložení škály se podařilo."}  variant="success" /> : ""}
                <FormTextInput name="name" label="Název" placeholder="Standardní škála" />
                <div>
                    <Button type="submit" variant="primary" disabled={!(isValid) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                    <Button onClick={()=>{props.switchEditMode(false)}}>Zpět</Button>
                </div>
            </Form>
            )}
        </Formik>
    );
};

export default Edit;