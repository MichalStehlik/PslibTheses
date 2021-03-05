import React, {useState, useEffect} from 'react';
import { Formik, ErrorMessage } from 'formik';
import { Alert, FormGroup, Button, Label, Form, FormTextInput } from "../general";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import requireAuth from "../Auth/requireAuth";

export const Edit = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    useEffect(()=>{ 
        setFailed(false);
        setOk(false);
     },[dispatch]);
    return (
        <Formik
        initialValues={{
            name: props.data.name ? props.data.name : "",
            description: props.data.description ? props.data.description : "",
            participants: props.data.participants ? props.data.participants : 1,
            resources: props.data.resources ? props.data.resources : "",
            subject: props.data.subject ? props.data.subject : "",
        }}
        validate={values=>{
            let errors = {};
            if (!values.name) errors.name = "Vyplňte název námětu";
            if (!values.description) errors.description = "Vyplňte popis námětu";
            if (!values.subject) errors.subject = "Vyplňte předmět, kam námět spadá";
            if (!values.description) errors.description = "Vyplňte popis námětu";
            if (!values.participants) errors.participants = "Vyplňte počet studentů, kteří mohou na zadání spolupracovat";
            return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            Axios.put(process.env.REACT_APP_API_URL + "/ideas/" + props.data.id, {
                Id: Number(props.id),
                Name: values.name,
                Description: values.description,
                Subject: values.subject,
                Participants: values.participants,
                Resources: values.resources,
                UserId: props.data.userId
            }, {
                headers: {
                    Authorization: "Bearer " + accessToken,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                setOk(true);
                setFailed(false);
                dispatch({type: ADD_MESSAGE, text: "Námět byl uložen.", variant: "success", dismissible: true, expiration: 3});
                props.switchEditMode(false);
                props.fetchData();
            })
            .catch(error => {
                if (error.response)
                    {
                        dispatch({type: ADD_MESSAGE, text: "Uložení námětu se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                        setFailed(error.response.status);
                    }
                    else
                    {
                        dispatch({type: ADD_MESSAGE, text: "Uložení námětu se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                        setFailed("Neznámá chyba");
                    }
                    setOk(false);
            })
            .then(()=>{
                setSubmitting(false); 
            });
        }}
    >
            {({isSubmitting, errors, touched, values, setFieldValue, handleBlur, isValid, dirty}) => (
            <Form>
                {(failed !== false) ? <Alert text={"Uložení námětu se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                {(ok !== false) ? <Alert text={"Uložení námětu se podařilo."}  variant="success" /> : ""}
                <FormTextInput name="name" label="Název" placeholder="Neviditelné perpetuum mobile" />
                <FormGroup>
                    <Label htmlFor="description">Téma</Label>
                    <CKEditor
                        editor={ Editor }
                        data={values.description}
                        config={{toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ], placeholder: "Práce se zabývá vytvořením stroje vykonajícího práci bez vnějšího zdroje energie způsobem, jaký svět zatím nikdy neviděl."}}
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
                    <ErrorMessage name="description">{msg => <Alert variant="error" text={msg} />}</ErrorMessage>
                </FormGroup>
                <FormTextInput name="resources" label="Prostředky" placeholder="Kruhová klícka, křeček, zrní, černé plátno, funkční kouzelná hůlka" />
                <FormTextInput name="subject" label="Zkratka předmětu nebo předmětů, kam práce spadá" placeholder="FYZ" />
                <FormTextInput name="participants" label="Počet řešitelů" placeholder="7" type="number" min="1" max="10" />
                <div>
                    <Button type="submit" variant="primary" disabled={!(isValid || isSubmitting)}>{!isSubmitting ? "Uložení" : "Pracuji"}</Button>
                    <Button onClick={()=>{props.switchEditMode(false)}}>Zpět</Button>
                </div>
            </Form>
            )}            
            </Formik>
    )
};

export default requireAuth(Edit);