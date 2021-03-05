import React, {useState, useEffect, useCallback} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Loader, Paragraph, CardBody, CardFooter, Button, ButtonBlock } from "../general";
import {LoadedUser } from "../common";
import {useHistory} from "react-router-dom";
import {ADMIN_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";
import axios from "axios";

const Offers = props => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [ list, setList ] = useState([]);
    const [ offered, setOffered ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ isEditable, setIsEditable ] = useState(true);
    let history = useHistory();

    const fetchOffers = useCallback(() => {
        setIsLoading(true);
        axios.get(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/offers",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setList(response.data);
            let myOffer = false;
            for(let item of response.data)
            {
                if (item.id === profile.sub) myOffer = true;
            }
            setOffered(myOffer);
        })
        .catch(error => {
            if (error.response)
            {
                dispatch({type: ADD_MESSAGE, text: "Během získávání nabídek došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
            }
            else
            {
                dispatch({type: ADD_MESSAGE, text: "Během získávání nabídek došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
            };           
            setList([]);
        });
        setIsLoading(false);
    },[accessToken, props.id, dispatch, profile]);

    const addOffer = useCallback(() => {
        setIsLoading(true);
        axios.post(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/offers",{id: profile.sub}, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Vytvoření nabídky se podařilo", variant: "success", dismissible: true, expiration: 3});
            fetchOffers();
        })
        .catch(error => {
            if (error.response)
            {
                dispatch({type: ADD_MESSAGE, text: "Během vytváření nabídky došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
            }
            else
            {
                dispatch({type: ADD_MESSAGE, text: "Během vytváření nabídky došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
            }; 
        })
        .then(()=>{
            setIsLoading(false);
        }
        );
        setIsLoading(false);
    },[accessToken, props.id, dispatch, fetchOffers, profile]);

    const removeOffer = useCallback(() => {
        setIsLoading(true);
        axios.delete(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/offers/" + profile.sub, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Nabídka již neplatí.", variant: "success", dismissible: true, expiration: 3});
            fetchOffers();
        })
        .catch(error => {
            if (error.response)
            {
                dispatch({type: ADD_MESSAGE, text: "Během odstraňování nabídky došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
            }
            else
            {
                dispatch({type: ADD_MESSAGE, text: "Během odstraňování nabídky došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
            }; 
        })
        .then(()=>{
            setIsLoading(false);
        }
        );
        setIsLoading(false);
    },[accessToken, props.id, dispatch, fetchOffers, profile]);

    const removeAll = useCallback(() => {
        setIsLoading(true);
        axios.delete(process.env.REACT_APP_API_URL + "/ideas/" + props.id + "/offers", {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            dispatch({type: ADD_MESSAGE, text: "Nabídky již neplatí.", variant: "success", dismissible: true, expiration: 3});
            fetchOffers();
        })
        .catch(error => {
            if (error.response)
            {
                dispatch({type: ADD_MESSAGE, text: "Během odstraňování nabídek došlo k chybě. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
            }
            else
            {
                dispatch({type: ADD_MESSAGE, text: "Během odstraňování nabídek došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
            }; 
        })
        .then(()=>{
            setIsLoading(false);
        }
        );
        setIsLoading(false);
    },[accessToken, props.id, fetchOffers, dispatch]);

    useEffect(()=>{ fetchOffers(); },[fetchOffers]);
    useEffect(()=>{ 
        setIsEditable((profile !== null) && ((profile[ADMIN_ROLE] === "1" || profile[EVALUATOR_ROLE] === "1")));
     },[accessToken, profile]);
    return(
        <>
        <CardBody>
        {isLoading 
        ? <Loader /> 
        :
            (list.length === 0) 
            ? <Paragraph>Tento námět ke zpracování nyní nikdo nenabízí.</Paragraph>
            : 
            <div>
                {list.map((item, index) => (<LoadedUser key={index} id={item.id}/>))}
            </div>
        }      
        </CardBody>
        {isEditable 
        ? 
        <CardFooter>
            <ButtonBlock>
                {offered ? <Button onClick={removeOffer}>Zrušení mé nabídky</Button> : <Button onClick={addOffer}>Nabídnout</Button>}
                {(props.admin && (list.length > 0)) ? <Button onClick={removeAll}>Zrušení všech nabídek</Button> : ""}
                {(props.admin || props.evaluator) ? <Button onClick={e => {history.push("/works/create/" + props.id)}}>Vytvoření zadání práce</Button> : ""}
            </ButtonBlock>
        </CardFooter>
        : ""
        }
        </>
    );
}

export default Offers;