import React from 'react';
import styled from 'styled-components';
import {useAppContext} from "../providers/ApplicationProvider";
import NavigationLink from "./common/NavigationLink";
import {ReactComponent as WorkIcon} from "../assets/icons/graduate.svg";
import {ReactComponent as HomeIcon} from "../assets/icons/home3.svg";
import {ReactComponent as SearchIcon} from "../assets/icons/search.svg";
import {ReactComponent as IdeaIcon} from "../assets/icons/lightbulb.svg";
import {ReactComponent as OverviewIcon} from "../assets/icons/table2.svg";
import {ReactComponent as UserIcon} from "../assets/icons/user.svg";
import {ReactComponent as HammerIcon} from "../assets/icons/hammer.svg";
import {ReactComponent as EvaluationIcon} from "../assets/icons/check.svg";

import {devices} from "../configuration/layout";
import {ADMIN_ROLE} from "../configuration/constants";

const StyledMainMenu = styled.nav`
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    overflow: auto;
    width: 100%;
    
    @media ${devices.mobile} {
        flex-direction: row;
    }
`;

const StyledMainMenuItem = styled(NavigationLink)`
    flex-basis: 32px;
    padding: 5px 5px 5px 40px;
    justify-content: flex-start;

    &:before {
        top: 0;
        left: -100%;
    }
    &:hover:before {
        left: 0;
    }
    & > svg {
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
    }

    @media ${devices.tablet} {
        font-size: 0;
        & > svg {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 18px;
        }
    }
    @media ${devices.mobile} {
        &:before {
            bottom: -100%;
            left: 0;
            top: initial;        }
        &:hover:before {
            top: initial;
            bottom: 0;
        }
    }

    @media ${devices.mobile} {
        flex-direction: row;
    }
`;

const MainMenuItem = props => {
    let {icon, text, ...rest} = props;
    return <StyledMainMenuItem {...rest}>{icon}<span>{text}</span></StyledMainMenuItem>;
}

const MainMenu = props => {
    const [{accessToken, profile}] = useAppContext();
    return (
    <StyledMainMenu>
        <MainMenuItem to="/" exact icon={<SearchIcon />} text="Vyhledávání" />
        <MainMenuItem to="/ideas" icon={<IdeaIcon />} text="Náměty" />
        <MainMenuItem to="/works" icon={<WorkIcon />} text="Práce" />
        <MainMenuItem to="/overviews" icon={<OverviewIcon />} text="Souhrny" />
        <MainMenuItem to="/evaluation" icon={<EvaluationIcon />} text="Hodnocení" />
        <MainMenuItem to="/users" icon={<UserIcon />} text="Uživatelé" />
        {accessToken && (profile[ADMIN_ROLE] === "1") ? <MainMenuItem to="/admin" icon={<HammerIcon />} text="Administrace" /> : ""}
    </StyledMainMenu>
    );
};

export default MainMenu;