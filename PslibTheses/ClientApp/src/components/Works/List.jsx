import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {Link} from "react-router-dom";
import {DataTable, ListColumnFilter, ActionLink} from "../general";
import {DateTime} from "../common";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import axios from "axios";
import {WorkStates} from "../../configuration/constants";

const List = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const [data, setData] = useState([]);
    const [setsData, setSetsData] = useState({});
    const [totalPages, setTotalPages] = useState(0);
    const [{accessToken}, dispatch] = useAppContext();

    useEffect(()=>{ 
      dispatch({type: SET_TITLE, payload: "Seznam prací"}); 
    },[dispatch]);

    useEffect(()=>{ 
      axios.get(process.env.REACT_APP_API_URL + "/sets", {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
      .then(response => {
        let sets = {};
        for(let set of response.data.data)
        {
          sets[set.id] = set.name;
        }
        setSetsData(sets);
      })
      .catch(error => {
        setSetsData({});
      });
    },[accessToken]);
     
    const columns = useMemo(() => [
        {Header: "Název", accessor: "name"},      
        {Header: "Jméno", accessor: "authorFirstName"},
        {Header: "Příjmení", accessor: "authorLastName"},
        {Header: "Třída", accessor: "className"},
        {Header: "Jméno vedoucího", accessor: "managerFirstName"},
        {Header: "Příjmení vedoucího", accessor: "managerLastName"},
        {Header: "Rok", accessor: "year"},
        {Header: "Sada", accessor: "setName", disableSortBy: true, Filter: (column) => {return ListColumnFilter(column, setsData)}},
        {Header: "Stav", accessor: "state", Cell: data => (WorkStates[data.cell.value]), Filter: (column) => {return ListColumnFilter(column, WorkStates)}},
        {Header: "Aktualizace", accessor: "updated", disableFilters:true, Cell: (data)=>(<DateTime date={data.cell.value} />)},
        {Header: "Akce", Cell: (data)=>(<Link to={"/works/" + data.row.original.id}>Detail</Link>)}
    ],[setsData]);  

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
                case "name": parameters.push("name=" + f.value); break;
                case "userId": parameters.push("userId=" + f.value); break;
                case "authorFirstName": parameters.push("firstname=" + f.value); break;
                case "authorLastName": parameters.push("lastname=" + f.value); break;
                case "managerFirstName": parameters.push("managerfirstname=" + f.value); break;
                case "managerLastName": parameters.push("managerlastname=" + f.value); break;
                case "setName": parameters.push("setId=" + f.value); break;
                case "state": parameters.push("state=" + f.value); break;
                case "year": parameters.push("year=" + f.value); break;
                case "className": parameters.push("classname=" + f.value); break;
                default: break;
            }
          }
        }
        axios.get(process.env.REACT_APP_API_URL + "/works?" + parameters.join("&"), {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
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
      <ActionLink to="/works/create">Rychlé vytvoření</ActionLink>
      </>
      <DataTable columns={columns} data={data} fetchData={fetchData} isLoading={isLoading} error={error} totalPages={totalPages} />
      </>
    );
};

export default List;