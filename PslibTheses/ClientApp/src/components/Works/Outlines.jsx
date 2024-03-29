import React, {useState, useEffect, useCallback} from 'react';
import {DragItemsList} from "../common";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Loader, Paragraph, CardBody } from "../general";
import axios from "axios";

const Outlines = ({ isEditable, id }) => {
    const [{accessToken}, dispatch] = useAppContext();
    const [ list, setList ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const fetchOutlines = useCallback(() => {
        setIsLoading(true);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id + "/outlines",{
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
    },[accessToken, id]);

    const addOutline = useCallback((item) => {
        axios.post(process.env.REACT_APP_API_URL + "/works/" + id + "/outlines",{text: item},{
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
    },[id, dispatch, fetchOutlines, accessToken]);

    const removeOutline = useCallback((itemId) => {
        axios.delete(process.env.REACT_APP_API_URL + "/works/" + id + "/outlines/" + itemId, {
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
    },[id, accessToken, dispatch, fetchOutlines]);

    const updateOutline = useCallback((itemId, item) => {
        axios.put(process.env.REACT_APP_API_URL + "/works/" + id + "/outlines/" + itemId, 
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
    },[id, accessToken, dispatch, fetchOutlines]);

    const moveOutline = useCallback((from, to) => {
        axios.put(process.env.REACT_APP_API_URL + "/works/" + id + "/outlines/" + from + "/moveto/" + to,{},{
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
    },[id, accessToken, dispatch, fetchOutlines]);

    useEffect(()=>{ fetchOutlines(); },[fetchOutlines]);
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