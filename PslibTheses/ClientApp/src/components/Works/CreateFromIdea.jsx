import React, {useState, useEffect, useCallback} from 'react';
import { Formik } from 'formik';
import { Alert, FormTextInput, FormSelect, Button, Form, CardContainer, Card, ActionLink, CardTypeValueList, CardTypeValueItem } from "../general";
import { useHistory, useParams } from "react-router-dom";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import axios from 'axios';
import requireEvaluator from "../Auth/requireEvaluator";

export const CreateFromIdea = props => {
    const { id } = useParams();
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    const [sets, setSets] = useState(null);
    const [authors, setAuthors] = useState(null);
    const [evaluators, setEvaluators] = useState(null);
    const [idea, setIdea] = useState(null);
    const [ideaGoals, setIdeaGoals] = useState(null);
    const [ideaOutlines, setIdeaOutlines] = useState(null);
    const fetchIdeaData = useCallback(() => {
        axios.get(process.env.REACT_APP_API_URL + "/ideas/" + id,{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setIdea(response.data);
        })
    },[accessToken, id]);
    const fetchIdeaGoalsData = useCallback(() => {
        axios.get(process.env.REACT_APP_API_URL + "/ideas/" + id + "/goals",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setIdeaGoals(response.data);
        })
    },[accessToken, id]);
    const fetchIdeaOutlinesData = useCallback(() => {
        axios.get(process.env.REACT_APP_API_URL + "/ideas/" + id + "/outlines",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setIdeaOutlines(response.data);
        })
    },[accessToken, id]);

    let history = useHistory();

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
        dispatch({type: SET_TITLE, payload: "Nov?? pr??ce z existuj??c??ho n??m??tu"});
        setFailed(false);
        fetchSetsData();
        fetchAuthorsData();
        fetchEvaluatorsData();
        fetchIdeaData();
        fetchIdeaGoalsData();
        fetchIdeaOutlinesData();
        setOk(false); 
    },[dispatch]);
    return (
        <>
        <ActionLink to="/works">Seznam</ActionLink>
        <CardContainer>
            <Card>
            {idea && ideaGoals && ideaOutlines
            ?
            <CardTypeValueList style={{padding: ".5em"}}>
                <CardTypeValueItem type="N??m??t" value={idea.name} />
                <CardTypeValueItem type="Popis" value={<span dangerouslySetInnerHTML={{__html: idea.description }} />} />
                <CardTypeValueItem type="P??edm??t" value={idea.subject} />
                <CardTypeValueItem type="Po??et c??l??" value={Array.isArray(ideaGoals) ? ideaGoals.length : 0} />
                <CardTypeValueItem type="Po??et bod?? osnovy" value={Array.isArray(ideaOutlines) ? ideaOutlines.length : 0} />
            </CardTypeValueList>
            :           
            <Alert text="Data n??m??tu nejsou spr??vn?? na??ten??." variant="warning" />
            }
            <Formik
            initialValues={{
                classname: "",
                repositoryURL: "",
                authorid: "",
                managerid: "",
                setid: ""
            }}
            validate={values=>{
                let errors = {};
                if (!values.classname) errors.classname = "Vypl??te t????du autora";
                if (!values.setid) errors.setid = "Pr??ce mus?? b??t v aktivn?? sad??";
                if (!values.authorid) errors.authorid = "Pr??ce mus?? m??t autora";
                if (!values.managerid) errors.managerid = "Pr??ce mus?? m??t vedouc??ho";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                axios.post(process.env.REACT_APP_API_URL + "/works", {
                    Name: idea.name,
                    Description: idea.description,
                    Subject: idea.subject,
                    Resources: idea.resources,
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
                    let workId = response.data.id;
                    let goalsTexts = ideaGoals.map((item) => (item.text));
                    axios.post(process.env.REACT_APP_API_URL + "/works/" + workId + "/goals/all", goalsTexts
                    , {
                        headers: {
                            Authorization: "Bearer " + accessToken,
                            "Content-Type": "application/json"
                        }
                    });
                    let outlinesTexts = ideaOutlines.map((item) => (item.text));
                    axios.post(process.env.REACT_APP_API_URL + "/works/" + workId + "/outlines/all", outlinesTexts
                    , {
                        headers: {
                            Authorization: "Bearer " + accessToken,
                            "Content-Type": "application/json"
                        }
                    });
                    setOk(true);
                    setFailed(false);
                    history.push("/works/" + workId);
                })
                .catch(error => {
                    if (error.response)
                        {
                            setFailed(error.response.status);
                        }
                        else
                        {
                            setFailed("Nezn??m?? chyba");
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
                    {(failed !== false) ? <Alert text={"Ulo??en?? pr??ce se nepoda??ilo. (" + failed + ")"}  variant="error" /> : ""}
                    {(ok !== false) ? <Alert text={"Ulo??en?? pr??ce se poda??ilo."}  variant="success" /> : ""}
                    <FormTextInput name="classname" label="T????da" placeholder="L4" />
                    <FormTextInput name="repositoryURL" label="Odkaz na repozit????" placeholder="https://github.com" />
                    <Button size="9px" onClick={e=>{
                        let foundSet = sets.find(s=>s.id == values.setid);
                        let set = foundSet !== undefined ? foundSet.name : "";
                        set = set.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[\W_]+/g,"-");
                        let foundAuthor = authors.find(a=>a.id == values.authorid);
                        let author = foundAuthor !== undefined ? foundAuthor.name : "";
                        author = author.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[\W_]+/g,"-");
                        let name = idea.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[\W_]+/g,"-");
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
                        <Button type="submit" variant="primary" disabled={!((dirty && isValid && idea) || isSubmitting)}>{!isSubmitting ? "Ulo??it" : "Pracuji"}</Button>
                        <Button onClick={()=>{history.push("/works")}}>Zp??t</Button>
                    </div>
                </Form>
                )}            
                </Formik>
            </Card>
        </CardContainer>
        </>
    );
};

export default requireEvaluator(CreateFromIdea);