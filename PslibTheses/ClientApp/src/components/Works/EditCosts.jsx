import React, {useState, useEffect, useCallback} from 'react';
import { Formik, ErrorMessage } from 'formik';
import { Alert, FormGroup, Button, Label, Form, FormTextInput, FormSelect } from "../general";
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import axios from 'axios';
import CKEditor from '@ckeditor/ckeditor5-react';
import Editor from '@ckeditor/ckeditor5-build-inline';
import requireAuth from "../Auth/requireAuth";

export const EditCosts = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    useEffect(()=>{ 
        setFailed(false);
        setOk(false);
     },[dispatch]);
    return (
        <Formik
        initialValues={{
            materialcosts: props.data.materialCosts ? props.data.materialCosts : 0,
            servicescosts: props.data.servicesCosts ? props.data.servicesCosts : 0,
            materialcostsprovidedbyschool: props.data.materialCostsProvidedBySchool ? props.data.materialCostsProvidedBySchool : 0,
            servicescostsprovidedbyschool: props.data.servicesCostsProvidedBySchool ? props.data.servicesCostsProvidedBySchool : 0,
            detailexpenditures: props.data.detailExpenditures ? props.data.detailExpenditures : "",
        }}
        validate={values=>{
            let errors = {};
            if (!values.materialcosts === null) errors.materialcosts = "Vyplňte výrobní náklady";
            if (!values.servicescosts === null) errors.servicescosts = "Vyplňte náklady na služby";
            if (!values.materialcostsprovidedbyschool === null) errors.materialcostsprovidedbyschool = "Vyplňte výrobní náklady hrazené školou";
            if (!values.servicescostsprovidedbyschool === null) errors.servicescostsprovidedbyschool = "Vyplňte náklady na služby hrazené školou";
            return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            axios.put(process.env.REACT_APP_API_URL + "/works/" + props.data.id + "/expenditures", {
                Id: Number(props.id),
                MaterialCosts: values.materialcosts,
                MaterialCostsProvidedBySchool: values.materialcostsprovidedbyschool,
                ServicesCosts: values.servicescosts,
                ServicesCostsProvidedBySchool: values.servicescostsprovidedbyschool,
                DetailExpenditures: values.detailexpenditures,
            }, {
                headers: {
                    Authorization: "Bearer " + accessToken,
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                setOk(true);
                setFailed(false);
                dispatch({type: ADD_MESSAGE, text: "Práce byla uložena.", variant: "success", dismissible: true, expiration: 3});
                props.switchEditMode(false);
                props.fetchData();
            })
            .catch(error => {
                if (error.response)
                    {
                        dispatch({type: ADD_MESSAGE, text: "Uložení nákladů práce se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                        setFailed(error.response.status);
                    }
                    else
                    {
                        dispatch({type: ADD_MESSAGE, text: "Uložení nákladů práce se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                        setFailed("Neznámá chyba");
                    }
                    setOk(false);
            })
            .then(()=>{
                setSubmitting(false); 
            });
        }}
    >
            {({isSubmitting, errors, touched, values, setFieldValue, handleBlur, isValid, dirty}) => (
            <Form>
                {(failed !== false) ? <Alert text={"Uložení nákladů práce se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                {(ok !== false) ? <Alert text={"Uložení nákladů práce se podařilo."}  variant="success" /> : ""}
                <FormTextInput name="materialcosts" type="number" label="Výrobní náklady" placeholder="0" />
                <FormTextInput name="materialcostsprovidedbyschool" type="number" label="Výrobní náklady hrazené školou" placeholder="0" />
                <FormTextInput name="servicescosts" type="number" label="Náklady na služby" placeholder="0" />
                <FormTextInput name="servicescostsprovidedbyschool" type="number" label="Náklady na služby hrazené školou" placeholder="0" />
                <FormGroup>
                    <Label htmlFor="detailexpenditures">Rozepsané náklady</Label>
                    <CKEditor
                        editor={ Editor }
                        data={values.detailexpenditures}
                        config={{toolbar: ['bold', 'italic', 'strike', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'table', '|', 'Paste' ]}}
                        onInit={ editor => {  } }
                        onChange={ ( event, editor ) => {
                            const data = editor.getData();
                            setFieldValue("detailexpenditures", data, true);
                        } }
                        onBlur={ ( event, editor ) => {
                        } }
                        onFocus={ ( event, editor ) => {
                        } }
                    />
                    <ErrorMessage name="description">{msg => <Alert variant="error" text={msg} />}</ErrorMessage>
                </FormGroup>
                <div>
                    <Button type="submit" variant="primary" disabled={!(isValid || isSubmitting)}>{!isSubmitting ? "Uložení" : "Pracuji"}</Button>
                    <Button onClick={()=>{props.switchEditMode(false)}}>Zpět</Button>
                </div>
            </Form>
            )}            
            </Formik>
    )
};

export default requireAuth(EditCosts);