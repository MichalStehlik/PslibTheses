import React, {useState, useEffect, useCallback} from 'react';
import { Formik, ErrorMessage } from 'formik';
import { Alert, FormGroup, Button, Label, Form, FormTextInput, FormSelect } from "../general";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import requireAuth from "../Auth/requireAuth";

export const Edit = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    const [sets, setSets] = useState(null);
    const [authors, setAuthors] = useState(null);
    const [evaluators, setEvaluators] = useState(null);
    const fetchSetsData = useCallback(() => {
        axios.get(process.env.REACT_APP_API_URL + "/sets?active=true",{
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
        axios.get(process.env.REACT_APP_API_URL + "/users?author=true",{
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
        axios.get(process.env.REACT_APP_API_URL + "/users?evaluator=true",{
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
        setFailed(false);
        setOk(false);
        fetchSetsData();
        fetchAuthorsData();
        fetchEvaluatorsData();
     },[dispatch]);
    return (
        <Formik
        initialValues={{
            name: props.data.name ? props.data.name : "",
            description: props.data.description ? props.data.description : "",
            resources: props.data.resources ? props.data.resources : "",
            subject: props.data.subject ? props.data.subject : "",
            classname: props.data.className ? props.data.className : "",
            repositoryURL: props.data.repositoryURL ? props.data.repositoryURL : "",
            authorid: props.data.authorId ? props.data.authorId : "",
            managerid: props.data.managerId ? props.data.managerId : "",
            setid: props.data.setId ? props.data.setId : ""
        }}
        validate={values=>{
            let errors = {};
            if (!values.name) errors.name = "Vypl??te n??zev n??m??tu";
            if (!values.description) errors.description = "Vypl??te popis n??m??tu";
            if (!values.subject) errors.subject = "Vypl??te p??edm??t, kam n??m??t spad??";
            if (!values.description) errors.description = "Vypl??te popis n??m??tu";
            if (!values.classname) errors.classname = "Vypl??te t????du autora";
            if (!values.setid) errors.setid = "Pr??ce mus?? b??t v aktivn?? sad??";
            if (!values.authorid) errors.authorid = "Pr??ce mus?? m??t uveden??ho autora";
            if (!values.managerid) errors.managerid = "Pr??ce mus?? m??t vedouc??ho";
            return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            axios.put(process.env.REACT_APP_API_URL + "/works/" + props.data.id + "/base", {
                Id: Number(props.id),
                Name: values.name,
                Description: values.description,
                Subject: values.subject,
                Resources: values.resources,
                ClassName: values.classname,
                RepositoryURL: props.data.repositoryURL,
                AuthorId: values.authorid,
                ManagerId: values.managerid,
                SetId: Number(values.setid),
                RepositoryURL: values.repositoryURL,
            }, {
                headers: {
                    Authorization: "Bearer " + accessToken,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                setOk(true);
                setFailed(false);
                dispatch({type: ADD_MESSAGE, text: "Pr??ce byla ulo??ena.", variant: "success", dismissible: true, expiration: 3});
                props.switchEditMode(false);
                props.fetchData();
            })
            .catch(error => {
                if (error.response)
                    {
                        dispatch({type: ADD_MESSAGE, text: "Ulo??en?? pr??ce se nepoda??ilo.", variant: "error", dismissible: true, expiration: 3});
                        setFailed(error.response.status);
                    }
                    else
                    {
                        dispatch({type: ADD_MESSAGE, text: "Ulo??en?? pr??ce se nepoda??ilo.", variant: "error", dismissible: true, expiration: 3});
                        setFailed("Nezn??m?? chyba");
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
                {(failed !== false) ? <Alert text={"Ulo??en?? pr??ce se nepoda??ilo. (" + failed + ")"}  variant="error" /> : ""}
                {(ok !== false) ? <Alert text={"Ulo??en?? pr??ce se poda??ilo."}  variant="success" /> : ""}
                <FormTextInput name="name" label="N??zev" placeholder="Neviditeln?? perpetuum mobile" />
                <FormTextInput name="subject" label="Zkratka p??edm??tu nebo p??edm??t??, kam pr??ce spad??" placeholder="FYZ" />
                <FormGroup>
                    <Label htmlFor="description">T??ma</Label>
                    <CKEditor
                        editor={Editor}
                        type="inline"
                        data={values.description}
                        config={
                            {toolbar: [ 'bold', 'italic', 'strike', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'table', '|', 'Paste' ], placeholder: "Pr??ce se zab??v?? vytvo??en??m stroje vykonaj??c??ho pr??ci bez vn??j????ho zdroje energie zp??sobem, jak?? sv??t zat??m nikdy nevid??l."}
                        }
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
                <FormTextInput name="resources" label="Prost??edky" placeholder="Kruhov?? kl??cka, k??e??ek, zrn??, ??ern?? pl??tno, funk??n?? kouzeln?? h??lka" />
                <FormTextInput name="classname" label="T????da" placeholder="L4" />
                <FormTextInput name="repositoryURL" label="Odkaz na repozit????" placeholder="https://github.com" />
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
                    }}>Vygenerovat n??zev repozit????e</Button>
                <FormSelect name="authorid" label="Autor" placeholder="xxxxxxxx">
                <option></option>
                    {Array.isArray(authors) ? authors.map((item,index) => (<option key={index} value={item.id}>{item.name + " (" + item.email + ")"}</option>)) : ""}
                </FormSelect>
                <FormSelect name="managerid" label="Odpov??dn?? vedouc?? pr??ce" placeholder="xxxxxxxxx">
                    <option></option>
                    {Array.isArray(evaluators) ? evaluators.map((item,index) => (<option key={index} value={item.id}>{item.name + " (" + item.email + ")"}</option>)) : ""}
                </FormSelect>
                <FormSelect name="setid" label="Sada" placeholder="1">
                    <option></option>
                    {Array.isArray(sets) ? sets.map((item,index) => (<option key={index} value={item.id}>{item.name}</option>)) : ""}
                </FormSelect>
                <div>
                    <Button type="submit" variant="primary" disabled={!(isValid || isSubmitting)}>{!isSubmitting ? "Ulo??en??" : "Pracuji"}</Button>
                    <Button onClick={()=>{props.switchEditMode(false)}}>Zp??t</Button>
                </div>
            </Form>
            )}            
            </Formik>
    )
};

export default requireAuth(Edit);