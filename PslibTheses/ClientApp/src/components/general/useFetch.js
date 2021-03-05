import {useState, useEffect} from "react";
import axios from "axios";

export const useFetch = (url, options, dependencies = [], callback = null) => {
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    useEffect(() => {
            setIsLoading(true);
            setError(false);
            axios.get(url, options)
            .then(response => {
                setResponse(response.data);
                //callback();
            })
            .catch(error => {
                if (error.response) {
                    setError({status: error.response.status, text: error.response.statusText});
                }
                else
                {
                    setError({status: 0, text: "Neznámá chyba"});
                }
            })
            .then(()=>{setIsLoading(false);});        
    },[url, ...dependencies]);
    return {response, error, isLoading};
}

export default useFetch;