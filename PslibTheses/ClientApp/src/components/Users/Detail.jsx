import React, {useEffect, useCallback, useState} from 'react';
import { useParams, Link } from "react-router-dom";
import { useFetch, Loader, Alert, CardContainer, Card, CardHeader, CardBody, Subheading, CardTypeValueList, CardTypeValueItem, ActionLink, Paragraph, PageTitle, Table, TableBody, TableRow, DataCell } from "../general";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import {EVALUATOR_ROLE} from "../../configuration/constants";
import axios from "axios";

const PersonalDetail = ({data}) => {
    return(
            <>
            <CardHeader><Subheading>Obecné informace</Subheading></CardHeader>
            <CardBody>
                <CardTypeValueList>
                    <CardTypeValueItem type="Jméno" value={data.firstName} />
                    <CardTypeValueItem type="Prostřední jméno" value={data.middleName} />
                    <CardTypeValueItem type="Příjmení" value={data.lastName} />
                    <CardTypeValueItem type="Může vypracovávat práci" value={data.canBeAuthor ? "ano" : "ne"}/>
                    <CardTypeValueItem type="Může hodnotit práci" value={data.canBeEvaluator ? "ano" : "ne"} />
                    {data.iconImage ? <CardTypeValueItem type="Ikona" value={<img src={"data:" + data.iconImageFormat + ";base64," + data.iconImage} alt="" />} /> : ""}
                    {data.email ? <CardTypeValueItem type="Email" value={<a href={"mailto:" + data.email}>{data.email}</a>} /> : ""}
                </CardTypeValueList>
            </CardBody>
            </>
        );
}

const PersonalOffer = props => {
    const {response, error, isLoading} = useFetch(process.env.REACT_APP_API_URL + "/users/" + props.id + "/offers",{
        method: "GET",
        headers: {
            Authorization: "Bearer " + props.accessToken,
            "Content-Type": "application/json"
        }
    });
    if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru uživatele nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámý uživatel"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }        
    } else if (response) {
        return (
            <>
            <CardBody>
            {Array.isArray(response) && response.length > 0 
            ?
                <Table width="100%">
                    <TableBody>
                    {response.map((item, index)=>(
                        <TableRow key={index}>
                            <DataCell>
                                <Link to={"/ideas/" + item.id}>{item.name}</Link>
                            </DataCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            :
                <Paragraph>Uživatel nic nenabízí</Paragraph>
            }
            </CardBody>
            </>
        );
    } else {
        return <Loader />;
    };  
}

const AuthoredWorks = props => {
    const {response, error, isLoading} = useFetch(process.env.REACT_APP_API_URL + "/users/" + props.id + "/works",{
        method: "GET",
        headers: {
            Authorization: "Bearer " + props.accessToken,
            "Content-Type": "application/json"
        }
    });
    if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru uživatele nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámý uživatel"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }        
    } else if (response) {
        return (
            <>
            <CardBody>
            {Array.isArray(response) && response.length > 0 
            ?
                <Table width="100%">
                    <TableBody>
                    {response.map((item, index)=>(
                    <TableRow key={index}>
                        <DataCell><Link to={"/works/" + item.id}>{item.name}</Link></DataCell>                    
                    </TableRow>
                    ))}
                    </TableBody>
                </Table>
            :
                <Paragraph>Uživatel není autorem žádné práce</Paragraph>
            }
            </CardBody>
            </>
        );
    } else {
        return <Loader />;
    };  
}

const AuthoredIdeas = props => {
    const {response, error, isLoading} = useFetch(process.env.REACT_APP_API_URL + "/users/" + props.id + "/ideas",{
        method: "GET",
        headers: {
            Authorization: "Bearer " + props.accessToken,
            "Content-Type": "application/json"
        }
    });
    if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru uživatele nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámý uživatel"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }        
    } else if (response) {
        return (
            <>
            <CardBody>
            {Array.isArray(response) && response.length > 0 
            ?
                <Table width="100%">
                    <TableBody>
                    {response.map((item, index)=>(
                    <TableRow key={index}>
                        <DataCell><Link to={"/ideas/" + item.id}>{item.name}</Link></DataCell>                    
                    </TableRow>
                    ))}
                    </TableBody>
                </Table>
            :
                <Paragraph>Uživatel není autorem žádného námětu</Paragraph>
            }
            </CardBody>
            </>
        );
    } else {
        return <Loader />;
    };  
}

export const Detail = props => {
    const { id } = useParams();
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Detail uživatele"}); },[dispatch]);
    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/users/" + id,{
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
        });
        setIsLoading(false);
    },[accessToken, id]);
    useEffect(()=>{fetchData();},[fetchData]);
    if (isLoading) {
        return <Loader size="2em"/>;
    } else if (error !== false) {
        switch (error.status)
        {
            case 400: return <Alert text={"Nesprávný formát identifikátoru nebo jiná chyba požadavku"} variant="error"/>;
            case 404: return <Alert text={"Neznámý námět"} variant="error"/>;
            default: return <Alert text={error.text + " (" + error.status + ")"} variant="error"/>;
        }        
    } else if (response) {
        return (
            <>
            <>
                <ActionLink to="/users">Seznam</ActionLink>
            </>
            <PageTitle>{response.name}</PageTitle> 
            <CardContainer>
                <Card>
                    <PersonalDetail id={id} data={response}/>
                </Card>
                <Card>
                    <CardHeader><Subheading>Autorství prací</Subheading></CardHeader>
                    <AuthoredWorks id={id} accessToken={accessToken}/>
                </Card>
                <Card>
                    <CardHeader><Subheading>Autorství námětů</Subheading></CardHeader>
                    <AuthoredIdeas id={id} accessToken={accessToken}/>
                </Card>
                {profile && profile[EVALUATOR_ROLE] === "1"
                ?
                <Card>
                    <CardHeader><Subheading>Nabídka námětů</Subheading></CardHeader>
                    <PersonalOffer id={id} accessToken={accessToken}/>
                </Card>
                :
                ""
                }
            </CardContainer>
            </>        
        );
    } else {
        return <Loader size="2em" />;
    };
};

export default Detail;