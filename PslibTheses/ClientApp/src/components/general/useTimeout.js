import {useEffect, useRef} from 'react';

const useTimeout = (callback, delay) => {
    const savedCallback = useRef();
    useEffect(()=>{
        savedCallback.current = callback;
    },[callback]);
    useEffect(()=>{
        if (delay !== null){
            let tout = setTimeout(()=>savedCallback.current(), delay);
            return ()=>clearTimeout(tout);
        }
    },[delay]);
}

export default useTimeout;