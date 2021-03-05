import styled, {keyframes} from 'styled-components';
import theme from "styled-theming";

const pulse = keyframes`
0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
}

70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
}

100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
}
`;

const foregroundColor = theme.variants("mode", "variant", {
    default: 
    {
        light: props => props.theme.colors.defaultForeground, 
        dark: props => props.theme.colors.defaultForeground
    },
    primary: 
    {
        light: props => props.outline ? props.theme.colors.defaultForeground : props.theme.colors.defaultForeground, 
        dark: props => props.outline ? props.theme.colors.defaultForeground : props.theme.colors.defaultForeground
    },
    info: 
    {
        light: props => props.outline ? props.theme.colors.infoBackground : props.theme.colors.infoForeground,
        dark: props => props.outline ? props.theme.colors.infoBackground : props.theme.colors.infoForeground,
    },
    success: 
    {
        light: props => props.outline ? props.theme.colors.successBackground : props.theme.colors.successForeground,
        dark: props => props.outline ? props.theme.colors.successBackground : props.theme.colors.successForeground,
    },
    warning: 
    {
        light: props => props.outline ? props.theme.colors.warningBackground : props.theme.colors.warningForeground,
        dark: props => props.outline ? props.theme.colors.warningBackground : props.theme.colors.warningForeground,
    },
    danger: 
    {
        light: props => props.outline ? props.theme.colors.errorBackground : props.theme.colors.errorForeground, 
        dark: props => props.outline ? props.theme.colors.errorBackground : props.theme.colors.errorForeground
    },
    error: 
    {
        light: props => props.outline ? props.theme.colors.errorBackground : props.theme.colors.errorForeground,
        dark: props => props.outline ? props.theme.colors.errorBackground : props.theme.colors.errorForeground
    },
    light: 
    {
        light: props => props.outline ? props.theme.colors.lightBackground : props.theme.colors.lightForeground,
        dark: props => props.outline ? props.theme.colors.lightBackground : props.theme.colors.lightForeground
    },
    dark: 
    {
        light: props => props.outline ? props.theme.colors.darkBackground : props.theme.colors.darkForeground,
        dark: props => props.outline ? props.theme.colors.darkBackground : props.theme.colors.darkForeground
    },
    disabled: 
    {
        light: props => props.outline ? props.theme.colors.disabledBackground : props.theme.colors.disabledForeground,
        dark: props => props.outline ? props.theme.colors.disabledBackground : props.theme.colors.disabledForeground
    },
});

const backgroundColor = theme.variants("mode", "variant", {
    default: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.defaultBackground,
        dark: props => props.outline ? "transparent" : props.theme.colors.defaultBackground
    },
    primary: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.defaultBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.defaultBackground
    },
    info: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.infoBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.infoBackground, 
    },
    success: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.successBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.successBackground
    },
    warning: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.warningBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.warningBackground, 
    },
    danger: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.errorBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.errorBackground
    },
    error: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.errorBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.errorBackground
    },
    light: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.lightBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.lightBackground
    },
    dark: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.darkBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.darkBackground
    },
    disabled: 
    {
        light: props => props.outline ? "transparent" : props.theme.colors.disabledBackground, 
        dark: props => props.outline ? "transparent" : props.theme.colors.disabledBackground
    },
});

