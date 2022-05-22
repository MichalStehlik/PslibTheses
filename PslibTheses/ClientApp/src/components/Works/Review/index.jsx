import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useAppContext, SET_TITLE, ADD_MESSAGE } from "../../../providers/ApplicationProvider";
import {
    ActionLink, Alert, CardContainer, Card, CardHeader, CardBody,
    CardTypeValueList, CardTypeValueItem, Heading, Loader,
    Button, Form, FormGroup, Subheading, useInterval
} from "../../general";
import LoadedUser from "../../common/LoadedUser";
import { Formik, ErrorMessage } from 'formik';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import axios from "axios";
import requireEvaluator from "../../Auth/requireEvaluator";
import Mark from "./Mark";
import Questions from "./Questions";

const Review = props => {
    const { id } = useParams();
    const { role } = useParams();
    const [{ accessToken }, dispatch] = useAppContext();
    const [isWorkLoading, setIsWorkLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [workError, setWorkError] = useState(false);
    const [workData, setWorkData] = useState(null);
    const [review, setReview] = useState(null);
    const [roleData, setRoleData] = useState(null);
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const [roleError, setRoleError] = useState(false);

    const fetchWorkData = useCallback(id => {
        setIsWorkLoading(true);
        setWorkError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id, { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
            .then(response => {
                setWorkData(response.data);
            })
            .catch(err => {
                if (err.response) {
                    setWorkError({ text: err.response.statusText, status: err.response.status });
                }
                else {
                    setWorkError({ text: "Neznámá chyba", status: "" });
                }
                setWorkData(null);
            })
            .then(() => {
                setIsWorkLoading(false);
            });
    }, [accessToken]);
    const fetchRoleData = useCallback((workId, roleId) => {
        setIsRoleLoading(true);
        setRoleError(false);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + workId + "/roles/" + roleId, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setRoleData(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setRoleError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setRoleError({ status: 0, text: "Neznámá chyba" });
                }
                setRoleData([]);
            })
            .then(() => {
                setIsRoleLoading(false);
            })
    }, [accessToken]);

    const storeTextReview = () => {
        setIsSaving(true);
        axios.put(process.env.REACT_APP_API_URL + "/works/" + id + "/roles/" + role + "/review", {
            WorkId: Number(id),
            WorkRoleId: Number(role),
            Review: review
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

    useEffect(() => {
        fetchWorkData(id);
        dispatch({ type: SET_TITLE, payload: "Posudek práce" });
    }, [id, role, dispatch, fetchWorkData]);
    useEffect(() => {
        if (workData) {
            fetchRoleData(id, role);
        }
    }, [role, workData, fetchRoleData, id]);
    useEffect(() => {
        if (roleData)
            setReview(roleData.review);
    }, [roleData]);

    useInterval(() => { storeTextReview(); }, 3 * 60000);

    return (
        <>
            <ActionLink to={"/works/" + id}>Tato práce</ActionLink>
            <CardContainer>
            {(isWorkLoading || isRoleLoading)
                ?
                <Card>
                    <Loader size="2em" />
                </Card>
                :
                (workError || roleError)
                    ?
                    <>
                        {workError ? <Alert variant="error" text="Při získávání dat práce došlo k chybě." /> : ""}
                        {roleError ? <Alert variant="error" text="Při získávání dat role došlo k chybě." /> : ""}
                    </>
                    :
                    (workData && roleData)
                        ?
                        <>
                            <Card>
                                <CardHeader>
                                    <Heading>Závěrečné posouzení práce</Heading>
                                </CardHeader>
                                <CardBody>
                                    <CardTypeValueList>
                                        <CardTypeValueItem type="Práce" value={workData.name} />
                                        <CardTypeValueItem type="Autor" value={<LoadedUser id={workData.authorId} />} />
                                        <CardTypeValueItem type="Role" value={[roleData.setRole.name, " (", (roleData.finalized ? "Uzavřené hodnocení" : "Otevřené hodnocení"), ")"]} />
                                        <CardTypeValueItem type="Hodnotitelé" value={roleData.workRoleUsers.map((item, index) => (<LoadedUser key={index} id={item.userId} />))} />
                                    </CardTypeValueList>
                                </CardBody>
                            </Card>
                            {workData.state !== 1 && workData.state !== 3
                                ?
                                <Alert variant="warning" text="Práce není v hodnotitelném stavu." />
                                :
                                null
                            }
                            {role.finalized
                                ?
                                <Alert variant="info" text="´Hodnocení v této roli je uzavřené." />
                                :
                                null
                            }
                                {!role.finalized && !(workData.state !== 1 && workData.state !== 3)
                                    ?
                                    <>
                                        <Card>
                                            <CardHeader>
                                                <Subheading>Text posudku</Subheading>
                                            </CardHeader>
                                            <CardBody>
                                                <Formik
                                                    initialValues={{
                                                        review: review ? review : "",
                                                    }}
                                                    validate={values => {
                                                        let errors = {};
                                                        return errors;
                                                    }}
                                                    onSubmit={async (values, { setSubmitting }) => {
                                                        setSubmitting(true);
                                                        storeTextReview();
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
                                                                        setReview(data);
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
                                        <Questions work={workData} role={roleData} />
                                        <Mark work={workData} role={roleData} storeTextAction={storeTextReview} />
                                    </>
                                    :
                                    null
                                }
                        </>
                        :
                        <Loader size="2em" />
                }
                </CardContainer>
        </>
    );
}

export default requireEvaluator(Review);