import React, {useState, useEffect} from 'react';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { Button, Subheading, Label, Alert, Loader, CodeBlock, PageTitle, Input, Select} from "./general";
import {useAppContext, SET_TITLE} from "../providers/ApplicationProvider";
import {devices} from "../configuration/layout";
import styled from 'styled-components';
import axios from "axios";

const ConsoleGrid = styled.div`
display: grid;
grid-template-areas: 
    "method-label server-label command-label ."
    "method-field server-field command-field submit" 
    "method-error server-error command-error ." 
    "auth . . ."
    "payload-label payload-label payload-label payload-label" 
    "payload-field payload-field payload-field payload-field";
grid-template-columns: 1fr 1fr 4fr auto;
grid-row-gap: .5rem;
grid-template-rows: auto;
@media ${devices.tablet} {
    grid-template-columns: 1fr 1fr auto;
    grid-template-areas: 
        "method-label server-label command-label"
        "method-field server-field command-field" 
        "method-error server-error command-error" 
        "payload-label payload-label payload-label" 
        "payload-field payload-field payload-field"
        "auth auth submit"
        ;
    }
`;

const MethodLabel = styled(Label)`
grid-area: method-label;
`;

const ServerLabel = styled(Label)`
grid-area: server-label;
`;

const CommandLabel = styled(Label)`
grid-area: command-label;
`;

const AuthField = styled(Field)`

`;

const AuthLabel = styled(Label)`
grid-area: auth;
`;

const MethodField = styled(Field)`
grid-area: method-field;
`;

const ServerField = styled(Field)`
grid-area: server-field;
`;

const CommandField = styled(Field)`
grid-area: command-field;
width: auto;
`;

const SubmitButton = styled(Button)`
grid-area: submit;
display: block;
`;

const MethodError = styled(Alert)`
grid-area: method-error;
`;

const ServerError = styled(Alert)`
grid-area: server-error;
`;

const CommandError = styled(Alert)`
grid-area: command-error;
`;

const PayloadLabel = styled(Label)`
grid-area: payload-label;
`;

const PayloadField = styled(Field)`
grid-area: payload-field;
width: auto;
`;

const Console = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [status, setStatus] = useState("nic");
    const [ok, setOk] = useState(false);
    const [error, setError] = useState(false);
    const [response, setResponse] = useState(null);
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Konzola pro manipulaci s API"}); },[dispatch]);
    return (
        <>
        <PageTitle text="Konzola API" />
            <Formik 
            initialValues={{
                method: "GET",
                server: "API",
                command: "",
                payload: "{}",
                authorized: true,
                color: "blue" 
            }}
            validate={values=>{
                let errors = {};
                if (!values.method) errors.method = "Zvolte metodu";
                if (!values.command) errors.command = "Uveďte cestu";
                if (!values.server) errors.server = "Vyberte server";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                setOk(false);
                setError(false);
                let commandConfig = {
                    method: values.method,
                    url: (values.server === "API" ? process.env.REACT_APP_API_URL : process.env.REACT_APP_AUTH_URL) + "/" + values.command,
                    data: values.method !== "GET" ? values.payload : "",
                    headers: {
                        Authorization: (values.authorized === true? "Bearer " + accessToken : ""),
                        "Content-Type": "application/json"
                    }
                };
                axios(commandConfig)
                .then(response => {
                    console.log(response.data);
                    setOk(true);
                    setResponse(response.data);
                    setStatus(response.status);
                })
                .catch(error => {
                    setError(true);
                    if (error.response)
                    {
                        setResponse(error.response);
                        setStatus(error.response.status);
                    }
                    else
                    {
                        setResponse(null);
                        setStatus("???");
                    }                   
                }).then(()=>{
                    setSubmitting(false);
                });
            }}
            >
                {({isSubmitting, errors, touched, values, setFieldValue}) => (
                <Form>
                    <ConsoleGrid>
                        <MethodLabel htmlFor="method">Metoda</MethodLabel>
                        <MethodField name="method" forwardedAs="select" className={errors.method ? "danger" : (touched.method ? "success" : "")} placeholder="Zvolte metodu" >
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                        </MethodField>
                        <ServerLabel htmlFor="method">Server</ServerLabel>
                        <ServerField name="server" forwardedAs="select">
                            <option>API</option>
                            <option>AUTH</option>
                        </ServerField>
                        <ErrorMessage name="method">{msg => <MethodError variant="error" text={msg} />}</ErrorMessage>
                        <ErrorMessage name="command">{msg => <CommandError variant="error" text={msg} />}</ErrorMessage>
                        <ErrorMessage name="server">{msg => <ServerError variant="error" text={msg} />}</ErrorMessage>
                        <CommandLabel htmlFor="command">Příkaz</CommandLabel>
                        <CommandField type="text" name="command" className={errors.command ? "danger" : (touched.command ? "success" : "")} />
                        <AuthLabel htmlFor="authorized">Ověřovat <AuthField type="checkbox" name="authorized" className={errors.authorized ? "danger" : (touched.authorized ? "success" : "")} checked={values.authorized} onChange={() => setFieldValue("authorized", !values.authorized)} /></AuthLabel>
                        <PayloadLabel htmlFor="method">Metoda</PayloadLabel>
                        <PayloadField forwardedAs="textarea" name="payload" className={errors.payload ? "danger" : (touched.payload ? "success" : "")} />
                        {isSubmitting ? <Loader />  :<SubmitButton type="submit">Odeslat</SubmitButton>}
                    </ConsoleGrid>
                </Form>
            )}
            </Formik>
                <Subheading>Výsledek: {status}</Subheading>
                {ok === true ? <Alert variant="success" text="Příkaz proběhl v pořádku." /> : ""}
                {error === true ? <Alert variant="error" text="Pří zpracování příkazu došlo k chybě." /> : ""}
                <pre>
                    <CodeBlock>{JSON.stringify(response, null, 4)}</CodeBlock>
                </pre>
        </>

    );
}

export default Console;