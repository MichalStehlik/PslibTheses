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
    &>* {
        z-index: 2;
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
`;

export default NavigationLink;