import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import { DataTable, ListColumnFilter, ActionLink, Select } from "../general";
import { useAppContext } from "../../providers/ApplicationProvider";
import { WorkStates } from "../../configuration/constants";
import { DetailPager } from "./DetailPager";
import axios from "axios";

const LOCAL_STORAGE_ID = "prace2-overviewworks-state";

export const MODE_EVALUATORS = "MODE_EVALUATORS";
export const MODE_OVERALL = "MODE_OVERALL";
export const MODE_TERM = "MODE_TERM";

export const List = ({ set, roles, terms }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [{ accessToken }, dispatch] = useAppContext();

    const [mode, setMode] = useState(MODE_EVALUATORS);

    let storedTableState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ID));

    const rolesColums = roles.map((item) => ({ Header: item.name, Cell: (data) => (<DetailPager mode={mode} set={set} role={item} work={ data.data[0] } />)}));

    const columns = useMemo(() => [
        { Header: "Název", accessor: "name" },
        { Header: "Jméno", accessor: "authorFirstName" },
        { Header: "Příjmení", accessor: "authorLastName" },
        { Header: "Třída", accessor: "className" },
        ...rolesColums,
        { Header: "Stav", accessor: "state", Cell: data => (WorkStates[data.cell.value]), Filter: (column) => { return ListColumnFilter(column, WorkStates) } },
        { Header: "Akce", Cell: (data) => (<Link to={"/works/" + data.row.original.id}>Detail</Link>) }
    ], [mode]);

    const fetchData = useCallback(({ page, size, sort, filters }) => {
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
    }, [accessToken]);

    return (
        <>
            <div>
                <Select onChange={e => { setMode(e.target.value) }}>
                    <option selected={mode === MODE_EVALUATORS ? 1 : 0} value={ MODE_EVALUATORS }>Hodnotitelé</option>
                    <option selected={mode === MODE_TERM ? 1 : 0} value={ MODE_TERM } >Hodnocení v termínech</option>
                    <option selected={mode === MODE_OVERALL ? 1 : 0} value="MODE_OVERALL" >Celkové hodnocení</option>
                </Select>
            </div>
            <DataTable
                columns={columns}
                data={data}
                fetchData={fetchData}
                isLoading={isLoading}
                error={error}
                totalPages={totalPages}
                initialState={storedTableState}
                storageId={LOCAL_STORAGE_ID}
            />
        </>
        );
}

export default List;