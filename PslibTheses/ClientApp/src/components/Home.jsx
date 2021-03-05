import React, {useEffect, useState, useContext} from 'react';
import styled, {ThemeContext} from 'styled-components';
import { PageTitle, Button, Loader } from "./general";
import NavigationLink from "./common/NavigationLink";
import {Link} from "react-router-dom";
import {useAppContext, SET_TITLE} from "../providers/ApplicationProvider";
import SearchBar from "./SearchBar";
import FoundItems from "./FoundItems";
import {ReactComponent as UserIcon} from "../assets/icons/user.svg";
import {ReactComponent as IdeaIcon} from "../assets/icons/lightbulb.svg";
import {ReactComponent as WorkIcon} from "../assets/icons/graduate.svg";
import axios from "axios";
import {mainTheme as theme} from "../App";

const TopPanel = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    box-sizing: border-box;
    backdrop-filter: blur(10px);
    background-color: rgba(100,100,100,.1);
`;

const TitleMenu = styled.div`
    display: flex;
    align-items: stretch;
`;

const EvaluatorMenu = styled.div`
    margin-top: 10px;
`;

const StyledTitleMenuItem = styled(NavigationLink)`
    padding: 5px 5px 5px 5px;
    flex: 1 1 0px;
    margin: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    &:before {
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;      
    }
    &:hover:before {
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }
`;

const StyledOtherMenuItem = styled(Link)`
    padding: 5px 5px 5px 5px;
    margin: 5px;
    color: ${props => props.theme.colors.menuForeground};
`;

const StyledTitleMenuIcon = styled.div`
    height: 2em;
    padding: .5em;
    & > svg {
        fill: ${props => props.disabled ? props.theme.colors.disabledForeground : props.theme.colors.menuForeground};
        stroke: ${props => props.disabled ? props.theme.colors.disabledForeground : props.theme.colors.menuForeground};
        height: 100%;
        stroke-width: .15em;
    }
`;

const StyledTitleMenuText = styled.div`
    font-size: 1em;
`;

const StyledTitleMenuCount = styled.div`
font-size: 1.5em;
`;


const TitleMenuItem = props => {
    let {icon, text, count, ...rest} = props;
    return (
        <StyledTitleMenuItem {...rest}>
            <StyledTitleMenuText>{text}</StyledTitleMenuText>
            {icon ? <StyledTitleMenuIcon>{icon}</StyledTitleMenuIcon> : ""}
            {count !== undefined ? <StyledTitleMenuCount>{Number(count)}</StyledTitleMenuCount> : ""}
        </StyledTitleMenuItem>
    );
}

const OtherMenuItem = props => {
    let {text, ...rest} = props;
    return (
        <StyledOtherMenuItem {...rest}>{text}</StyledOtherMenuItem>
    );
}

const TitleContainer = styled.div`
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    height: 100%;
`;

const TitleBlock = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const FrontTitle = styled(PageTitle)`
    text-align: center;
    margin-bottom: 2rem;
`;

const Home = props => {
    const [{accessToken, userManager, profile}, dispatch] = useAppContext();
    const [searchResults, setSearchResults] = useState([]);
    const [ideasCount, setIdeasCount] = useState(0);
    const [worksCount, setWorksCount] = useState(0);
    const [usersCount, setUsersCount] = useState(0);
    const [ isLoading, setIsLoading ] = useState(false);
    const themeContext = useContext(ThemeContext);
    useEffect(()=>{ dispatch({type: SET_TITLE, payload: "Úvodní stránka"}); },[dispatch]);
    useEffect(()=>{
        setIsLoading(true);
        axios.get(process.env.REACT_APP_API_URL + "/search/stats",{
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            } 
        })
        .then(response => {
            setIdeasCount(response.data.ideas);
            setWorksCount(response.data.works);
            setUsersCount(response.data.users);
        })
        .catch(error => {
            setIdeasCount("?");
            setWorksCount("?");
            setUsersCount("?");
        })
        .then(()=>{setIsLoading(false)})
    },[accessToken]);
    return (
        <>
            <TopPanel>
                <SearchBar setSearchResults={setSearchResults} />
                {accessToken 
                ? <Button outline variant="light" onClick={() => {userManager.signoutRedirect()}} >Odhlásit</Button> 
                : <Button outline variant="light" onClick={() => {userManager.signinRedirect()}} >Přihlásit</Button>}
            </TopPanel>
            <TitleContainer>
            {searchResults.length > 0
            ?
            <>
            <FoundItems items={searchResults} />
            </>
            :
            <TitleBlock>
                <FrontTitle>Dlouhodobé práce</FrontTitle>
                <TitleMenu>
                    {isLoading 
                    ? 
                    <Loader size="40px" normal={theme.colors.logoForeground} accent={theme.colors.logoBackground} />
                    :    
                    <>
                        <TitleMenuItem to="/ideas" text="Náměty" icon={<IdeaIcon />} count={ideasCount} />
                        <TitleMenuItem to="/works" text="Práce" icon={<WorkIcon />} count={worksCount} />
                        <TitleMenuItem to="/users" text="Uživatelé" icon={<UserIcon />} count={usersCount} />
                    </> 
                    }                 
                </TitleMenu>
                {accessToken !== null && profile.theses_evaluator === "1" ?
                <EvaluatorMenu>
                    <OtherMenuItem to="/overviews" text="Souhrny"/>
                    <OtherMenuItem to="/evaluation" text="Hodnocení"/>
                </EvaluatorMenu>
                :
                ""
                }
                {accessToken !== null && profile.theses_admin === "1" ?
                <EvaluatorMenu>
                    <OtherMenuItem to="/admin" text="Administrace"/>
                </EvaluatorMenu>
                :
                ""
                }          
            </TitleBlock>
            }
            </TitleContainer>
        </>
    );
}

export default Home;