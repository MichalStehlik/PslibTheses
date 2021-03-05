import React from 'react';
import {Container, Heading, Paragraph, Button, Message} from "../general";
import {ReactComponent as BlockedIcon} from "../../assets/icons/warning_hex.svg";
import {useAppContext} from "../../providers/ApplicationProvider";
import {mainTheme as theme} from "../../App";

const AccessDenied = props => {
    const [{userManager}] = useAppContext();
    return (
        <Message color={theme.colors.errorForeground} backgroundColor={theme.colors.errorBackground}>
            <Heading>Přístup odepřen</Heading>
            <Container>
                <BlockedIcon fill={theme.colors.errorForeground} stroke={theme.colors.errorForeground} width="80" height="80" />
            </Container>
            <Paragraph>K přístupu k této činnosti Vaše práva nestačí.</Paragraph>
            <Button variant="light" outline onClick={() => {userManager.signoutRedirect()}}>Odhlásit</Button>
        </Message>
    );
};

export default AccessDenied;