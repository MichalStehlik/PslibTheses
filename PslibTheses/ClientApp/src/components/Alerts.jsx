import React, { useEffect } from 'react';
import { Heading } from "./general";
import {useAppContext, DISMISS_MESSAGE, CLEAR_MESSAGES, SET_TITLE} from "../providers/ApplicationProvider";
import {Alert, Button} from "./general";

const Alerts = props => {
    const [{messages}, dispatch] = useAppContext();
    useEffect(()=>{
        dispatch({type: SET_TITLE, payload: "Aktuální upozornění"});
    },[dispatch]);
    return (
        <>
        <Heading>Upozornění</Heading>
        <div>
            <Button onClick={(e)=>{dispatch({type: CLEAR_MESSAGES})}}>Zrušit vše</Button>
        </div>
        {messages.map((item, index) => (
            <Alert key={index} text={item.text} variant={item.variant} dismissible={item.dismissible} expiration={item.expiration} dismiss={() => dispatch({type: DISMISS_MESSAGE, id: index})} />
        ))}
        </>
    );
}

export default Alerts;