import styled from 'styled-components';
import { Link } from "react-router-dom";

const ActionLink = styled(Link)`
padding: 5px;
margin: 0 3px;
border: 0px solid #eeeeee;
&:hover {
    background-color: #eeeeee;
}
`;

export default ActionLink;