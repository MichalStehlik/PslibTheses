import React, {useContext} from "react";
import {Input, SearchMiniButton} from "./general";
import styled, {ThemeContext} from 'styled-components';
import axios from "axios";

const StyledSearchBar = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`;
const StyledSearchInput = styled(Input)`
    flex-grow: 1;
    border-bottom-color: ${props => props.theme.colors.menuForeground};
    color: ${props => props.theme.colors.menuForeground};
width: 50px;
&:focus {
    box-shadow: 0 6px 3px -3px rgba(255,255,255,.3);
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
                onKeyDown={e=>{
                    if(e.key === "Enter")
                        searchAction(e.target.value);
                }} 
            />
            <SearchMiniButton color={themeContext.colors.menuForeground} disabled={searchTerm.length === 0} onClick={ e => searchAction(searchTerm)} />
        </StyledSearchBar>
    );
}

export default SearchBar;