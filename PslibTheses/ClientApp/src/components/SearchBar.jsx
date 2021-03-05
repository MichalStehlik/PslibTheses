import React, {useState, useContext} from "react";
import {Input, SearchMiniButton} from "./general";
import styled, {ThemeContext} from 'styled-components';
import axios from "axios";

const StyledSearchBar = styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
`;
const StyledSearchInput = styled(Input)`
    flex-grow: 1;
    border-bottom-color: ${props => props.theme.colors.menuForeground};
    color: ${props => props.theme.colors.menuForeground};
&:focus {
    box-shadow: 0 6px 3px -3px rgba(255,255,255,.3);
    outline: none;
}
`;

const SearchBar = ({setSearchResults, ...rest}) => {
    const [searchText, setSearchText] = useState("");
    const themeContext = useContext(ThemeContext);
    const processSearch = (text) => {
        axios.get(process.env.REACT_APP_API_URL + "/search?search=" + text)
        .then(response => {
            if (response.data )
            setSearchResults(response.data);
        })
    }
    return (
        <StyledSearchBar>
            <StyledSearchInput 
                autoFocus={true} 
                placeholder="Název hledané práce, zadání nebo jména uživatele"
                value={searchText} 
                onChange={e=>{
                    setSearchText(e.target.value);
                    if (e.target.value.length >= 3) processSearch(e.target.value); else setSearchResults([]);
                }}
                onKeyDown={e=>{
                    if(e.key === "Enter")
                        processSearch(e.target.value);
                }} 
            />
            <SearchMiniButton color={themeContext.colors.menuForeground} disabled={searchText.length === 0} />
        </StyledSearchBar>
    );
}

export default SearchBar;