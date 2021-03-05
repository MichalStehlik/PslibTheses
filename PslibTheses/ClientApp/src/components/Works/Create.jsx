import React, {useState, useEffect, useCallback} from 'react';
import { Formik, ErrorMessage } from 'formik';
import { Alert, FormTextInput, FormGroup, FormSelect, Button, Label, Form, CardContainer, Card, ActionLink } from "../general";
import {useHistory} from "react-router-dom";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import Axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import requireEvaluator from "../Auth/requireEvaluator";

export const Create = props => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    const [sets, setSets] = useState(null);
    const [authors, setAuthors] = useState(null);
    const [evaluators, setEvaluators] = useState(null);
    let history = useHistory();

    const fetchSetsData = useCallback(() => {
        Axios.get(process.env.REACT_APP_API_URL + "/sets?active=true",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setSets(response.data.data);
        })
    },[accessToken]);
    const fetchAuthorsData = useCallback(() => {
        Axios.get(process.env.REACT_APP_API_URL + "/users?author=true",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setAuthors(response.data.data);
        })
    },[accessToken]);
    const fetchEvaluatorsData = useCallback(() => {
        Axios.get(process.env.REACT_APP_API_URL + "/users?evaluator=true",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setEvaluators(response.data.data);
        })
    },[accessToken]);

    useEffect(()=>{ 
        dispatch({type: SET_TITLE, payload: "Nová práce"});
        setFailed(false);
        fetchSetsData();
        fetchAuthorsData();
        fetchEvaluatorsData();
        setOk(false); 
    },[dispatch]);
    return (
        <>
        <ActionLink to=".">Seznam</ActionLink>
        <CardContainer>
            <Card>
            <Formik
            initialValues={{
                name: "",
                description: "",
                resources: "",
                subject: "",
                classname: "",
                repositoryURL: "",
                authorid: "",
                managerid: "",
                setid: ""
            }}
            validate={values=>{
                let errors = {};
                if (!values.name) errors.name = "Vyplňte název námětu";
                if (!values.description) errors.description = "Vyplňte popis námětu";
                if (!values.subject) errors.subject = "Vyplňte předmět, kam námět spadá";
                if (!values.description) errors.description = "Vyplňte popis námětu";
                if (!values.classname) errors.classname = "Vyplňte třídu autora";
                if (!values.setid) errors.setid = "Práce musí být v aktivní sadě";
                if (!values.authorid) errors.authorid = "Práce musí mít autora";
                if (!values.managerid) errors.managerid = "Práce musí mít vedoucího";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.post(process.env.REACT_APP_API_URL + "/works", {
                    Name: values.name,
                    Description: values.description,
                    Subject: values.subject,
                    Resources: values.resources,
                    ClassName: values.classname,
                    RepositoryURL: values.repositoryURL,
                    AuthorId: values.authorid,
                    ManagerId: values.managerid,
                    SetId: Number(values.setid),
                    RepositoryURL: values.repositoryURL,
                    UserId: profile.sub
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    history.push("/works/" + response.data.id);
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
                    {(failed !== false) ? <Alert text={"Uložení práce se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                    {(ok !== false) ? <Alert text={"Uložení práce se podařilo."}  variant="success" /> : ""}
                    <FormTextInput name="name" label="Název" placeholder="Neviditelné perpetuum mobile" />
                    <FormTextInput name="subject" label="Zkratka předmětu nebo předmětů, kam práce spadá" placeholder="FYZ" />
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
                    <FormTextInput name="classname" label="Třída" placeholder="L4" />
                    <FormTextInput name="repositoryURL" label="Odkaz na repozitář" placeholder="https://github.com" />
                    <Button size="9px" onClick={e=>{
                        let foundSet = sets.find(s=>s.id == values.setid);
                        let set = foundSet !== undefined ? foundSet.name : "";
                        set = set.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[\W_]+/g,"-");
                        let foundAuthor = authors.find(a=>a.id == values.authorid);
                        let author = foundAuthor !== undefined ? foundAuthor.name : "";
                        author = author.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[\W_]+/g,"-");
                        let name = values.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[\W_]+/g,"-");
                        setFieldValue("repositoryURL","https://github.com/pslib-cz/" + set + "_" + author + "_" + name);
                        e.preventDefault();
                    }}>Vygenerovat název repozitáře</Button>
                    <FormSelect name="authorid" label="Autor" placeholder="xxxxxxxx">
                    <option></option>
                        {Array.isArray(authors) ? authors.map((item,index) => (<option key={index} value={item.id}>{item.name + " (" + item.email + ")"}</option>)) : ""}
                    </FormSelect>
                    <FormSelect name="managerid" label="Odpovědný vedoucí práce" placeholder="xxxxxxxxx">
                        <option></option>
                        {Array.isArray(evaluators) ? evaluators.map((item,index) => (<option key={index} value={item.id}>{item.name + " (" + item.email + ")"}</option>)) : ""}
                    </FormSelect>
                    <FormSelect name="setid" label="Sada" placeholder="1">
                        <option></option>
                        {Array.isArray(sets) ? sets.map((item,index) => (<option key={index} value={item.id}>{item.name}</option>)) : ""}
                    </FormSelect>
                    <div>
                        <Button type="submit" variant="primary" disabled={!((dirty && isValid) || isSubmitting)}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                        <Button onClick={()=>{history.push("/works")}}>Zpět</Button>
                    </div>
                </Form>
                )}            
                </Formik>
            </Card>
        </CardContainer>
        </>
    );
};

export default requireEvaluator(Create);