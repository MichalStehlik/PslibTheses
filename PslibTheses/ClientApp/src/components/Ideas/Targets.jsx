import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Loader, Paragraph, CardBody, Badge } from "../general";
import {invertColor} from "../../helpers/colors";
import {ADMIN_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";
import axios from "axios";

const StyledTargetsCollection = styled.div`
`;

const TargetsCollection = props => {
    return (
        <StyledTargetsCollection>
        {(Array.isArray(props.items) && props.items.length > 0) 
        ? props.items.map((item, index) => (
            <Badge key={index} style={{cursor: "pointer"}} background={"#" + item.color.name.substring(2,8)} color={invertColor("#" + item.color.name.substring(2,8))} onClick={(e) => { props.action(props.idea, item.id)}}>{item.text}</Badge>
        ))
        : "žádné"
        }
        </StyledTargetsCollection>
    );
}

const Targets = props => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [ usedTargets, setUsedTargets ] = useState([]);
    const [ unusedTargets, setUnusedTargets ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isEditable, setIsEditable ] = useState(true);
    const fetchTargets = useCallback(() => {
        setIsLoading(true);
        axios.get(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/targets",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setUsedTargets(response.data);
        })
        .catch(error => {
            setUsedTargets([])
        });
        axios.get(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/unusedtargets",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setUnusedTargets(response.data);
        })
        .catch(error => {
            setUnusedTargets([])
        });
        setIsLoading(false);
    },[accessToken, props.id]);
    useEffect(()=>{ fetchTargets(); },[fetchTargets]);
    useEffect(()=>{ 
        setIsEditable((profile !== null) && ((profile.sub === props.owner || profile[ADMIN_ROLE] === "1" || profile[EVALUATOR_ROLE] === "1")));
     },[accessToken, profile,props.owner]);
    return(
        <>
        <CardBody>
        {isLoading 
        ? <Loader /> 
        :
            <>
            <Paragraph>Námět je určen pro tyto skupiny:</Paragraph>
            <TargetsCollection items={usedTargets} idea={props.id} action={isEditable ? (idea, target) => {
                axios.delete(process.env.REACT_APP_API_URL + "/ideas/" + idea + "/targets/" + target,{
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    dispatch({type: ADD_MESSAGE, text: "Cílová skupina byla odebrána", variant: "success", dismissible: true, expiration: 3});
                    fetchTargets();
                })
                .catch(error => {
                    dispatch({type: ADD_MESSAGE, text: "Odebrání skupiny se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                });
            } : () => {} } />
            {isEditable 
            ?
                <>
                <Paragraph>Lze přidat pro tyto skupiny:</Paragraph>
                <TargetsCollection items={unusedTargets} idea={props.id} action={isEditable ? (idea, target) => {
                axios.post(process.env.REACT_APP_API_URL + "/ideas/" + idea + "/targets",{id: target},{
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    dispatch({type: ADD_MESSAGE, text: "Cílová skupina byla přidána", variant: "success", dismissible: true, expiration: 3});
                    fetchTargets();
                })
                .catch(error => {
                    dispatch({type: ADD_MESSAGE, text: "Přidání skupiny se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                });
            } : () => {} } />
                </>
            :
                ""
            }
            
            </>
        }        
        </CardBody>
        </>
    );
}

export default Targets;