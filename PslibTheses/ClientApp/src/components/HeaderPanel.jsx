import React from 'react';
import {useAppContext} from "../providers/ApplicationProvider";
import {ReactComponent as BellIcon} from "../assets/icons/bell.svg";
import {ReactComponent as RingingIcon} from "../assets/icons/bell_ringing.svg";
import {ReactComponent as UserIcon} from "../assets/icons/user.svg";
import { Loader } from "./general";
import NavigationLink from "./common/NavigationLink";
import User from "./common/User";
import styled from 'styled-components';
//import theme from "styled-theming";

const StyledHeaderPanel = styled.nav`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: stretch;
background-color: ${props => props.theme.colors.menuBackground};
`;

const HeaderLink = styled(NavigationLink)`
`;

const HeaderPanel = props => {
    const [{accessToken, profile, messageCounter, isUserLoading, profileIcon, profileIconType}] = useAppContext();
    return (
        <StyledHeaderPanel>
            <HeaderLink to="/alerts">
                {messageCounter > 0 ? <RingingIcon height="24px" /> : <BellIcon height="24px" />}
                <span>{messageCounter}</span>
            </HeaderLink>
            <HeaderLink to="/account">
            {(isUserLoading === true)
                ?
                <Loader />
                :
                accessToken === null 
                    ? 
                    <UserIcon height="18px" />
                    : 
                    <User image={profileIcon ? <img src={"data:" + profileIconType + ";base64," + profileIcon} alt={profile.name} /> : ""} name={profile.name} detail={profile.preferred_username} />
            }
            </HeaderLink>          
        </StyledHeaderPanel>
    );
}

export default HeaderPanel;