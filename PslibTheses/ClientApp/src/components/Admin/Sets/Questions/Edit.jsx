import React, {useState, useEffect } from 'react';
import { Formik, ErrorMessage } from 'formik';
import {useAppContext} from "../../../../providers/ApplicationProvider";
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import {Form, Alert, FormTextInput, FormGroup, Label, Button, FormError} from "../../../general";

const Edit = ({value, globalEditing, setGlobalEditing, setId, fetchData, setEditMode}) => {
    const [{accessToken}] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    useEffect(() => {
        setGlobalEditing(true);
    },[]);
    return (
        <Formik
            initialValues={{
                text: value.text,
                description: value.description,
                points: Number(value.points)
            }}
            validate={values=>{
                let errors = {};
                if (!values.text) errors.text = "Vyplňte text otázky";
                if (values.points === "") errors.points = "Vyplňte počet bodů za otázku";
                if (Number(values.points) < 0) errors.points = "Počet bodů nemůže být záporný";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.put(process.env.REACT_APP_API_URL + "/sets/" + setId + "/questions/" + value.id, {
                    Id: value.id,
                    Text: values.text,
                    Description: values.description,
                    Points: Number(values.points)
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setEditMode(false);
                    setOk(true);
                    setFailed(false);
                    setGlobalEditing(false);
                    fetchData();
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
            }
            }
        >
        {({isSubmitting, errors, touched, values, setFieldValue, handleBlur, dirty, isValid}) => (
            <Form>
            {(failed !== false) ? <Alert text={"Uložení otázky se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
            {(ok !== false) ? <Alert text={"Uložení otázky se podařilo."}  variant="success" /> : ""}
            <FormTextInput name="text" label="Text" placeholder="Zaslouží si student hezké hodnocení?" />
            <FormGroup>
                <Label htmlFor="description">Popis</Label>
                <CKEditor
                    editor={ Editor }
                    data={values.description}
                    config={{toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ], placeholder: "Vyjadřuje zcela subjektivní pocit ze studentovy práce."}}
                    onInit={ editor => {  } }
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        setFieldValue("description", data, true);
                    } }
                    onBlur={ ( event, editor ) => {
                    } }
                    onFocus={ ( event, editor ) => {
                    } }
                />
                <ErrorMessage name="description">{msg => <FormError>{msg}</FormError>}</ErrorMessage>
            </FormGroup>
            <FormTextInput name="points" label="Počet bodů" type="number" placeholder="10" min="0" />
            <div>
                <Button type="submit" variant="primary" disabled={!((isValid) || isSubmitting)}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                <Button onClick={()=>{setEditMode(false); setGlobalEditing(false);}}>Zpět</Button>
            </div>
            </Form>
        )}
        </Formik>
    );
}

export default Edit;