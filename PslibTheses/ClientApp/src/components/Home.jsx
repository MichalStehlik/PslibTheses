import React, {useEffect} from 'react';
import styled from 'styled-components';
import { Heading, Button } from "./general";

import {useAppContext, SET_TITLE} from "../providers/ApplicationProvider";

const TitleContainer = styled.div`
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    height: 100%;
`;

const TitleBlock = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const FrontTitle = styled(Heading)`
    margin: 0;
    margin-bottom: .5em;
`;

const OwnerTitle = styled.p`
    color: ${props => props.theme.colors.menuBackground};
    font-size: 2rem;
    margin: 0;
    margin-bottom: 30px;
`;

const Home = props => {
    const [{accessToken, userManager, profile}, dispatch] = useAppContext();
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Úvodní stránka"}); },[dispatch]);
    return (
        <TitleContainer>
            <TitleBlock>
                <FrontTitle>Dlouhodobé práce</FrontTitle>
                <OwnerTitle>na SPŠSE a VOŠ Liberec</OwnerTitle>
                {accessToken
                    ? <Button variant="error" onClick={() => { userManager.signoutRedirect() }} >Odhlásit</Button>
                    : <Button variant="success" onClick={() => { userManager.signinRedirect() }} >Přihlásit</Button>}
            </TitleBlock>
        </TitleContainer>
    );
}

export default Home;