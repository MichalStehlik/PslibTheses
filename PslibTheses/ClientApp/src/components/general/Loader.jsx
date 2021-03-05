import React from 'react';
import styled, {keyframes} from 'styled-components';

const walk = keyframes`
0% {
  opacity: 0;
  top: -100%;
}
5% {
  opacity: 1;
  top: 0px;
}
50.9% {
  opacity: 1;
  top: 0px;
}
55.9% {
  opacity: 0;
  top: 100%;
}
}
`;

const StyledLoader = styled.div`
display: inline-grid;
width: ${props => props.size};
height: ${props => props.size};;
grid-template-rows: 1fr 1fr 1fr;
grid-template-columns: 1fr 1fr 1fr;
grid-gap: .1em;
margin: .5em;
`;

const LoaderSquare = styled.div`
background-color: ${props => props.look};
width: 100%;
height: 100%;
opacity: 0;
animation: ${walk} 5s infinite;
animation-delay: ${props => props.delay};
`;

const Loader = ({normal, accent, size}) => {
    return (
    <StyledLoader size={size}>
        <LoaderSquare delay="1.8s" look={normal} />
        <LoaderSquare delay="2.1s" look={normal} />
        <LoaderSquare delay="2.4s" look={accent} />
        <LoaderSquare delay="1.5s" look={normal} />
        <LoaderSquare delay="1.2s" look={normal} />
        <LoaderSquare delay="0.9s" look={normal} />
        <LoaderSquare delay="0s" look={normal} />
        <LoaderSquare delay="0.3s" look={normal} />
        <LoaderSquare delay="0.6s" look={normal}/>
    </StyledLoader>
    );
}

Loader.defaultProps = {
    normal: props => props.theme.colors.logoBackground,
    accent: props => props.theme.colors.menuBackground,
    size: "1em"
}

export default Loader;