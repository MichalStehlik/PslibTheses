import React, {useState} from 'react';
import styled from 'styled-components';
import { Subheading, CardHeader, CardBody,  Table, TableHeader, TableBody, TableRow, DataCell, HeadCell, RemoveMiniButton, AddMiniButton, EditMiniButton, Modal, Paragraph, Button } from "../../general";
import {CONTENT_ADD_ROLE, CONTENT_ADD_TERM, CONTENT_EDIT_ROLE, CONTENT_EDIT_TERM} from "./Content";
import {useAppContext, ADD_MESSAGE} from "../../../providers/ApplicationProvider";
import TermRoleStats from "./TermRoleStats";
import axios from "axios";

export const RoleContainer = styled.div`
    display: flex;
    align-items: center;
`;

export const TermContainer = styled.div`
    display: flex;
    align-items: center;
`;

export const IconContainer = styled.div`
    display: flex;
`;

const ContentTable = props => {
    const [{accessToken}, dispatch] = useAppContext();
    const [showRoleDelete, setShowRoleDelete] = useState(null);
    const [showTermDelete, setShowTermDelete] = useState(null);
    return (
        <>
        <CardHeader>
            <Subheading>Termíny a role</Subheading>
        </CardHeader>
        <CardBody>
        <Table width="100%">
            <TableHeader>
                <TableRow>
                    <HeadCell rowSpan="2">Termíny</HeadCell>
                    <HeadCell colSpan="1000">Role</HeadCell>
                </TableRow>
                <TableRow>
                    {props.roles.map((item, index) => (
                        <HeadCell key={index}>
                            <RoleContainer>
                                {item.name}
                                <IconContainer>
                                    <EditMiniButton onClick={e => {props.setEditedRole(item.id); props.setContentMode(CONTENT_EDIT_ROLE)}} />
                                    {props.worksCount !== null && props.worksCount === 0 ? <RemoveMiniButton onClick={e => {setShowRoleDelete(item.id)}} /> : ""}
                                </IconContainer>
                            </RoleContainer>
                        </HeadCell>
                    ))}
                    <HeadCell horizontal="center">{props.worksCount !== null && props.worksCount === 0 ? <AddMiniButton onClick={e => props.setContentMode(CONTENT_ADD_ROLE)} /> : "" }</HeadCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {props.terms.map((termItem, index) => (
                    <TableRow key={index}>
                        <HeadCell>
                            <TermContainer>
                                {termItem.name} 
                                <IconContainer>
                                    <EditMiniButton onClick={e => {props.setEditedTerm(termItem.id); props.setContentMode(CONTENT_EDIT_TERM)}} />
                                    <RemoveMiniButton onClick={e => {setShowTermDelete(termItem.id)}} />
                                </IconContainer>
                            </TermContainer>
                        </HeadCell>
                        {props.roles.map((roleItem, index) => (
                            <DataCell key={index}>
                                <TermRoleStats set={props.setId} role={roleItem.id} term={termItem.id} />
                            </DataCell>
                        ))}
                        <DataCell>
                        </DataCell>
                    </TableRow>
                ))}
                <TableRow>
                    <HeadCell horizontal="center"><AddMiniButton onClick={e => props.setContentMode(CONTENT_ADD_TERM)} /></HeadCell>
                    <DataCell colSpan="1000"></DataCell>
                </TableRow>
            </TableBody>
        </Table>
        </CardBody>
        <Modal 
            active={showRoleDelete} 
            variant="danger"
            onDismiss={()=>setShowRoleDelete(null)} 
            title="Opravdu smazat roli?"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{
                        axios.delete(process.env.REACT_APP_API_URL + "/sets/" + props.setId + "/roles/" + showRoleDelete, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                        .then(response => {
                            dispatch({type: ADD_MESSAGE, text: "Role byla odstraněna.", variant: "success", dismissible: true, expiration: 3});
                            props.fetchRoles();
                        })
                        .catch(error => {
                            if (error.response)
                            {
                                if (error.response.status === 500)
                                {
                                    dispatch({type: ADD_MESSAGE, text: "Server nedokázal smazat záznam role. Důvodem může být chyba serveru nebo ochrana konzistence dat.", variant: "error", dismissible: true, expiration: 8});
                                }
                                else
                                {
                                    dispatch({type: ADD_MESSAGE, text: "Smazání role se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                                }
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání role se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                            }
                        })
                        .then(()=>{
                            setShowRoleDelete(null);
                        });
                        setShowRoleDelete(null); 
                    }}>Smazat</Button>
                    <Button variant="light" outline onClick={async ()=>{ setShowRoleDelete(null); }}>Storno</Button>
                </>
            }
        >
            <Paragraph>Takto smazanou roli nebude možné nijak obnovit.</Paragraph>
            <Paragraph>Smazání role nebude úspěšné, pokud v ní již existují nějaké otázky.</Paragraph>
        </Modal>
        <Modal 
            active={showTermDelete} 
            variant="danger"
            onDismiss={()=>setShowTermDelete(null)} 
            title="Opravdu smazat termín?"
            actions={
                <>
                    <Button variant="light" outline onClick={async ()=>{
                        axios.delete(process.env.REACT_APP_API_URL + "/sets/" + props.setId + "/terms/" + showTermDelete, {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
                        .then(response => {
                            dispatch({type: ADD_MESSAGE, text: "Termín byl odstraněn.", variant: "success", dismissible: true, expiration: 3});
                            props.fetchTerms();
                        })
                        .catch(error => {
                            if (error.response)
                            {
                                if (error.response.status === 500)
                                {
                                    dispatch({type: ADD_MESSAGE, text: "Server nedokázal smazat záznam termínu. Důvodem může být chyba serveru nebo ochrana konzistence dat.", variant: "error", dismissible: true, expiration: 8});
                                }
                                else
                                {
                                    dispatch({type: ADD_MESSAGE, text: "Smazání termínu se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3});
                                }
                            }
                            else
                            {
                                dispatch({type: ADD_MESSAGE, text: "Smazání termínu se nepodařilo.", variant: "error", dismissible: true, expiration: 3});
                            }
                        })
                        .then(()=>{
                            setShowTermDelete(null);
                        });
                        setShowTermDelete(null); 
                    }}>Smazat</Button>
                    <Button variant="light" outline onClick={async ()=>{ setShowTermDelete(null); }}>Storno</Button>
                </>
            }
        >
            <Paragraph>Takto smazaný termín nebude možné nijak obnovit.</Paragraph>
            <Paragraph>Smazání termínu nebude úspěšné, pokud v něm již existují nějaké otázky.</Paragraph>
        </Modal>
        </>
    )
}

export default ContentTable;