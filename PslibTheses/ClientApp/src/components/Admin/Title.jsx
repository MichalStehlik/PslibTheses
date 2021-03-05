import React, {useEffect} from 'react';
import { PageTitle } from "../general";
import {Link} from "react-router-dom";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";

const Title = props => {
    const [,dispatch] = useAppContext();
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Úvodní stránka"}); },[dispatch]);
    return (
        <>
        <PageTitle>Administrativní rozhraní</PageTitle>
        <ul>
            <li><Link to="/admin/targets">Cíle</Link></li>
            <li><Link to="/admin/sets">Sady</Link></li>
            <li><Link to="/admin/scales">Škály</Link></li>
            <li><Link to="/admin/users">Uživatelé</Link></li>
        </ul>
        </>
    );
}

export default Title;