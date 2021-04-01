import React, {useContext} from "react";
import {Input, SearchMiniButton} from "./general";
import styled, {ThemeContext} from 'styled-components';

const StyledSearchBar = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`;
const StyledSearchInput = styled(Input)`
    flex-grow: 1;
    border-bottom-color: currentColor;
    color: inherit;
    width: 50px;
&:focus {
    box-shadow: 0 6px 3px -3px rgba(100,100,100,.3);
    outline: none;
}
`;

const SearchBar = ({searchAction, setSearchTerm, searchTerm, ...rest}) => {
    const themeContext = useContext(ThemeContext);
    return (
        <StyledSearchBar>
            <StyledSearchInput 
                autoFocus={true} 
                placeholder="Vyhledávání"
                value={searchTerm} 
                onChange={e=>{
                    setSearchTerm(e.target.value);
                }}
                onKeyDown={e => {
                    if (e.key === "Enter" && searchTerm.length > 0)
                        searchAction(e.target.value);
                }} 
            />
            <SearchMiniButton color={themeContext.colors.menuForeground} disabled={searchTerm.length === 0} onClick={e => { if (searchTerm.length > 0) searchAction(searchTerm) }} />
        </StyledSearchBar>
    );
}

export default SearchBar;