import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {Link} from "react-router-dom";
import {DataTable, ActionLink, BoolColumnFilter} from "../../general";
import {useAppContext, SET_TITLE} from "../../../providers/ApplicationProvider";
import axios from "axios";

const List = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [{accessToken}, dispatch] = useAppContext();

    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Seznam sad prací"}); },[dispatch]);

    const columns = useMemo(() => [
      {Header: "Název", accessor: "name"},
      {Header: "Rok", accessor: "year"},
      {Header: "Aktivní", accessor: "active", disableSortBy: true, Cell: (data)=>(data.cell.value === true ? "Ano" : "Ne"), Filter: BoolColumnFilter},
      {Header: "Akce", Cell: (data)=>(<Link to={"/admin/sets/" + data.row.original.id}>Detail</Link>)}
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
              case "name": parameters.push("name=" + f.value); break;
              case "year": parameters.push("year=" + f.value); break;
              case "active": parameters.push("active=" + f.value); break;
              default: break;
            }
          }
        }      
        axios.get(process.env.REACT_APP_API_URL + "/sets?" + parameters.join("&"), {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
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
      <ActionLink to="/admin/sets/create">Vytvoření</ActionLink>
      </>
      <DataTable columns={columns} data={data} fetchData={fetchData} isLoading={isLoading} error={error} totalPages={totalPages} />
      </>
    );
}

export default List;

/*
<ActionLink to="/admin/targets/create">Nová</ActionLink>
*/