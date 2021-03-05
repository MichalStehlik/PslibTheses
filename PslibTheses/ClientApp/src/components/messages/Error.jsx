import React from 'react';
import {Container, Heading, Paragraph, Message} from "../general";
import {ReactComponent as ErrorIcon} from "../../assets/icons/bug.svg";
import {mainTheme as theme} from "../../App";

const Error = props => {
    return (
        <Message color={theme.colors.errorForeground} backgroundColor={theme.colors.errorBackground}>
            <Heading>Chyba</Heading>
            <Container>
            <ErrorIcon fill={theme.colors.errorForeground} stroke={theme.colors.errorForeground} width="80" height="80" />
            </Container>
            <Paragraph>Něco se stalo.</Paragraph>
        </Message>
    );
};

export default Error;