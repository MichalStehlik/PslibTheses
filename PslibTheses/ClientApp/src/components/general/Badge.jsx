import styled from 'styled-components';

const Badge = styled.span`
display: inline-block;
padding: .3em .5em;
margin: .2em;
background-color: ${props => props.background ? props.background : "#aaa"};
color: ${props => props.color ? props.color : "inherit"};
`;

export default Badge;