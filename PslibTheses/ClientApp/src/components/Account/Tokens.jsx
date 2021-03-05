import React from 'react';
import {useAppContext} from "../../providers/ApplicationProvider";
import requireAuth from "../Auth/requireAuth";
import {Heading, CodeBlock} from "../general";

const Tokens = props => {
const [{accessToken, idToken, profile}] = useAppContext();
    return (
        <>
            <Heading>Access Token</Heading>
            <CodeBlock>{accessToken}</CodeBlock>
            <Heading>Id Token</Heading>
            <CodeBlock>{idToken}</CodeBlock>
            <Heading>Načtený profil</Heading>
            <CodeBlock>{JSON.stringify(profile, null, 4)}</CodeBlock>
        </>
    );
}

export default requireAuth(Tokens);