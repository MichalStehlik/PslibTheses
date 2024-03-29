import React, {useState, useEffect, useCallback} from 'react';
import {DragItemsList} from "../common";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Loader, Paragraph, CardBody } from "../general";
import axios from "axios";

const Goals = ({ isEditable, id }) => {
    const [{accessToken}, dispatch] = useAppContext();
    const [ list, setList ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);

    const fetchGoals = useCallback(() => {
        setIsLoading(true);
        axios.get(process.env.REACT_APP_API_URL + "/works/" + id + "/goals",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setList(response.data);
        })
        .catch(error => {
            if (error.response)
            {
                dispatch({type: ADD_MESSAGE, text: "Během získávání cílů došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
            }
            else
            {
                dispatch({type: ADD_MESSAGE, text: "Během získávání cílů došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
            };           
            setList([]);
        });
        setIsLoading(false);
    },[accessToken, id, dispatch]);

    const addGoal = useCallback((item) => {
        axios.post(process.env.REACT_APP_API_URL + "/works/" + id + "/goals",{text: item},{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Cíl byl přidán", variant: "success", dismissible: true, expiration: 3});
            setList([]);
            fetchGoals();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během přidávání cíle došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[id, accessToken, dispatch, fetchGoals]);

    const removeGoal = useCallback((itemId) => {
        axios.delete(process.env.REACT_APP_API_URL + "/works/" + id + "/goals/" + itemId, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Cíl byl odstraněn", variant: "success", dismissible: true, expiration: 3});
            setList([]);
            fetchGoals();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během odstraňování cíle došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[id, accessToken, dispatch, fetchGoals]);

    
    const moveGoal = useCallback((from, to) => {
        axios.put(process.env.REACT_APP_API_URL + "/works/" + id + "/goals/" + from + "/moveto/" + to,{},{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Pořadí cílů bylo změněno", variant: "success", dismissible: true, expiration: 3});
            setList([]);
            fetchGoals();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během změny pořadí cílů došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[id, accessToken, dispatch, fetchGoals]);

    const updateGoal = useCallback((itemId, item) => {
        axios.put(process.env.REACT_APP_API_URL + "/works/" + id + "/goals/" + itemId, 
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
            dispatch({type: ADD_MESSAGE, text: "Cíl byl aktualizován", variant: "success", dismissible: true, expiration: 3});
            setList([]);
            fetchGoals();
        })
        .catch(error => {
            dispatch({type: ADD_MESSAGE, text: "Během aktualizace cíle došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
        });
    },[id, accessToken, dispatch, fetchGoals]);

    useEffect(()=>{ fetchGoals(); },[fetchGoals]);
    return(
        <>
        <CardBody>
        {isLoading 
        ? <Loader /> 
        :
            <>
            <Paragraph>Cíle popisují vše, co v práci v době jejího odevzdání má být hotovo a odevzdáno.</Paragraph>
            <DragItemsList items={list} editable={isEditable} addItemAction={addGoal} removeItemAction={removeGoal} updateItemAction={updateGoal} moveItemAction={moveGoal} itemType="goal" />
            </>
        }        
        </CardBody>
        </>
    );
}

export default Goals;