import React, {useState, useEffect, useCallback} from 'react';
import { Formik } from 'formik';
import { Alert, Button, Form, FormTextInput, FormCheckbox, FormRadioGroup, FormSelect} from "../../general";
import {useAppContext, SET_TITLE, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import Axios from 'axios';

const Edit = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [failed, setFailed] = useState(false);
    const [ok, setOk] = useState(false);
    const [scales, setScales] = useState(null);
    const fetchScalesData = useCallback(() => {
        Axios.get(process.env.REACT_APP_API_URL + "/scales",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setScales(response.data.data);
        })
    },[accessToken]);

    useEffect(() => {
        dispatch({type: SET_TITLE, payload: "Editace sady"});
        setFailed(false);
        fetchScalesData();
        setOk(false);
    },[dispatch, fetchScalesData]);

    return (
        <Formik
            initialValues={{
                name: props.data.name ? props.data.name : "",
                year: props.data.year ? props.data.year : "",
                active: props.data.active ? props.data.active : "",
                template: (props.data.template !== undefined) ? props.data.template : null,
                scale: props.data.scaleId ? props.data.scaleId : "",
                requiredGoals: props.data.requiredGoals ? props.data.requiredGoals : "",
                requiredOutlines: props.data.requiredOutlines ? props.data.requiredOutlines : "",
            }}
            validate={values=>{
                let errors = {};
                if (!values.name) errors.name = "Vyplňte název";
                if (values.year === "") errors.year = "Vyplňte rok";
                if (values.template === "") errors.template = "Vyberte šablonu";
                if (!values.scale) errors.scale = "Vyberte standardní škálu hodnocení";
                if (values.requiredGoals === "") errors.requiredGoals = "Nastavte počet požadovaných cílů";
                if (values.requiredOutlines === "") errors.requiredOutlines = "Nastavte počet požadovaných bodů osnovy";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                Axios.put(process.env.REACT_APP_API_URL + "/sets/" + props.data.id, {
                    Name: values.name,
                    Year: Number(values.year),
                    Active: values.active,
                    Template: Number(values.template),
                    ScaleId: Number(values.scale),
                    RequiredGoals: Number(values.requiredGoals),
                    RequiredOutlines: Number(values.requiredOutlines),
                    Id: Number(props.id)
                }, {
                    headers: {
                        Authorization: "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    setOk(true);
                    setFailed(false);
                    dispatch({type: ADD_MESSAGE, text: "Sada byla uložena.", variant: "success", dismissible: true, expiration: 3});
                    props.fetchData();
                    props.switchEditMode(false);
                })
                .catch(error => {
                    if (error.response)
                        {
                            setFailed(error.response.status);
                            dispatch({type: ADD_MESSAGE, text: "Při ukládání sady došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
                        }
                        else
                        {
                            setFailed("Neznámá chyba");
                            dispatch({type: ADD_MESSAGE, text: "Při ukládání sady došlo k chybě.", variant: "error", dismissible: true, expiration: 3});
                        }
                        setOk(false);
                })
                .then(()=>{
                    setSubmitting(false); 
                }); 
            }}
        >
            {({isSubmitting, isValid}) => (
            <Form>
                {(failed !== false) ? <Alert text={"Uložení sady se nepodařilo. (" + failed + ")"}  variant="error" /> : ""}
                {(ok !== false) ? <Alert text={"Uložení sady se podařilo."}  variant="success" /> : ""}
                <FormTextInput name="name" label="Název" placeholder="MP 2021/22" />
                <FormTextInput name="year" label="Rok" type="number" placeholder="2020" />
                <FormCheckbox name="active" label="Aktivní" />
                <FormRadioGroup name="template" label="Šablona" values={{0: "Maturitní práce", 1: "Ročníkové práce"}} />
                <FormSelect name="scale" label="Standardní škála známek">
                    <option></option>
                    {Array.isArray(scales) ? scales.map((item,index) => (<option key={index} value={item.id}>{item.name}</option>)) : ""}
                </FormSelect>
                <FormTextInput name="requiredGoals" label="Minimální počet cílů" type="number" placeholder="5" />
                <FormTextInput name="requiredOutlines" label="Minimální počet bodů osnovy" type="number" placeholder="5" />
                <div>
                    <Button type="submit" variant="primary" disabled={!(isValid) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                    <Button onClick={()=>{props.switchEditMode(false)}}>Zpět</Button>
                </div>
            </Form>
            )}
        </Formik>
    );
};

export default Edit;