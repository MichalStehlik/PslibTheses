import React from "react";
import styled from 'styled-components';
import {Link} from "react-router-dom";
import {ReactComponent as UserIcon} from "../assets/icons/user.svg";
import {ReactComponent as IdeaIcon} from "../assets/icons/lightbulb.svg";
import {ReactComponent as WorkIcon} from "../assets/icons/graduate.svg";
import { ReactComponent as SetIcon } from "../assets/icons/folder.svg";
import { Heading, CancelMiniButton } from "../components/general";

const StyledFoundPage = styled.div`
    background-color: ${props => props.theme.colors.headerBackground};
    color: ${props => props.theme.colors.desktopForeground};
    padding: 15px;
    border-bottom: 1px solid #ccc;
    box-shadow: 5px 5px 10px 5px rgb(10 10 5 / 20%)
`;

const StyledFoundItems = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    z-index: 100;
`;

const StyledFoundItem = styled(Link)`
    display: grid;
    grid-template-columns: 50px auto;
    grid-template-areas: "icon name" "icon description";
    border-bottom: 1px solid #bbbbbb;
    padding: 5px;
    margin-bottom: .2rem;
    text-decoration: none;
    color: black;
    &:hover {
        background-color: rgba(200,200,200, .3);
    }
`;

const StyledFoundItemIcon = styled.div`
    grid-area: icon;
    display: flex;
    justify-content: center;
    align-items: center;
    & > svg {
        width: 18px;
        fill: black;
    }
`;

const StyledFoundItemName = styled.p`
    grid-area: name;
    font-size: 1em;
    margin: .2rem;
`;

const StyledFoundItemDescription = styled.small`
    grid-area: description;
    font-size: .8em;
    margin: .2rem;
`;

const FoundItem = ({ item, setSearchTerm }) => {
    let area = "";
    let icon;
    switch (item.type)
    {
        case 0: area = "ideas"; icon = <IdeaIcon fill="white" height="2em" />; break;
        case 1: area = "works"; icon = <WorkIcon fill="white" height="2em" />; break;
        case 2: area = "users"; icon = <UserIcon fill="white" height="2em" />; break;
        default: area = "sets"; icon = <SetIcon fill="white" height="2em" />; break;
    }
    return (
        <StyledFoundItem to={"/" + area + "/" + item.id} onClick={e => { setSearchTerm("") }}>
            <StyledFoundItemIcon>{icon}</StyledFoundItemIcon>
            <StyledFoundItemName>{item.name}</StyledFoundItemName>
            <StyledFoundItemDescription>{item.description}</StyledFoundItemDescription>
        </StyledFoundItem>
    );
}

const FoundItems = ({items, setSearchTerm, searchTerm}) => {
    return (
        <StyledFoundPage>
            <Heading>Nalezený obsah <CancelMiniButton onClick={e => setSearchTerm("")} /></Heading>
            <p>Bylo nalezeno <b>{Array.isArray(items) && items.length ? items.length : 0}</b> předmětů odpovídajících hledanému výrazu <b>{ searchTerm }</b>.</p>
            <StyledFoundItems>
                {Array.isArray(items) && items.map((item, index) => (
                <FoundItem key={index} item={item} setSearchTerm={setSearchTerm} />
            ))}
            </StyledFoundItems>
        </StyledFoundPage>
    );
}

export default FoundItems;