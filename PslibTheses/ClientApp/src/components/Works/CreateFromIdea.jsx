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
        dispatch({type: SET_TITLE, payload: "Nová práce z existujícího námětu"});
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
                <CardTypeValueItem type="Námět" value={idea.name} />
                <CardTypeValueItem type="Popis" value={<span dangerouslySetInnerHTML={{__html: idea.description }} />} />
                <CardTypeValueItem type="Předmět" value={idea.subject} />
                <CardTypeValueItem type="Počet cílů" value={Array.isArray(ideaGoals) ? ideaGoals.length : 0} />
                <CardTypeValueItem type="Počet bodů osnovy" value={Array.isArray(ideaOutlines) ? ideaOutlines.length : 0} />
            </CardTypeValueList>
            :           
            <Alert text="Data námětu nejsou správně načtená." variant="warning" />
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
                if (!values.classname) errors.classname = "Vyplňte třídu autora";
                if (!values.setid) errors.setid = "Práce musí být v aktivní sadě";
                if (!values.authorid) errors.authorid = "Práce musí mít autora";
                if (!values.managerid) errors.managerid = "Práce musí mít vedoucího";
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
                    <FormTextInput name="classname" label="Třída" placeholder="L4" />
                    <FormTextInput name="repositoryURL" label="Odkaz na repozitář" placeholder="https://github.com" />
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
                        <Button type="submit" variant="primary" disabled={!((dirty && isValid && idea) || isSubmitting)}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
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

export default requireEvaluator(CreateFromIdea);