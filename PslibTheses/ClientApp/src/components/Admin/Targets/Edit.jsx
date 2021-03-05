import React, {useState, useEffect} from 'react';
import { Formik } from 'formik';
import { Alert, Button, Form, FormTextInput, } from "../../general";
import {useAppContext, SET_TITLE, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import Axios from 'axios';

const Edit = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    useEffect(() => {
        dispatch({type: SET_TITLE, payload: "Editace cílové skupiny"});
        setFailed(false);
        setOk(false);
    },[dispatch]);
    return (
        <Formik
            initialValues={{
                text: props.data.text ? props.data.text : "",
                color: props.data.color ? "#" + props.data.color.name.substring(2,8) : "",
            }}
            validate={values=>{
                let errors = {};
                if (!values.text) errors.text = "Vyplňte text";
                if (!values.color) errors.color = "Vyberte barvu";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                console.log(values);
                Axios.put(process.env.REACT_APP_API_URL + "/targets/" + props.data.id, {
                    Text: values.text,
                    Color: values.color,
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
                    dispatch({type: ADD_MESSAGE, text: "Cíl byl uložen.", variant: "success", dismissible: true, expiration: 3});
                    props.fetchData();
                    props.switchEditMode(false);
                })
                .catch(error => {
                    if (error.response)
                        {
                            setFailed(error.response.status);
                            dispatch({type: ADD_MESSAGE, text: "Při ukládání cíle došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
                        }
                        else
                        {
                            setFailed("Neznámá chyba");
                            dispatch({type: ADD_MESSAGE, text: "Při ukládání cíle došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
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
                <FormTextInput name="text" label="Text" placeholder="MP obor" />
                <FormTextInput name="color" label="Barva" type="color" />
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