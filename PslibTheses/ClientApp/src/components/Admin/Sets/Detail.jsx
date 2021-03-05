import React, {useState, useEffect, useCallback} from 'react';
import { useParams } from "react-router-dom";
import { CardContainer, Card, ActionLink, Alert, Loader, PageTitle, Subheading, Table, TableBody, TableRow, DataCell, CardHeader, CardBody } from "../../general";
import {useAppContext, SET_TITLE} from "../../../providers/ApplicationProvider";
import {Link} from "react-router-dom";
import axios from "axios";
import Edit from "./Edit";
import Display from "./Display";
import Content from "./Content";

export const Detail = props => {
    const { id } = useParams();
    const [{accessToken}, dispatch] = useAppContext();
    const [editing, setEditing] = useState(false);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [worksResponse, setWorksResponse] = useState(null);
    const [worksCount, setWorksCount] = useState(null);
    const [isWorksLoading, setIsWorksLoading] = useState(false);
    const [worksError, setWorksError] = useState(false);
    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id,{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setResponse(response.data);
        })
        .catch(error => {
            if (error.response) {
                setError({status: error.response.status, text: error.response.statusText});
            }
            else
            {
                setError({status: 0, text: "Neznámá chyba"});
            }         
            setResponse([]);
        })
        .then(()=>{
            setIsLoading(false);
        });      
    },[accessToken, id]);  
    const fetchWorks = useCallback(() => {
        setIsWorksLoading(true);
        setWorksError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id + "/works",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setWorksResponse(response.data);
        })
        .catch(error => {
            if (error.response) {
                setWorksError({status: error.response.status, text: error.response.statusText});
            }
            else
            {
                setWorksError({status: 0, text: "Neznámá chyba"});
            }         
            setWorksResponse([]);
        })
        .then(()=>{
            setIsWorksLoading(false);
        });      
    },[accessToken, id]);
    const fetchWorksCount = useCallback(() => {
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + id + "/works/count",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setWorksCount(response.data);
        })
        .catch(error => {
            setWorksCount(null);
        });      
    },[accessToken, id]);
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Detail sady"}); },[dispatch]);
    useEffect(()=>{
        fetchData();
        fetchWorksCount();
        fetchWorks();
    },[]);
    if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámá sada"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }        
    } else if (response) {
        return (
            <>
            <ActionLink to="..">Administrace</ActionLink>
            <ActionLink to=".">Seznam</ActionLink>
            <PageTitle>{response.name}</PageTitle> 
            <CardContainer>
                <Card>
                {editing ? <Edit data={response} id={id} switchEditMode={setEditing} fetchData={fetchData} /> : <Display data={response} id={id} switchEditMode={setEditing} worksCount={worksCount} />}
                </Card>
                <Card>
                    <Content id={id} worksCount={worksCount}/>
                </Card>
                <Card>
                    <CardHeader>
                    <Subheading>Seznam prací</Subheading>
                    </CardHeader>
                    <CardBody>
                        <Table width="100%"><TableBody>
                        {isWorksLoading
                        ?
                        <TableRow>
                            <DataCell>
                                <Loader />
                            </DataCell>
                        </TableRow>
                        :
                            worksError
                            ?
                            <TableRow>
                                <DataCell>
                                <Alert variant="error" text="Chyba při získávání seznamu prací." />
                                </DataCell>
                            </TableRow>
                            :
                            worksResponse.map((item, index) => (
                                <TableRow key={index}>
                                    <DataCell><Link to={"/works/" + item.id}>{item.name}</Link></DataCell>
                                    <DataCell>{item.className}</DataCell>
                                </TableRow>
                            ))
                        }
                        </TableBody></Table>
                    </CardBody>
                </Card>
            </CardContainer>
            </>
        );
        
    } else {
        return <Loader size="2em" />;
    };
};

export default Detail;