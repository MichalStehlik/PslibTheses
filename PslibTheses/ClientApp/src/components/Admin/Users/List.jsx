import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {Link} from "react-router-dom";
import {DataTable, BoolColumnFilter, ListColumnFilter, ActionLink, ButtonBlock, Button, Modal, Paragraph} from "../../general";
import {Genders} from "../../../configuration/constants";
import { useAppContext, SET_TITLE, ADD_MESSAGE } from "../../../providers/ApplicationProvider";
import axios from "axios";

const LOCAL_STORAGE_ID = "prace2-adminusers-state";

const List = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [{ accessToken }, dispatch] = useAppContext();

    const [selectedRows, setSelectedRows] = useState([]);
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    let storedTableState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ID));

    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Seznam uživatelů"}); },[dispatch]);

    const columns = useMemo(() => [
      {Header: "Ikona", accessor: "iconImage", disableFilters:true, disableSortBy: true, Cell: (data)=>(data.cell.value !== null ? <img height="32" alt="" src={"data:" + data.row.original.iconImageType + ";base64," + data.cell.value} /> : "")},
      {Header: "Jméno", accessor: "firstName"},
      {Header: "Příjmení", accessor: "lastName"},
      {Header: "Email", accessor: "email"},
      {Header: "Pohlaví", accessor: "gender", disableSortBy: true, Cell: (data)=>{return Genders[data.cell.value] !== undefined ? Genders[data.cell.value] : ""}, Filter: (column) => {return ListColumnFilter(column, Genders)}},
      {Header: "Autor", accessor: "canBeAuthor", disableSortBy: true, Cell: (data)=>(data.cell.value === true ? "Ano" : "Ne"), Filter: BoolColumnFilter},
      {Header: "Hodnotitel", accessor: "canBeEvaluator", disableSortBy: true, Cell: (data)=>(data.cell.value === true ? "Ano" : "Ne"), Filter: BoolColumnFilter},
      {Header: "Akce", Cell: (data)=>(<Link to={"/admin/users/" + data.row.original.id}>Detail</Link>)}
  ],[]);  

    const fetchData = useCallback(({page, size, sort, filters})=>{
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
              case "gender": parameters.push("gender=" + f.value); break;
              case "firstName": parameters.push("firstname=" + f.value); break;
              case "lastName": parameters.push("lastname=" + f.value); break;
              case "email": parameters.push("email=" + f.value); break;
              case "canBeAuthor": parameters.push("author=" + f.value); break;
              case "canBeEvaluator": parameters.push("evaluator=" + f.value); break;
              default: break;
            }
          }
        }      
        axios.get(process.env.REACT_APP_API_URL + "/users?" + parameters.join("&"), {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
        .then(response => {
          setData(response.data.data);
          setTotalPages(response.data.pages);
        })
        .catch(error => {
          if (error.response)
          {
            setError({text:  error.response.statusText, status: error.response.status});
          }
          else
          {
            setError({text:  "Neznámá chyba", status: ""});
          }
        })
        .then(()=>{
          setIsLoading(false);
        });    
      })();    
    },[accessToken]);
    
    return (
      <>
      <>
      <ActionLink to="/admin">Administrace</ActionLink>
      <ActionLink to="/admin/users/create">Vytvoření</ActionLink>
      </>
            <DataTable
                columns={columns}
                data={data}
                fetchData={fetchData}
                isLoading={isLoading}
                error={error}
                totalPages={totalPages}
                storageId={LOCAL_STORAGE_ID}
                showRowSelect={true}
                setSelectedRows={setSelectedRows}
                initialState={storedTableState} />
            {selectedRows.length > 0
                ?
                <ButtonBlock>
                    <Button size="8pt" variant="warning" onClick={e => {
                        for (var w of selectedRows) {
                            axios.put(process.env.REACT_APP_API_URL + "/users/" + w.id + "/author/true", {
                                newValue: 1
                            }, {
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "application/json"
                                }
                            })
                                .then(response => {
                                    dispatch({ type: ADD_MESSAGE, text: "Práva uživatele byla změněna.", variant: "success", dismissible: true, expiration: 3 });
                                })
                                .catch(error => {
                                    if (error.response) {
                                        dispatch({ type: ADD_MESSAGE, text: "Práva uživatele se nepodařilo změnit. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                    else {
                                        dispatch({ type: ADD_MESSAGE, text: "Práva uživatele se nepodařilo změnit.", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                })
                                .then(() => {
                                    fetchData({ page: 0, size: 100, sort: [], filters: [] });
                                })
                        }
                    }}>Je autor</Button>
                    <Button size="8pt" variant="warning" onClick={e => {
                        for (var w of selectedRows) {
                            axios.put(process.env.REACT_APP_API_URL + "/users/" + w.id + "/author/false", {
                                newValue: 0
                            }, {
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "application/json"
                                }
                            })
                                .then(response => {
                                    dispatch({ type: ADD_MESSAGE, text: "Práva uživatele byla změněna.", variant: "success", dismissible: true, expiration: 3 });
                                })
                                .catch(error => {
                                    if (error.response) {
                                        dispatch({ type: ADD_MESSAGE, text: "Práva uživatele se nepodařilo změnit. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                    else {
                                        dispatch({ type: ADD_MESSAGE, text: "Práva uživatele se nepodařilo změnit.", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                })
                                .then(() => {
                                    fetchData({ page: 0, size: 100, sort: [], filters: [] });
                                })
                        }
                    }}>Není autor</Button>
                    <Button size="8pt" variant="warning" onClick={e => {
                        for (var w of selectedRows) {
                            axios.put(process.env.REACT_APP_API_URL + "/users/" + w.id + "/evaluator/true", {
                                newValue: 1
                            }, {
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "application/json"
                                }
                            })
                                .then(response => {
                                    dispatch({ type: ADD_MESSAGE, text: "Práva uživatele byla změněna.", variant: "success", dismissible: true, expiration: 3 });
                                })
                                .catch(error => {
                                    if (error.response) {
                                        dispatch({ type: ADD_MESSAGE, text: "Práva uživatele se nepodařilo změnit. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                    else {
                                        dispatch({ type: ADD_MESSAGE, text: "Práva uživatele se nepodařilo změnit.", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                })
                                .then(() => {
                                    fetchData({ page: 0, size: 100, sort: [], filters: [] });
                                })
                        }
                    }}>Je hodnotitel</Button>
                    <Button size="8pt" variant="warning" onClick={e => {
                        for (var w of selectedRows) {
                            axios.put(process.env.REACT_APP_API_URL + "/users/" + w.id + "/evaluator/false", {
                                newValue: 0
                            }, {
                                headers: {
                                    Authorization: "Bearer " + accessToken,
                                    "Content-Type": "application/json"
                                }
                            })
                                .then(response => {
                                    dispatch({ type: ADD_MESSAGE, text: "Práva uživatele byla změněna.", variant: "success", dismissible: true, expiration: 3 });
                                })
                                .catch(error => {
                                    if (error.response) {
                                        dispatch({ type: ADD_MESSAGE, text: "Práva uživatele se nepodařilo změnit. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                    else {
                                        dispatch({ type: ADD_MESSAGE, text: "Práva uživatele se nepodařilo změnit.", variant: "error", dismissible: true, expiration: 3 });
                                    }
                                })
                                .then(() => {
                                    fetchData({ page: 0, size: 100, sort: [], filters: [] });
                                })
                        }
                    }}>Není hodnotitel</Button>
                    <Button size="8pt" variant="danger" onClick={() => { setShowDelete(true) }} disabled={isDeleting}>{!isDeleting ? "Smazání" : "Pracuji"}</Button>
                 </ButtonBlock>
                 :
                null
            }
            <Modal
                active={showDelete}
                variant="danger"
                onDismiss={() => setShowDelete(false)}
                title="Opravdu smazat uživatele?"
                actions={
                    <>
                        <Button outline variant="light" onClick={async () => {
                            setIsDeleting(true);
                            for (var w of selectedRows) {
                                axios.delete(process.env.REACT_APP_API_URL + "/users/" + w.id, { headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" } })
                                    .then(response => {
                                        dispatch({ type: ADD_MESSAGE, text: "Uživatel " + w.name + " byla smazána.", variant: "success", dismissible: true, expiration: 3 });
                                    })
                                    .catch(error => {
                                        if (error.response) {
                                            dispatch({ type: ADD_MESSAGE, text: "Smazání uživatele se nepodařilo. (" + error.response.status + ")", variant: "error", dismissible: true, expiration: 3 });
                                        }
                                        else {
                                            dispatch({ type: ADD_MESSAGE, text: "Smazání uživatele se nepodařilo.", variant: "error", dismissible: true, expiration: 3 });
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
                <Paragraph>Chystáte se smazat následující uživatele:</Paragraph>
                <ol>
                    {selectedRows.map((item, index) => (<li key={index}>{item.lastName + " " + item.firstName}</li>))}
                </ol>
                <Paragraph>Takto smazané uživatele nebude možné nijak obnovit.</Paragraph>
            </Modal>
      </>
    );
}

export default List;