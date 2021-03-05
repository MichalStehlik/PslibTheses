import React from 'react';
import styled from 'styled-components';
import theme from "styled-theming";

import {devices} from "../../configuration/layout";

import MainMenu from "../MainMenu";
import HeaderPanel from "../HeaderPanel";
import TitlePanel from "../TitlePanel";
import AlertContainer from "../AlertContainer";

const DashboardLayoutWrapper = styled.div`
height: 100%;
width: 100%;
display: grid;
grid-template-areas: "logo header" "logo main" "navigation main";
grid-template-columns: 180px 1fr;
grid-template-rows: 48px 0 1fr;

@media ${devices.tablet} {
    grid-template-columns: 48px 1fr;
}

@media ${devices.mobile} {
    grid-template-areas: "header" "main" "navigation";
    grid-template-columns: 1fr;
    grid-template-rows: 48px 1fr 48px;
}
`;

const LogoWrapper = styled.div`
grid-area: logo;
background-color: ${props => props.theme.colors.logoBackground};
display: flex;
justify-content: center;
align-items: center;

@media ${devices.mobile} {
display: none;
}
`;

const Logo = styled.div`
font-family: ${props => props.theme.fonts.heading};;
color: ${props => props.theme.colors.logoForeground};
& span {
    color: ${props => props.theme.colors.logoAccent};
}
& .full-text {
    display: block;
    font-size: 1.3rem;
}
& .short-text {
    display: none;
    font-size: 2rem;
}
@media ${devices.tablet} {
    & .full-text {
        display: none;
    }
    & .short-text {
        display: block;
    }
}
}
`;

const HeaderWrapper = styled.div`
grid-area: header;
background-color: white;
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: stretch;
padding: 0;
border-bottom: 1px solid #ccc;
`;

const NavigationWrapper = styled.div`
grid-area: navigation;
background-color: ${props => props.theme.colors.menuBackground};
color: ${props => props.theme.colors.menuForeground};
display: flex;
overflow-y: auto;
overflow-x: hidden;
`;

const ContentWrapper = styled.main`
grid-area: main;
padding: 15px;
background-color: ${props => props.theme.colors.desktopBackground};
color: ${props => props.theme.colors.desktopForeground};
overflow: auto;
position: relative;
`;

const DashboardLayout = props => (
    <DashboardLayoutWrapper>
        <LogoWrapper>
            <Logo>
                <div className="full-text">Dlouhodobé <span>práce</span></div>
                <div className="short-text">D<span>P</span></div>
            </Logo>
        </LogoWrapper>
        <HeaderWrapper>
            <TitlePanel />
            <HeaderPanel />
        </HeaderWrapper>
        <NavigationWrapper>
            <MainMenu />
        </NavigationWrapper>
        <ContentWrapper>
            <AlertContainer />
            {props.children}
        </ContentWrapper>
    </DashboardLayoutWrapper>
);

export default DashboardLayout;