import styled from 'styled-components';

const Icon = styled.i`
    display: inline-block;
    font-family: IcoMoon;
    font-style: normal;
    min-height: 16px;
    min-width: 16px;
    font-size: ${props => props.size ? props.size : "inherit"};
    color: ${props => props.color ? props.color : "inherit"};
`;

export default Icon;