const hoverForegroundColor = theme.variants("mode", "variant", {
    default: 
    {
        light: props => props.theme.colors.defaultBackground, 
        dark: props => props.theme.colors.defaultBackground
    },
    primary: 
    {
        light: props => props.theme.colors.defaultBackground,
        dark: props => props.theme.colors.defaultBackground
    },
    info: 
    {
        light: props => props.outline ? props.theme.colors.infoForeground : props.theme.colors.infoBackground,
        dark: props => props.outline ? props.theme.colors.infoForeground : props.theme.colors.infoBackground
    },
    success: 
    {
        light: props => props.outline ? props.theme.colors.successForeground : props.theme.colors.successBackground,
        dark: props => props.outline ? props.theme.colors.successForeground : props.theme.colors.successBackground,
    },
    warning: 
    {
        light: props => props.outline ? props.theme.colors.warningForeground : props.theme.colors.warningBackground,
        dark: props => props.outline ? props.theme.colors.warningForeground : props.theme.colors.warningBackground,
    },
    danger: 
    {
        light: props => props.outline ? props.theme.colors.errorForeground : props.theme.colors.errorBackground, 
        dark: props => props.outline ? props.theme.colors.errorForeground : props.theme.colors.errorBackground
    },
    error: 
    {
        light: props => props.outline ? props.theme.colors.errorForeground : props.theme.colors.errorBackground,
        dark: props => props.outline ? props.theme.colors.errorForeground : props.theme.colors.errorBackground
    },
    light: 
    {
        light: props => props.outline ? props.theme.colors.lightForeground : props.theme.colors.lightBackground,
        dark: props => props.outline ? props.theme.colors.lightForeground : props.theme.colors.lightBackground
    },
    dark: 
    {
        light: props => props.outline ? props.theme.colors.darkForeground : props.theme.colors.darkBackground,
        dark: props => props.outline ? props.theme.colors.darkForeground : props.theme.colors.darkBackground
    },
    disabled: 
    {
        light: props => props.outline ? props.theme.colors.disabledForeground : props.theme.colors.disabledBackground,
        dark: props => props.outline ? props.theme.colors.disabledForeground : props.theme.colors.disabledBackground
    },
});

const borderColor = theme.variants("mode", "variant", {
    default: 
    {
        light: props => props.theme.colors.defaultForeground, 
        dark: props => props.theme.colors.defaultForeground
    },
    primary: 
    {
        light: props => props.theme.colors.defaultForeground, 
        dark: props => props.theme.colors.defaultForeground
    },
    info: 
    {
        light: props => props.theme.colors.infoBackground,
        dark: props => props.theme.colors.infoBackground
    },
    success: 
    {
        light: props => props.theme.colors.successBackground,
        dark: props => props.theme.colors.successBackground,
    },
    warning: 
    {
        light: props => props.theme.colors.warningBackground,
        dark: props => props.theme.colors.warningBackground,
    },
    danger: 
    {
        light: props => props.theme.colors.errorBackground, 
        dark: props => props.theme.colors.errorBackground
    },
    error: 
    {
        light: props => props.theme.colors.errorBackground,
        dark: props => props.theme.colors.errorBackground
    },
    light: 
    {
        light: props => props.theme.colors.lightBackground,
        dark: props => props.theme.colors.lightBackground
    },
    dark: 
    {
        light: props => props.theme.colors.darkBackground,
        dark: props => props.theme.colors.darkBackground
    },
    disabled: 
    {
        light: props => props.theme.colors.disabledBackground,
        dark: props => props.theme.colors.disabledBackground
    },
});

const Button = styled.button`
    display: inline-block;
    text-transform: uppercase;
    font-family: ${props => props.theme.fonts.heading};
    font-size: ${props => props.size ? props.size : "inherit"};
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    padding: 1em 2em;
    line-height: 1;
    margin: .1em;
    border: 2px solid ${props => props.disabled ? props.theme.colors.disabledForeground : props.color ? props.color : borderColor};
    background-color: ${props => props.disabled ? props.outline ? "transparent" : props.theme.colors.disabledBackground : props.background ? props.background : backgroundColor};
    color: ${props => props.disabled ? props.theme.colors.disabledForeground : props.color ? props.color : foregroundColor};
    cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
    position: relative;
    overflow: hidden;
    transition: all .3s ease;
    box-sizing: border-box;
    z-index: 2;
    &:hover {
        color: ${props => props.background ? props.background : hoverForegroundColor};
    }
    &:after {
        content: "";
        width: 0;
        height: 100%;
        top: 0%;
        left: 50%;
        background-color: ${props => props.disabled ? props.theme.colors.disabledBackground : props.color ? props.color : foregroundColor};
        opacity: 0;
        position: absolute;
        transition: all .3s;
        z-index: -1;
    }
    &:hover:after {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: 1;
    }
    &:focus {
        outline: none;
    }
`;

Button.defaultProps = {variant: "default"};

export default Button;