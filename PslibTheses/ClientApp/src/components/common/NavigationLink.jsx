import styled from 'styled-components';
import { NavLink } from "react-router-dom";

const NavigationLink = styled(NavLink)`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 5px;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    color: white;
    &>* {
        z-index: 2;
    }
    & svg {
        fill: ${props => props.theme.colors.menuForeground};
        stroke: ${props => props.theme.colors.menuForeground};
    }
    &:before {
        content: "";
        width: 100%;
        height: 100%;
        background-color: rgba(10,10,10,.1);
        position: absolute;
        transition: all .3s ease;
        top: -100%;
        z-index: 1;
    }
    &.active {
        background-color: ${props => props.theme.colors.desktopBackground};
        color: ${props => props.theme.colors.desktopForeground};
    }
    &:hover:before {
        top: 0;
    }
    &:hover svg {
        fill: ${props => props.theme.colors.menuForeground};
        stroke: ${props => props.theme.colors.menuForeground};
    }
    &.active > svg {
        fill: ${props => props.theme.colors.desktopForeground};
        stroke: ${props => props.theme.colors.desktopForeground};
    }
`;

export default NavigationLink;