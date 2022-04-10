import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import { DataTable, ListColumnFilter, ActionLink, Select, Button, ButtonBlock, Modal, Paragraph } from "../general";
import { useAppContext, ADD_MESSAGE } from "../../providers/ApplicationProvider";
import { WorkStates } from "../../configuration/constants";
import { DetailPager } from "./DetailPager";
import DetailPageEvaluators from "./DetailPageEvaluators";
import DetailPageEvaluatorsSimple from "./DetailPageEvaluatorsSimple";
import { ADMIN_ROLE, MANAGER_ROLE, EVALUATOR_ROLE } from "../../configuration/constants";
import axios from "axios";
import styled from 'styled-components';

const FeaturesContainer = styled.div`
border: 1px solid black;
padding: 5px;
display: flex;
flex-direction: row;
gap: .5em;
margin: 5px 0;
align-items: baseline;
background-color: #cfcfcf;
`;

const LOCAL_STORAGE_ID = "prace2-overviewworks-state";

export const MODE_OVERALL = "MODE_OVERALL";
export const MODE_TERM = "MODE_TERM";

export const List = ({ set, roles, terms }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [mode, setMode] = useState(MODE_OVERALL);
    const [evaluator, setEvaluator] = useState("");
    const [evaluators, setEvaluators] = useState([]);
    const [term, setTerm] = useState((terms && terms.length > 0) ? 0 : null);

    let storedTableState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ID));

    const columns = useMemo(() => [
        { Header: "Název", accessor: "name" },
        { Header: "Stav", accessor: "state", Cell: data => (WorkStates[data.cell.value]), Filter: (column) => { return ListColumnFilter(column, WorkStates) } },
        {
            Header: "Autor", columns: [
                { Header: "Jméno", accessor: "authorFirstName" },
                { Header: "Příjmení", accessor: "authorLastName" },
                { Header: "Třída", accessor: "className" },
            ]
        },
        ...roles.map((item, index) => ({
            Header: item.name, columns: [
                /*{ Header: item.name + ": hodnotitelé", Cell: (data) => (<DetailPageEvaluators mode={mode} set={set} role={item} work={data.row.original} />) },*/
                { Header: item.name + ": hodnotitelé", Cell: (data) => { let roleId = item.id; let dta = data.row.original.roles.filter(record => record.setRoleId === roleId); return <DetailPageEvaluatorsSimple data={/*data.row.original.roles[index]*/dta[0]} />} },
                { Header: item.name + ": hodnocení", Cell: (data) => (<DetailPager mode={mode} set={set} role={item} work={data.row.original} term={ terms[term] } />) },
            ]
        })),
        { Header: "Akce", Cell: (data) => (<><Link to={"/works/" + data.row.original.id}>Detail</Link> <Link to={"/works/" + data.row.original.id + "/overview"}>Hodnocení</Link></>) }
    ], [mode, term]);

    const fetchEvaluators = useCallback((setId) => {
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + set.id + "/evaluators", { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
            .then(response => {
                setEvaluators(response.data);
            })
            .catch(error => {
                setEvaluators([]);
            })
            .then(() => {
                
            });
    },[]);

    const fetchData = useCallback(({ page = 0, size = 100, sort = [], filters = [] }) => {
        (async () => {
            setIsLoading(true);
            setError(false);
            let parameters = [];

            let order = sort[0] ? sort[0].id : undefined;
            if (order) order = order.toLowerCase();
            if (order && sort[0].desc) order = order + "_desc";

            if (page) parameters.push("page=" + page);
            if (size) parameters.push("pageSize=" + size);
            if (order) parameters.push("order=" + order);
            if (Array.isArray(filters)) {
                for (let f of filters) {
                    switch (f.id) {
                        case "name": parameters.push("name=" + f.value); break;
                        case "userId": parameters.push("userId=" + f.value); break;
                        case "authorFirstName": parameters.push("firstname=" + f.value); break;
                        case "authorLastName": parameters.push("lastname=" + f.value); break;
                        case "managerFirstName": parameters.push("managerfirstname=" + f.value); break;
                        case "managerLastName": parameters.push("managerlastname=" + f.value); break;
                        case "state": parameters.push("state=" + f.value); break;
                        case "className": parameters.push("classname=" + f.value); break;
                        default: break;
                    }
                }
            }
            if (evaluator !== "") {
                parameters.push("evaluatorId=" + evaluator);
            }
            axios.get(process.env.REACT_APP_API_URL + "/works?setId=" + set.id + "&" + parameters.join("&"), { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
                .then(response => {
                    setData(response.data.data);
                    setTotalPages(response.data.pages);
                })
                .catch(error => {
                    if (error.response) {
                        setError({ text: error.response.statusText, status: error.response.status });
                    }
                    else {
                        setError({ text: "Neznámá chyba", status: "" });
                    }
                })
                .then(() => {
                    setIsLoading(false);
                });
        })();
    }, [accessToken, evaluator]);

    useEffect(() => {
        setShowDelete(false);
        setIsDeleting(false);
        fetchEvaluators(set.Id);
        return () => { setShowDelete(false); setIsDeleting(false); };
    }, [setShowDelete, setIsDeleting]);

    return (
        <>
            <FeaturesContainer>
                <span>Další filtry:</span>
                <Select onChange={e => { setEvaluator(e.target.value) }} value={evaluator} >
                    <option value="">-- Hodnotitel --</option>
                    {evaluators.map((item, index) => (<option key={index} value={item.id} >{item.name}</option>))}
                </Select>
                <Select onChange={e => { setMode(e.target.value) }} value={mode} >
                    <option value={ MODE_TERM } >Hodnocení v termínech</option>
                    <option value={ MODE_OVERALL } >Celkové hodnocení</option>
                </Select>
                {mode === MODE_TERM
                    ?
                    <Select onChange={e => { setTerm(Number(e.target.value)) }} value={term}>
                        {terms.map((item, index) => (<option key={index} value={index}>{item.name}</option>))}
                    </Select>
                    :
                    null
                }
            </FeaturesContainer>
            <DataTable
                columns={columns}
                data={data}
                fetchData={fetchData}
                isLoading={isLoading}
                error={error}
                totalPages={totalPages}
                initialState={storedTableState}
                storageId={LOCAL_STORAGE_ID}
                showRowSelect={true}
                setSelectedRows={ setSelectedRows }
            />
            {selectedRows.length > 0
                ?
                <ButtonBlock>
                    <Button size="8pt" variant="success" onClick={e => {
                        if (selectedRows.length > 0) {
                            let mergedId = selectedRows.map((item) => (item.id)).join(",");
                            axios({
                                url: process.env.REACT_APP_API_URL + "/works/" + mergedId + "/applications",
                                method: 'GET',
                                responseType: 'blob',
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "text/html"
                                }
                            }).then((response) => {
                                let fileContent = new Blob([response.data]);
                                const url = window.URL.createObjectURL(fileContent);
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'prihlasky.html');
                                document.body.appendChild(link);
                                link.click();
                                dispatch({ type: ADD_MESSAGE, text: "Přihlášky byly uloženy.", variant: "success", dismissible: true, expiration: 3 });
                            }).catch((error) => {
                                dispatch({ type: ADD_MESSAGE, text: "Při získávání přihlášek došlo k chybě.", variant: "error", dismissible: true, expiration: 3 });
                            })
                        }
                    }}>Přihlášky</Button>
                    <Button size="8pt" variant="success" onClick={e => {
                        if (selectedRows.length > 0) {
                            let mergedId = selectedRows.map((item) => (item.id)).join(",");
                            axios({
                                url: process.env.REACT_APP_API_URL + "/works/" + mergedId + "/list",
                                method: 'GET',
                                responseType: 'blob',
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "text/html"
                                }
                            }).then((response) => {
                                let fileContent = new Blob([response.data]);
                                const url = window.URL.createObjectURL(fileContent);
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'seznam.csv');
                                document.body.appendChild(link);
                                link.click();
                                dispatch({ type: ADD_MESSAGE, text: "Seznam byl uložen.", variant: "success", dismissible: true, expiration: 3 });
                            }).catch((error) => {
                                dispatch({ type: ADD_MESSAGE, text: "Při získávání seznamu došlo k chybě.", variant: "error", dismissible: true, expiration: 3 });
                            })
                        }
                    }}>.csv (;)</Button>
                    <Button size="8pt" variant="success" onClick={e => {
                        if (selectedRows.length > 0) {
                            let mergedId = selectedRows.map((item) => (item.id)).join(",");
                            axios({
                                url: process.env.REACT_APP_API_URL + "/works/" + mergedId + "/reviews",
                                method: 'GET',
                                responseType: 'blob',
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "text/html"
                                }
                            }).then((response) => {
                                let fileContent = new Blob([response.data]);
                                const url = window.URL.createObjectURL(fileContent);
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'hodnoceni.html');
                                document.body.appendChild(link);
                                link.click();
                                dispatch({ type: ADD_MESSAGE, text: "Posudky byly uloženy.", variant: "success", dismissible: true, expiration: 3 });
                            }).catch((error) => {
                                dispatch({ type: ADD_MESSAGE, text: "Při získávání posudků došlo k chybě.", variant: "error", dismissible: true, expiration: 3 });
                            })
                        }
                    }}>Studentské posudky</Button>
                    <Button size="8pt" variant="success" onClick={e => {
                        if (selectedRows.length > 0) {
                            let mergedId = selectedRows.map((item) => (item.id)).join(",");
                            axios({
                                url: process.env.REACT_APP_API_URL + "/works/" + mergedId + "/reviews",
                                method: 'GET',
                                responseType: 'blob',
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "text/html"
                                },
                                params: {
                                    summary: true
                                }
                            }).then((response) => {
                                let fileContent = new Blob([response.data]);
                                const url = window.URL.createObjectURL(fileContent);
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'hodnoceni.html');
                                document.body.appendChild(link);
                                link.click();
                                dispatch({ type: ADD_MESSAGE, text: "Posudky byly uloženy.", variant: "success", dismissible: true, expiration: 3 });
                            }).catch((error) => {
                                dispatch({ type: ADD_MESSAGE, text: "Při získávání posudků došlo k chybě.", variant: "error", dismissible: true, expiration: 3 });
                            })
                        }
                    }}>Posudky se známkami</Button>
                    {(profile[ADMIN_ROLE] === "1" || profile[MANAGER_ROLE] === "1") ? Object.keys(WorkStates).map((key, index) => (<Button key={index} size="8pt" variant="warning" onClick={() => {
                        for (var w of selectedRows) {
                            axios.put(process.env.REACT_APP_API_URL + "/works/" + w.id + "/state/" + key, {
                                newState: WorkStates[key]
                            }, {
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "application/json"
                                }
                            })
                            .then(response => {
                                dispatch({ type: ADD_MESSAGE, text: "Stav práce byl změněn.", variant: "success", dismissible: true, expiration: 3 });
                            })
                            .catch(error => {
                                if (error.response) {
                                    dispatch({ type: ADD_MESSAGE, text: "Stav práce se nepodařilo změnit. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                                }
                                else {
                                    dispatch({ type: ADD_MESSAGE, text: "Stav práce se nepodařilo změnit.", variant: "error", dismissible: true, expiration: 3 });
                                }
                            })
                            .then(() => {
                                fetchData({ page: 0, size: 100, sort: [], filters: [] });
                            })
                        }
                    }}>{WorkStates[key]}</Button>)) : null}
                    {(profile[ADMIN_ROLE] === "1") ? <Button size="8pt" variant="danger" onClick={() => { setShowDelete(true) }} disabled={isDeleting}>{!isDeleting ? "Smazání" : "Pracuji"}</Button> : null}
                </ButtonBlock>
                :
                null
            }
            <Modal
                active={showDelete}
                variant="danger"
                onDismiss={() => setShowDelete(false)}
                title="Opravdu smazat práce?"
                actions={
                    <>
                        <Button outline variant="light" onClick={async () => {
                            setIsDeleting(true);
                            for (var w of selectedRows) {
                                axios.delete(process.env.REACT_APP_API_URL + "/works/" + w.id, { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
                                .then(response => {
                                    dispatch({ type: ADD_MESSAGE, text: "Práce " + w.name + " byla smazána.", variant: "success", dismissible: true, expiration: 3 });
                                })
                                .catch(error => {
                                    if (error.response) {
                                        dispatch({ type: ADD_MESSAGE, text: "Smazání práce se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                    else {
                                        dispatch({ type: ADD_MESSAGE, text: "Smazání práce se nepodařilo.", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                })
                                .then(() => {
                                    setIsDeleting(false);
                                    setShowDelete(false);
                                    fetchData({ page: 0, size: 100, sort: [], filters: [] });
                                });
                            }
                        }}>Smazat</Button>
                        <Button outline variant="light" onClick={async () => { setShowDelete(false); }}>Storno</Button>
                    </>
                }
            >
                <Paragraph>Chystáte se smazat následující práce:</Paragraph>
                <ol>
                    {selectedRows.map((item, index) => (<li key={index}>{item.name + " (" + item.authorFirstName + " " + item.authorLastName + ", " + item.className + ")"}</li>))}
                </ol>
                <Paragraph>Takto smazané práci nebude možné nijak obnovit.</Paragraph>
            </Modal>
        </>
        );
}

export default List;