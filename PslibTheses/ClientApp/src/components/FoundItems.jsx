import React from "react";
import styled from 'styled-components';
import {Link} from "react-router-dom";
import {ReactComponent as UserIcon} from "../assets/icons/user.svg";
import {ReactComponent as IdeaIcon} from "../assets/icons/lightbulb.svg";
import {ReactComponent as WorkIcon} from "../assets/icons/graduate.svg";
import { ReactComponent as SetIcon } from "../assets/icons/folder.svg";
import { Heading } from "../components/general";

const StyledFoundItems = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
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

const FoundItem = ({item}) => {
    let area = "";
    let icon;
    switch (item.type)
    {
        case 0: area = "ideas"; icon = <IdeaIcon fill="white" height="2em" />; break;
        case 1: area = "works"; icon = <WorkIcon fill="white" height="2em" />; break;
        case 2: area = "users"; icon = <UserIcon fill="white" height="2em" />; break;
        case 3: area = "sets"; icon = <SetIcon fill="white" height="2em" />; break;
    }
    return (
        <StyledFoundItem to={"/" + area + "/" + item.id}>
            <StyledFoundItemIcon>{icon}</StyledFoundItemIcon>
            <StyledFoundItemName>{item.name}</StyledFoundItemName>
            <StyledFoundItemDescription>{item.description}</StyledFoundItemDescription>
        </StyledFoundItem>
    );
}

const FoundItems = ({items}) => {
    return (
        <>
            <Heading>Nalezený obsah</Heading>
            <p>Bylo nalezeno { items.length } předmětů odpovídajících hledanému výrazu.</p>
            <StyledFoundItems>
            {items.map((item,index)=>(
                <FoundItem key={index} item={item} />
            ))}
            </StyledFoundItems>
        </>
    );
}

export default FoundItems;