import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import { Formik, ErrorMessage } from 'formik';
import {useAppContext} from "../../../../providers/ApplicationProvider";
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import {AddMiniButton, Card, Form, Alert, FormTextInput, FormGroup, Label, Button, FormError, CardHeader, Subheading} from "../../../general";

const StyledCreateFormHidden = styled.span`
    text-align: center;
`;

export const Create = props => {
    const [{accessToken}] = useAppContext();
    const [expand, setExpand] = useState(false);
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    if (expand)
    {
        return (
            <Card>
                <CardHeader>
                    <Subheading>Nová otázka</Subheading>
                </CardHeader>
                <Formik
                    initialValues={{
                        text: "",
                        description: "",
                        points: 0
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
                        Axios.post(process.env.REACT_APP_API_URL + "/sets/" + props.setId + "/questions/" + props.termId + "/" + props.roleId, {
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
                            setOk(true);
                            setFailed(false);
                            setExpand(false);
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
                        <Button type="submit" variant="primary" disabled={!((dirty && isValid) || isSubmitting)}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                        <Button onClick={()=>{setExpand(false)}}>Zpět</Button>
                    </div>
                    </Form>
                )}
                </Formik>
            </Card>
        );
    }
    else
    {
        return <StyledCreateFormHidden><AddMiniButton onClick={e => {setExpand(true);setOk(false);setFailed(false);}} /></StyledCreateFormHidden>
    }
    
}

export default Create;