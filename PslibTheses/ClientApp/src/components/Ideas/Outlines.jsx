import React, {useState, useEffect, useCallback} from 'react';
import {DragItemsList} from "../common";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Loader, Paragraph, CardBody } from "../general";
import {ADMIN_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";
import axios from "axios";

const Outlines = props => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [ list, setList ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isEditable, setIsEditable ] = useState(true);
    const fetchOutlines = useCallback(() => {
        setIsLoading(true);
        axios.get(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/outlines",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setList(response.data);
        })
        .catch(error => {
            setList([])
        });
        setIsLoading(false);
    },[accessToken, props.id]);

    const addOutline = useCallback((item) => {
        axios.post(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/outlines",{text: item},{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Bod osnovy byl přidán", variant: "success", dismissible: true, expiration: 3});
            fetchOutlines();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během přidávání bodu osnovy došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[props.id, dispatch, fetchOutlines, accessToken]);

    const removeOutline = useCallback((id) => {
        axios.delete(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/outlines/" + id, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Bod osnovy byl odstraněn", variant: "success", dismissible: true, expiration: 3});
            setList([]);
            fetchOutlines();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během odstraňování bodu osnovy došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[props.id, accessToken, dispatch, fetchOutlines]);

    const updateOutline = useCallback((id, item) => {
        axios.put(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/outlines/" + id, 
            {
                text: item
            }, 
            {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Bod osnovy byl aktualizován", variant: "success", dismissible: true, expiration: 3});
            setList([]);
            fetchOutlines();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během aktualizace bod osnovy došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[props.id, accessToken, dispatch, fetchOutlines]);

    const moveOutline = useCallback((from, to) => {
        axios.put(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/outlines/" + from + "/moveto/" + to,{},{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Pořadí bodů osnovy bylo změněno", variant: "success", dismissible: true, expiration: 3});
            setList([]);
            fetchOutlines();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během změny pořadí bodů osnovy došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[props.id, accessToken, dispatch, fetchOutlines]);

    useEffect(()=>{ fetchOutlines(); },[fetchOutlines]);
    useEffect(()=>{ 
        setIsEditable((profile !== null) && ((profile.sub === props.owner || profile[ADMIN_ROLE] === "1" || profile[EVALUATOR_ROLE] === "1")));
     },[accessToken, profile, props.owner]);
    return(
        <>
        <CardBody>
        {isLoading 
        ? <Loader /> 
        :
            <>
            <Paragraph>Osnova shrnuje veškeré kroky, které student bude muset učinit, aby dosáhl cílů práce: co bude muset nastudovat, vyrobit, promyslet.</Paragraph>
            <DragItemsList items={list} editable={isEditable} addItemAction={addOutline} removeItemAction={removeOutline} updateItemAction={updateOutline} moveItemAction={moveOutline} itemType="outline" />
            </>
        }        
        </CardBody>
        </>
    );
}

export default Outlines;