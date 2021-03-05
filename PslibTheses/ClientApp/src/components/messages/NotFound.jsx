import React from 'react';
import {Container, Heading, Paragraph, Message} from "../general";
import {ReactComponent as InfoIcon} from "../../assets/icons/info_circle.svg";
import {mainTheme as theme} from "../../App";

const NotFound = props => {
    return (
        <Message color={theme.colors.infoForeground} backgroundColor={theme.colors.infoBackground}>
            <Heading>Nenalezeno</Heading>
            <Container>
                <InfoIcon fill={theme.colors.infoForeground} stroke={theme.colors.infoForeground} width="80" height="80" />
            </Container>
            <Paragraph>Požadovaná informace se v této aplikaci nenachází.</Paragraph>
        </Message>
    );
};

export default NotFound;