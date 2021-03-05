import React, {useState, useEffect, useCallback} from 'react';
import { useParams } from "react-router-dom";
import {useAppContext, SET_TITLE} from "../../../../providers/ApplicationProvider";
import {ActionLink, Alert, PageTitle, CardContainer, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Loader} from "../../../general";
import styled from 'styled-components';
import axios from "axios";
import QuestionsList from "./QuestionsList";
import Create from "./Create";

const StyledQuestionsLayout = styled.span`
    display: flex;
    flex-direction: column;
    max-width: 70em;
`;

export const Questions = props => {
    const { id } = useParams();
    const { term } = useParams();
    const { role } = useParams();
    const [{accessToken}, dispatch] = useAppContext();
    const [isSetLoading, setIsSetLoading] = useState(false);
    const [setError, setSetError] = useState(false);
    const [setData, setSetData] = useState(null);
    const [isTermLoading, setIsTermLoading] = useState(false);
    const [termError, setTermError] = useState(false);
    const [termData, setTermData] = useState(null);
    const [isRoleLoading, setIsRoleLoading] = useState(false);
    const [roleError, setRoleError] = useState(false);
    const [roleData, setRoleData] = useState(null);
    const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
    const [questionsError, setQuestionsError] = useState(false);
    const [questionsData, setQuestionsData] = useState(null);
    
    const fetchSetData = useCallback(id => {
        setIsSetLoading(true);
        setSetError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
            setSetData(response.data);
        })
        .catch(err => {
            if (err.response)
            {
                setSetError({text:  err.response.statusText, status: err.response.status});
            }
            else
            {
                setSetError({text:  "Neznámá chyba", status: ""});
            }
            setSetData(null);
        })
        .then(()=>{
            setIsSetLoading(false);
        });  
    },[accessToken]);
    const fetchTermData = useCallback((id, termId) => {
        setIsTermLoading(true);
        setTermError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id + "/terms/" + termId, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
            setTermData(response.data);
        })
        .catch(err => {
            if (err.response)
            {
                setTermError({text:  err.response.statusText, status: err.response.status});
            }
            else
            {
                setTermError({text:  "Neznámá chyba", status: ""});
            }
            setTermData(null);
        })
        .then(()=>{
            setIsTermLoading(false);
        });  
    },[accessToken]);
    const fetchRoleData = useCallback((id,roleId) => {
        setIsRoleLoading(true);
        setRoleError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id + "/roles/" + roleId, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
            setRoleData(response.data);
        })
        .catch(err => {
            if (err.response)
            {
                setRoleError({text:  err.response.statusText, status: err.response.status});
            }
            else
            {
                setRoleError({text:  "Neznámá chyba", status: ""});
            }
            setRoleData(null);
        })
        .then(()=>{
            setIsRoleLoading(false);
        });  
    },[accessToken]);
    const fetchQuestionsData = useCallback((id,termId,roleId) => {
        setIsQuestionsLoading(true);
        setQuestionsError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id + "/questions/" + termId + "/" + roleId, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
            setQuestionsData(response.data);
        })
        .catch(err => {
            if (err.response)
            {
                setQuestionsError({text:  err.response.statusText, status: err.response.status});
            }
            else
            {
                setQuestionsError({text:  "Neznámá chyba", status: ""});
            }
            setQuestionsData(null);
        })
        .then(()=>{
            setIsQuestionsLoading(false);
        });  
    },[accessToken]);
    useEffect(() => {
        fetchSetData(id);
        fetchRoleData(id, role);
        fetchTermData(id, term);
        fetchQuestionsData(id, term, role);
        dispatch({type: SET_TITLE, payload: "Otázky v sadě"});
    },[id, term, role]);
    return (
        <>
            <ActionLink to="/admin/">Administrace</ActionLink>
            <ActionLink to="/admin/sets">Sady</ActionLink>
            <ActionLink to={"/admin/sets/" + id}>Tato sada</ActionLink>
            <StyledQuestionsLayout>
            {(setData && termData && roleData) ? 
            <>
                <Card>
                    <CardHeader>
                        <Heading>Sada, termín a role</Heading>
                    </CardHeader>
                    <CardBody>
                        <CardTypeValueList>
                            <CardTypeValueItem type="Sada" value={setData.name} />
                            <CardTypeValueItem type="Termín" value={termData.name} />
                            <CardTypeValueItem type="Role" value={roleData.name} />
                        </CardTypeValueList>
                    </CardBody>
                </Card>
                {isQuestionsLoading 
                ?
                <Loader size="2em"/>
                :
                    <>
                    <QuestionsList data={questionsData} setId={id} roleId={role} termId={term} fetchData={() => {fetchQuestionsData(setData.id,termData.id,roleData.id)}} />
                    <Create setId={setData.id} termId={termData.id} roleId={roleData.id} fetchData={() => {fetchQuestionsData(setData.id,termData.id,roleData.id)}} />
                    </>
                }
                
            </>
            :
            (setError || termError || roleError || questionsError) ?
            <>
                {setError ? <Alert variant="error" text="Při získávání dat sady došlo k chybě." /> : ""}
                {termError ? <Alert variant="error" text="Při získávání dat termínu došlo k chybě." /> : ""}
                {roleError ? <Alert variant="error" text="Při získávání dat role došlo k chybě." /> : ""}
                {questionsError ? <Alert variant="error" text="Při získávání seznamu otázek došlo k chybě." /> : ""}
            </>
            :
            <Loader size="2em"/>
            }
            </StyledQuestionsLayout>
        </>
    );
}

export default Questions;