import React, { useState, useEffect } from 'react';
import { useAppContext, ADD_MESSAGE } from "../../../providers/ApplicationProvider";
import { Alert, Button, Card, CardHeader, CardBody, Form, FormGroup, Subheading, Loader } from "../../general";
import axios from "axios";
import { Formik, ErrorMessage } from 'formik';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';

const Text = ({ work, role }) => {
    const [{ accessToken }, dispatch] = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    const storeTextReview = (values) => {
        setIsSaving(true);
        axios.put(process.env.REACT_APP_API_URL + "/works/" + work.id + "/roles/" + role.id + "/review", {
            WorkId: Number(work.id),
            WorkRoleId: Number(role.id),
            Review: values.review
        }, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                dispatch({ type: ADD_MESSAGE, text: "Posudek byl uložen.", variant: "success", dismissible: true, expiration: 3 });
            })
            .catch(error => {
                if (error.response) {
                    dispatch({ type: ADD_MESSAGE, text: "Uložení posudku se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                }
                else {
                    dispatch({ type: ADD_MESSAGE, text: "Uložení posudku se nepodařilo.", variant: "error", dismissible: true, expiration: 3 });
                }
            })
            .then(() => {
                setIsSaving(false);
            });
    }
    return (
        <Card>
            <CardHeader>
                <Subheading>Text posudku</Subheading>
            </CardHeader>
            <CardBody>
                <Formik
                    initialValues={{
                        review: role.review ? role.review : "",
                    }}
                    validate={values => {
                        let errors = {};
                        return errors;
                    }}
                    onSubmit={async (values, { setSubmitting }) => {
                        setSubmitting(true);
                        storeTextReview(values);
                        setSubmitting(false);
                    }}
                >
                    {({ isSubmitting, errors, touched, values, setFieldValue, handleBlur, isValid, dirty }) => (
                        <Form>
                            <FormGroup>
                                <CKEditor
                                    editor={Editor}
                                    type="inline"
                                    data={values.review}
                                    config={
                                        {
                                            toolbar: [
                                                'bold', 'italic', '|',
                                                'link', '|',
                                                'bulletedList', 'numberedList', '|',
                                                'insertTable', '|',
                                            ], placeholder: "Jeden až několik stručných odstavců."
                                        }
                                    }
                                    onInit={editor => { }}
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        setFieldValue("review", data, true);
                                    }}
                                    onBlur={(event, editor) => {
                                    }}
                                    onFocus={(event, editor) => {
                                    }}
                                />
                                <ErrorMessage name="review">{msg => <Alert variant="error" text={msg} />}</ErrorMessage>
                            </FormGroup>
                            <div>
                                <Button type="submit" variant="primary" disabled={!(isValid || isSubmitting)}>{!isSubmitting ? "Uložení" : "Pracuji"}</Button>
                                {isSaving ? <Loader /> : null}
                            </div>
                        </Form>
                    )}
                </Formik>
            </CardBody>
        </Card>
        );
}

export default Text;