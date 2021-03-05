import styled from 'styled-components';

const TitleLayout = styled.main`
height: 100%;
width: 100%;
background-color: ${props => props.theme.colors.menuBackground};
color: ${props => props.theme.colors.menuForeground};
display: flex;
flex-direction: column;
`;

export default TitleLayout;