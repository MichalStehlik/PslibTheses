import React, {useState} from 'react';
import { Formik, ErrorMessage } from 'formik';
import {useAppContext} from "../../../../providers/ApplicationProvider";
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import {Form, Alert, FormTextInput, FormGroup, Label, Button, FormError, FormCheckbox} from "../../../general";

const EditAnswer = props => {
    const [{accessToken}] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);

    return (
        <Formik
            initialValues={{
                text: props.value.text,
                description: props.value.description,
                rating: Number(props.value.rating),
                critical: props.value.critical
            }}
            validate={values=>{
                let errors = {};
                if (!values.text) errors.text = "Vyplňte text možnosti";
                if (values.rating === "") errors.rating = "Vyplňte podíl bodů";
                if (Number(values.rating) < 0) errors.rating = "Podíl bodů nemůže být záporný";
                if (Number(values.rating) > 100) errors.rating = "Podíl bodů nemůže být více než 100%";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.put(process.env.REACT_APP_API_URL + "/sets/" + props.setId + "/answers/" + props.value.id, {
                    Id: props.value.Id,
                    Text: values.text,
                    Description: values.description,
                    Rating: Number(values.rating),
                    Critical: values.critical
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    props.fetchData();
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
            {(failed !== false) ? <Alert text={"Uložení odpovědi se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
            {(ok !== false) ? <Alert text={"Uložení odpovědi se podařilo."}  variant="success" /> : ""}
            <FormTextInput name="text" label="Text" placeholder="Student pracoval velmi dobře." />
            <FormGroup>
                <Label htmlFor="description">Popis</Label>
                <CKEditor
                    editor={ Editor }
                    data={values.description}
                    config={{toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ], placeholder: "Jeho práci nelze nic vytknout."}}
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
            <FormTextInput name="rating" label="Podíl na hodnocení v procentech" type="number" placeholder="100" min="0" max="100" />
            <FormCheckbox name="critical" label="Kritická odpověď" />
            <div>
                <Button type="submit" variant="primary" disabled={!((isValid) || isSubmitting)}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                <Button onClick={()=>{props.setEditMode(false)}}>Zpět</Button>
            </div>
            </Form>
        )}
        </Formik>
    );
}

export default EditAnswer;