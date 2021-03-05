import styled from 'styled-components';
import {breakpoints, devices} from "../../configuration/layout";

export const Container = styled.div`
    display: block;
    @media (${devices.desktop}) {
        width: ${breakpoints.tablet};
    }
    @media (${devices.tablet}) {
        width: ${breakpoints.tablet};
    }
`;

export const Row = styled.div`
    display: flex;
`;

export const Col = styled.div`
    flex: ${props => props.size};
`;