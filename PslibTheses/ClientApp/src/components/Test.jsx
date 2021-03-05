import React, {useState, useEffect} from 'react';
import { Heading, Paragraph, Button, ButtonBlock, Modal, Loader, PageTitle,
    ResetMiniButton, UserMiniButton, EditMiniButton, RemoveMiniButton, AddMiniButton, YesMiniButton, NoMiniButton, CancelMiniButton, LockedMiniButton, UnlockedMiniButton, AlertMiniButton, DeleteMiniButton, FirstMiniButton, PreviousMiniButton, NextMiniButton, LastMiniButton, 
    Form, FormTextInput, FormCheckbox, FormSelect, Label, FormRadio, FormRadioGroup
} from "./general";
import { Formik } from 'formik';
import {useAppContext, ADD_MESSAGE} from "../providers/ApplicationProvider";

const Test = props => {
    const [showDialog, setShowDialog] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDanger, setShowDanger] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [formResult, setFormResult] = useState(null);
    const [, dispatch] = useAppContext();
    useEffect(() => {
        setShowDialog(false);
        setShowInfo(false);
        setShowWarning(false);
        setShowSuccess(false);
        setShowDanger(false);
        setShowError(false);
        setShowResult(false);
        return () => {setShowDialog(false);setShowInfo(false);setShowWarning(false);setShowSuccess(false);setShowDanger(false);setShowError(false);};
    },[]);
    return (
        <>
        <PageTitle>Testy rozhraní</PageTitle>
        <Paragraph>Stránka demonstrující možnosti rozhraní.</Paragraph>
        <Heading>Tlačítka</Heading>
        <ButtonBlock>
            <Button>Obyčejné</Button>
            <Button variant="primary">Primární</Button>
            <Button variant="info">Informace</Button>
            <Button variant="warning">Varování</Button>
            <Button variant="success">Potvrzení</Button>
            <Button variant="danger">Nebezpečí</Button>
            <Button variant="error">Chyba</Button>
            <Button variant="light">Světly</Button>
            <Button variant="dark">Tmavy</Button>
            <Button disabled>Vypnutý</Button>
        </ButtonBlock>
        <ButtonBlock>
            <Button outline>Obyčejné</Button>
            <Button variant="primary" pulsing outline>Primární</Button>
            <Button variant="info" outline>Informace</Button>
            <Button variant="warning" outline>Varování</Button>
            <Button variant="success" outline>Potvrzení</Button>
            <Button variant="danger" outline>Nebezpečí</Button>
            <Button variant="error" outline>Chyba</Button>
            <Button variant="light" outline>Světly</Button>
            <Button variant="dark" outline>Tmavy</Button>
            <Button disabled outline>Vypnutý</Button>
        </ButtonBlock>
        <Heading>Dialogová okna</Heading>
        <ButtonBlock>
            <Button onClick={e => {setShowDialog(true);}}>Dialog</Button>
            <Button onClick={e => {setShowInfo(true);}} variant="info">Informace</Button>
            <Button onClick={e => {setShowWarning(true);}} variant="warning">Varování</Button>
            <Button onClick={e => {setShowSuccess(true);}} variant="success">Potvrzení</Button>
            <Button onClick={e => {setShowDanger(true);}} variant="danger">Nebezpečí</Button>
            <Button onClick={e => {setShowError(true);}} variant="danger">Chyba</Button>
        </ButtonBlock>
        <Heading>Zprávy</Heading>
        <ButtonBlock>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Jednoduchá zpráva"})}}>Obecná</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Informace", variant: "info"})}}>Informace</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Varování", variant: "warning"})}}>Varování</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Úspěch", variant: "success"})}}>Úspěch</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Chyba", variant: "error"})}}>Chyba</Button>
        </ButtonBlock>
        <ButtonBlock>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Zrušitelná zpráva, kterou je možné skrýt pomocí ikonky na pravé straně zprávy.", dismissible: true})}}>Zrušitelná obecná</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Zrušitelná informace", variant: "info", dismissible: true})}}>Zrušitelná informace</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Zrušitelné varování", variant: "warning", dismissible: true})}}>Zrušitelné varování</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Zrušitelný úspěch", variant: "success", dismissible: true})}}>Zrušitelný úspěch</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Zrušitelná chyba", variant: "error", dismissible: true})}}>Zrušitelná  chyba</Button>
        </ButtonBlock>
        <ButtonBlock>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Časově omezená zpráva", dismissible: true, expiration: 10})}}>Časově omezená obecná zpráva</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Časově omezená informace", variant: "info", expiration: 21})}}>Časově omezená informace</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Časově omezené varování", variant: "warning", expiration: 7})}}>Časově omezené varování</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Časově omezený úspěch, který by měl po chvilce sám zmizet.", variant: "success", expiration: 3})}}>Časově omezený úspěch</Button>
            <Button onClick={e => {dispatch({type: ADD_MESSAGE, text: "Časově omezená chyba", variant: "error", expiration: 2})}}>Časově omezená chyba</Button>
        </ButtonBlock>
        <Heading>Nahrávání</Heading>
        <div>
            <Loader />
            <Loader size="2em" />
            <Loader size="5em" />
        </div>
        <Heading>Akce</Heading>
        <div>
            <UserMiniButton size="1em" />
            <AddMiniButton size="1em" />
            <RemoveMiniButton size="1em" />
            <EditMiniButton size="1em" />
            <LockedMiniButton size="1em" />
            <UnlockedMiniButton size="1em" />
            <YesMiniButton size="1em" />
            <NoMiniButton size="1em" />
            <CancelMiniButton size="1em" />
            <AlertMiniButton size="1em" />
            <DeleteMiniButton size="1em" />
            <FirstMiniButton size="1em" />
            <PreviousMiniButton size="1em" />
            <NextMiniButton size="1em" />
            <LastMiniButton size="1em" />
            <ResetMiniButton size="1em" />
        </div>
        <div>
            <UserMiniButton size="2em" />
            <AddMiniButton size="2em" />
            <RemoveMiniButton size="2em" />
            <EditMiniButton size="2em" />
            <LockedMiniButton size="2em" />
            <UnlockedMiniButton size="2em" />
            <YesMiniButton size="2em" />
            <NoMiniButton size="2em" />
            <CancelMiniButton size="2em" />
            <AlertMiniButton size="2em" />
            <DeleteMiniButton size="2em" />
            <FirstMiniButton size="2em" />
            <PreviousMiniButton size="2em" />
            <NextMiniButton size="2em" />
            <LastMiniButton size="2em" />
            <ResetMiniButton size="2em" />
        </div>
        <div>
            <UserMiniButton size="5em" />
            <AddMiniButton size="5em" />
            <RemoveMiniButton size="5em" />
            <EditMiniButton size="5em" />
            <LockedMiniButton size="5em" />
            <UnlockedMiniButton size="5em" />
            <YesMiniButton size="5em" />
            <NoMiniButton size="5em" />
            <CancelMiniButton size="5em" />
            <AlertMiniButton size="5em" />
            <DeleteMiniButton size="5em" />
        </div>
        <Heading>Formuláře</Heading>
        <Formik
            initialValues={{
                name: "Bedřich",
                email: "beda@bohous.test",
                region: "",
                agreement: false,
                contact: "pigeon",
                reward: "keychain"
            }}
            validate={values=>{
                let errors = {};
                if (!values.name) errors.name = "Vyplňte jméno";
                if (!values.email) errors.email = "Vyplňte email";
                if (!values.region) errors.region = "Musíte si vybrat region";
                if (!values.contact) errors.contact = "Musíte si vybrat formu kontaktu";
                if (!values.reward) errors.reward = "Musíte si vybrat odměnu";
                if (!values.agreement) errors.agreement = "S dohodou musíte souhlasit";
                return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
                setFormResult(values);
                setShowResult(true);
            }}
        >
            {({isSubmitting, errors, touched, values, setFieldValue, isValid, dirty}) => (
                <Form>
                    <FormTextInput name="name" label="Jméno" />
                    <FormTextInput type="email" name="email" label="Email" />
                    <FormSelect name="region" label="Region">
                        <option></option>
                        <option>Liberec</option>
                        <option>Praha</option>
                    </FormSelect>
                    <FormCheckbox name="agreement" label="Souhlas" />
                    <Label>Kontakt</Label>
                    <FormRadio name="contact" label="Email" value="email" />
                    <FormRadio name="contact" label="Poštovní holub" value="pigeon" />
                    <FormRadio name="contact" label="Kurýr na jednorožci" value="unicorncourier" />
                    <FormRadioGroup name="reward" label="Odměna" values={{"teddybear": "Medvěd", "keychain": "Klíčenka", "donut": "Kobliha"}} />
                    <div>
                        <Button type="submit" variant="primary" disabled={!(isValid && dirty) || isSubmitting}>{!isSubmitting ? "Uložit" : "Pracuji"}</Button>
                        <Button type="reset">Reset</Button>
                    </div>
                </Form>
            )}
        </Formik>
        <Modal 
            active={showDialog} 
            onDismiss={()=>setShowDialog(false)} 
            title="Obecný dialog"
            actions={
                <>
                    <Button outline variant="dark" onClick={async ()=>{ setShowDialog(false); }}>OK</Button>
                </>
            }
        >
            <p>Toto je informace.</p> 
        </Modal>
        <Modal 
            active={showInfo} 
            variant="info"
            onDismiss={()=>setShowInfo(false)} 
            title="Informace"
            actions={
                <>
                    <Button variant="light" outline onClick={()=>setShowInfo(false)}>OK</Button>
                    <Button variant="light" outline onClick={async ()=>{ setShowInfo(false); }}>Zavřít</Button>
                </>
            }
        >
            <p>Toto je nějaká informace.</p> 
        </Modal>
        <Modal 
            active={showWarning} 
            variant="warning"
            onDismiss={()=>setShowWarning(false)} 
            title="Upozornění"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{ setShowWarning(false); }}>OK</Button>
                    <Button variant="light" outline onClick={async ()=>{ setShowWarning(false); }}>Zavřít</Button>
                </>
            }
        >
            <p>Toto je potřeba potvrdit.</p> 
        </Modal>
        <Modal 
            active={showSuccess} 
            variant="success"
            onDismiss={()=>setShowSuccess(false)} 
            title="Dokončeno"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{ setShowSuccess(false); }}>OK</Button>
                </>
            }
        >
            <p>Něco se povedlo.</p> 
        </Modal>
        <Modal 
            active={showDanger} 
            variant="danger"
            onDismiss={()=>setShowDanger(false)} 
            title="Pozor"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{ setShowDanger(false); }}>OK</Button>
                    <Button variant="light" outline onClick={async ()=>{ setShowDanger(false); }}>Zavřít</Button>
                </>
            }
        >
            <p>Teď si dejte opravdu pozor.</p> 
        </Modal>
        <Modal 
            active={showError} 
            variant="error"
            onDismiss={()=>setShowError(false)} 
            title="Chyba"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{ setShowError(false); }}>OK</Button>
                </>
            }
        >
            <p>Došlo k chybě.</p> 
        </Modal>
        <Modal 
            active={showResult} 
            variant="success"
            onDismiss={()=>setShowResult(false)} 
            title="Odeslaná data"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{ setShowResult(false); }}>Zavřít</Button>
                </>
            }
        >
            <pre>
                {JSON.stringify(formResult,null,41)}
            </pre>
        </Modal>
        </>
    );
}

export default Test;