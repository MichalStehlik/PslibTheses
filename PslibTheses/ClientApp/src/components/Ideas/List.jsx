import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {Link} from "react-router-dom";
import {DataTable, BoolColumnFilter, ListColumnFilter, ActionLink, Badge} from "../general";
import {DateTime} from "../common";
import {useAppContext, SET_TITLE} from "../../providers/ApplicationProvider";
import axios from "axios";
import {invertColor} from "../../helpers/colors";

const TargetsShowcase = props => {
  if (Array.isArray(props.targets) && (props.targets.length > 0))
  {
    return props.targets.map((item, index) => (
      <Badge key={index} style={{cursor: "default"}} background={"#" + item.color.name.substring(2,8)} color={invertColor("#" + item.color.name.substring(2,8))}>{item.text}</Badge>
    ));
  }
  else return "";
}

const List = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const [data, setData] = useState([]);
    const [targetsData, setTargetsData] = useState({});
    const [totalPages, setTotalPages] = useState(0);
    const [{accessToken}, dispatch] = useAppContext();

    useEffect(()=>{ 
      dispatch({type: SET_TITLE, payload: "Seznam námětů"}); 
    },[dispatch]);

    useEffect(()=>{ 
      axios.get(process.env.REACT_APP_API_URL + "/ideas/allTargets", {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
      .then(response => {
        let targets = {};
        for(let target of response.data)
        {
          targets[target.id] = target.text;
        }
        setTargetsData(targets);
      })
      .catch(error => {
        setTargetsData({});
      });
    },[accessToken]);
     
    const columns = useMemo(() => [
        {Header: "Název", accessor: "name"},      
        {Header: "Předmět", accessor: "subject"}, 
        {Header: "Jméno", accessor: "userFirstName"},
        {Header: "Příjmení", accessor: "userLastName"},
        {Header: "Cílové skupiny", accessor: "targets", disableSortBy: true, Cell: (data)=>(<TargetsShowcase targets={data.cell.value} />), Filter: (column) => {return ListColumnFilter(column, targetsData)}},
        {Header: "Nabízený", accessor: "offered", disableSortBy: true, Cell: (data)=>(data.cell.value === true ? "Ano" : "Ne"), Filter: BoolColumnFilter},
        {Header: "Aktualizace", accessor: "updated", disableFilters:true, Cell: (data)=>(<DateTime date={data.cell.value} />)},
        {Header: "Akce", Cell: (data)=>(<Link to={"/ideas/" + data.row.original.id}>Detail</Link>)}
    ],[targetsData]);  

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
                case "subject": parameters.push("subject=" + f.value); break;
                case "userId": parameters.push("userId=" + f.value); break;
                case "userFirstName": parameters.push("firstname=" + f.value); break;
                case "userLastName": parameters.push("lastname=" + f.value); break;
                case "offered": parameters.push("offered=" + f.value); break;
                case "targets": parameters.push("target=" + f.value); break;
                default: break;
            }
          }
        }
        axios.get(process.env.REACT_APP_API_URL + "/ideas?" + parameters.join("&"), {headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" }})
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
      <ActionLink to="/ideas/create">Vytvoření</ActionLink>
      </>
      <DataTable columns={columns} data={data} fetchData={fetchData} isLoading={isLoading} error={error} totalPages={totalPages} />
      </>
    );
};

export default List;