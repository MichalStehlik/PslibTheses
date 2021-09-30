import React from 'react';
import {useAppContext} from "../providers/ApplicationProvider";
import {ReactComponent as BellIcon} from "../assets/icons/bell.svg";
import {ReactComponent as RingingIcon} from "../assets/icons/bell_ringing.svg";
import {ReactComponent as UserIcon} from "../assets/icons/user.svg";
import { Loader } from "./general";
import NavigationLink from "./common/NavigationLink";
import User from "./common/User";
import styled from 'styled-components';

const StyledHeaderPanel = styled.nav`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: stretch;
color: ${props => props.theme.colors.headerForeground};
& a {
    color: ${props => props.theme.colors.headerForeground};
}
`;

const StyledBellIcon = styled(BellIcon)`
fill: ${props => props.theme.colors.headerForeground};
stroke: ${props => props.theme.colors.headerForeground};
`;

const StyledRingingIcon = styled(RingingIcon)`
fill: ${props => props.theme.colors.headerForeground};
stroke: ${props => props.theme.colors.headerForeground};
`;

const StyledUserIcon = styled(UserIcon)`
fill: ${props => props.theme.colors.headerForeground};
`;

const StyledMessageCount = styled.span`
color: ${props => props.theme.colors.headerForeground};
`;

const HeaderLink = styled(NavigationLink)`
color: ${props => props.theme.colors.headerForeground};
`;

const HeaderPanel = props => {
    const [{accessToken, profile, messageCounter, isUserLoading, profileIcon, profileIconType}] = useAppContext();
    return (
        <StyledHeaderPanel>
            <HeaderLink to="/alerts">
                {messageCounter > 0 ? <StyledRingingIcon height="24px" /> : <StyledBellIcon height="24px" />}
                <StyledMessageCount>{messageCounter}</StyledMessageCount>
            </HeaderLink>
            <HeaderLink to="/account">
            {(isUserLoading === true)
                ?
                <Loader />
                :
                accessToken === null 
                    ? 
                    <StyledUserIcon height="18px" />
                    : 
                    <User image={profileIcon ? <img src={"data:" + profileIconType + ";base64," + profileIcon} alt={profile.name} /> : ""} name={profile.name} detail={profile.preferred_username} />
            }
            </HeaderLink>          
        </StyledHeaderPanel>
    );
}

export default HeaderPanel;