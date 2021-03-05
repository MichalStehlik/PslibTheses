import styled from 'styled-components';
import {devices} from "../../configuration/layout";

const ButtonBlock = styled.div`
display: flex;
flex-wrap: wrap;
flex-direction: row;
@media ${devices.mobile} {
    flex-direction: column;
}
`;

export default ButtonBlock;