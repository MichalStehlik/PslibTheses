import React from 'react';
import {Container, Heading, Paragraph, Button, Message} from "../general";
import {ReactComponent as BlockedIcon} from "../../assets/icons/warning_circle.svg";
import {useAppContext} from "../../providers/ApplicationProvider";
import {mainTheme as theme} from "../../App";

const Unauthorized = props => {
    const [{userManager}] = useAppContext();
    return (
        <Message color={theme.colors.warningForeground} backgroundColor={theme.colors.warningBackground}>
            <Heading>Nepřihlášený uživatel</Heading>
            <Container>
                <BlockedIcon width="80" height="80" fill={theme.colors.warningForeground} stroke={theme.colors.warningForeground} />
            </Container>
            <Paragraph>K přístupu k této činnosti je nutné se přihlásit.</Paragraph>
            <Button variant="light" outline onClick={() => {userManager.signinRedirect()}}>Přihlásit</Button>
        </Message>
    );
};

export default Unauthorized;