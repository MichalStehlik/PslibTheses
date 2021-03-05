import React, {useState, useEffect} from 'react';
import { Formik, ErrorMessage } from 'formik';
import { Alert, FormTextInput, FormGroup, Button, Label, Form, CardContainer, Card, ActionLink } from "../general";
import {useHistory} from "react-router-dom";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import requireAuth from "../Auth/requireAuth";

export const Create = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    let history = useHistory();
    useEffect(()=>{ 
        dispatch({type: SET_TITLE, payload: "Nový námět"});
        setFailed(false);
        setOk(false); },[dispatch]);
    return (
        <>
        <ActionLink to=".">Seznam</ActionLink>
        <CardContainer>
            <Card>
            <Formik
            initialValues={{
                name: "",
                description: "",
                participants: 1,
                resources: "",
                subject: "",
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
                Axios.post(process.env.REACT_APP_API_URL + "/ideas", {
                    Name: values.name,
                    Description: values.description,
                    Subject: values.subject,
                    Participants: values.participants,
                    Resources: values.resources
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    history.push("/ideas/" + response.data.id + "/onBoarding/1");
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
                    {(failed !== false) ? <Alert text={"Vytvoření námětu se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                    {(ok !== false) ? <Alert text={"Vytvoření námětu se podařilo."}  variant="success" /> : ""}
                    <FormTextInput name="name" label="Název" placeholder="Neviditelné perpetuum mobile" />
                    <FormGroup>
                        <Label htmlFor="description">Téma</Label>
                        <CKEditor
                            editor={ Editor }
                            data={values.description}
                            config={{toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ], placeholder: "Práce se zabývá vytvořením stroje vykonajícího práci bez vnějšího zdroje energie způsobem, jaký svět zatím nikdy neviděl."}}
                            onInit={ editor => {
                            } }
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
                        <Button type="submit" variant="primary" disabled={!(isValid && dirty) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                        <Button onClick={e => {history.push("/ideas")}}>Zpět</Button>
                    </div>
                </Form>
                )}            
                </Formik>
            </Card>
        </CardContainer>
        </>
    );
};

export default requireAuth(Create);