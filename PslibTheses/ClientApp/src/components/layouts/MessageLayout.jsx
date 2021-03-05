import styled from 'styled-components';

const MessageLayout = styled.main`
height: 100%;
width: 100%;
display: flex;
flex-direction: column;
background-color: ${props => props.backgroundColor || "#F6F6F6"};
color: ${props => props.color || "white"};
justify-content: center;
align-items: center;
text-align: center;
padding: 15px;
box-sizing: border-box;
`;

export default MessageLayout;