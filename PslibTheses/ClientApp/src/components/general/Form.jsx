import React from "react";
import styled from 'styled-components';
import theme from "styled-theming";
import { Form as OriginalForm, Field as OriginalField, useField } from 'formik';

const borderColor = theme.variants("mode", "variant", {
    default: 
    {
        light: props => props.theme.colors.defaultForeground, 
        dark: props => props.theme.colors.defaultForeground
    },
    success: 
    {
        light: props => props.theme.colors.successBackground,
        dark: props => props.theme.colors.successBackground,
    },
    error: 
    {
        light: props => props.theme.colors.errorBackground,
        dark: props => props.theme.colors.errorBackground,
    },
});

export const FormError = styled.div`
color: ${props => props.theme.colors.errorBackground};
margin: .5em;
`;

export const Input = styled.input`
padding: .5em .7em;
font-size: 1rem;
border: none;
background: transparent;
border-bottom: 2px solid ${borderColor};
&:focus {
    box-shadow: 0 6px 3px -3px rgba(100,100,100,.3);
    outline: none;
}
`;

Input.defaultProps = {variant: "default"};

export const Form = styled(OriginalForm)`
padding: .5em;
`;

export const Select = styled.select`
width: 100%;
padding: .5em .7em;
font-size: 1rem;
border: none;
background: transparent;
border-bottom: 2px solid ${borderColor};
&:focus {
    box-shadow: 0 6px 3px -3px rgba(100,100,100,.3);
    outline: none;
}
`;

export const Textarea = styled.textarea`
padding: .5em;
font-size: 1rem;
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: .5rem;
`;

export const Label = styled.label`
margin: .5em;
display: flex;
align-items: center;
color: ${borderColor};
& > input {
    margin: .2em;
}
`;

Label.defaultProps = {variant: "default"};

export const Field = styled(OriginalField)`
padding: .5em;
font-size: 1rem;
`;

export const FormTextInput = ({ label, name, ...rest }) => {
    const [field, meta] = useField(name);
    return (
        <FormGroup>
            <Label htmlFor={name} variant={meta.touched && meta.error ? "error" : meta.touched ? "success" : "default"}>{label}</Label>
            <Input variant={meta.touched && meta.error ? "error" : meta.touched ? "success" : "default"} {...field} {...rest} />
            {meta.touched && meta.error ? (
                <FormError>{meta.error}</FormError>
            ) : null}
        </FormGroup>
    );
};

export const FormCheckbox = ({ label, name, ...rest }) => {
    const [field, meta] = useField({ name, type: 'checkbox' });
    return (
        <>
            <Label htmlFor={name} variant={meta.touched && meta.error ? "error" : meta.touched ? "success" : "default"}>
            <Input type="checkbox" variant={meta.touched && meta.error ? "error" : meta.touched ? "success" : "default"} {...field} {...rest} />
            {label}
            </Label>
            {meta.touched && meta.error ? (
                <FormError>{meta.error}</FormError>
            ) : null}
        </>
    );
};

const FormRadioItem = ({ label, name, ...rest }) => {
    const [field, meta] = useField({ name });
    field.checked = String(field.value) === String(rest.value);
    return (
        <>
            <Label htmlFor={name} variant={meta.touched && meta.error ? "error" : meta.touched ? "success" : "default"}>
            <Input 
                type="radio"
                variant={meta.touched && meta.error ? "error" : meta.touched ? "success" : "default"} {...field} {...rest} />
            {label}
            </Label>
        </>
    );
};

export const FormRadioGroup = ({ label, name, values, ...rest }) => {
    const [meta] = useField({ name }); 
    return (
        <FormGroup>
        <Label>{label}</Label>
        {Object.keys(values).map((key, index)=>
        {
            return (
                <FormRadioItem key={index} label={values[key]} value={key} name={name} {...rest} />
            );           
        })}
        {meta.touched && meta.error ? (
                <FormError>{meta.error}</FormError>
            ) : null}
        </FormGroup>
    );
};

export const FormRadio = ({ label, name, ...rest }) => {
    const [field, meta] = useField({ name });
    field.checked = field.value === rest.value;
    return (
        <>
            <FormRadioItem label={label} name={name} value={rest.value} />
            {meta.touched && meta.error ? (
                <FormError>{meta.error}</FormError>
            ) : null}
        </>
    );
};

export const FormSelect = ({ label, name, ...rest }) => {
    const [field, meta] = useField(name);
    return (
      <>
        <Label htmlFor={name} variant={meta.touched && meta.error ? "error" : meta.touched ? "success" : "default"}>{label}</Label>
        <Select variant={meta.touched && meta.error ? "error" : meta.touched ? "success" : "default"} {...field} {...rest} />
        {meta.touched && meta.error ? (
          <FormError>{meta.error}</FormError>
        ) : null}
      </>
    );
};