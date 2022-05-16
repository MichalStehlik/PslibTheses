import React, { useEffect} from 'react';
import { useAppContext, SET_TITLE } from "../../providers/ApplicationProvider";
import {Button, Card, CardContainer, CardHeader, CardBody, Subheading, CardTypeValueList, CardTypeValueItem} from "../general";

const Profile = props => {
    const [{ accessToken, userManager, profile, profileIcon, profileIconType }, dispatch] = useAppContext();
    useEffect(() => { dispatch({ type: SET_TITLE, payload: "Uživatelský profil" }); }, [dispatch]);
    if (accessToken)
    {
        return (
            <>
                <CardContainer>
                <Card>
                    <CardHeader><Subheading>Profil</Subheading></CardHeader>
                    <CardBody>
                        <CardTypeValueList>
                            <CardTypeValueItem type="ID" value={profile.sub} />
                            <CardTypeValueItem type="Jméno" value={profile.given_name} />
                            <CardTypeValueItem type="Prostřední jméno" value={profile.middle_name} />
                            <CardTypeValueItem type="Příjmení" value={profile.family_name} />
                            <CardTypeValueItem type="Uživatelské jméno" value={profile.preferred_username} />
                            <CardTypeValueItem type="Email" value={profile.email} />
                            <CardTypeValueItem type="Pohlaví" value={profile.gender} />
                            <CardTypeValueItem type="Ikona" value={profileIcon ? <img src={"data:" + profileIconType + ";base64," + profileIcon} alt="" /> : "není"} />
                        </CardTypeValueList>
                    </CardBody>
                </Card>
                </CardContainer>
            </>
        );
    }
    else
    {
        return (
            <>
                <Button onClick={() => {userManager.signinRedirect()}}>Přihlásit</Button>
            </>
        );
    }
}

export default Profile;