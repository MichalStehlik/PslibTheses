import React from 'react';
import styled from 'styled-components';
import {ReactComponent as UserIcon} from "../../assets/icons/user.svg";
import {ReactComponent as EditIcon} from "../../assets/icons/pen.svg";
import {ReactComponent as CreateIcon} from "../../assets/icons/create.svg";
import {ReactComponent as AddIcon} from "../../assets/icons/plus.svg";
import {ReactComponent as RemoveIcon} from "../../assets/icons/minus.svg";
import {ReactComponent as LockedIcon} from "../../assets/icons/lock.svg";
import {ReactComponent as UnlockedIcon} from "../../assets/icons/lock_open.svg";
import {ReactComponent as AlertIcon} from "../../assets/icons/bell.svg";
import {ReactComponent as CheckmarkIcon} from "../../assets/icons/check.svg";
import {ReactComponent as CrossIcon} from "../../assets/icons/cross.svg";
import {ReactComponent as CancelIcon} from "../../assets/icons/cross.svg";
import {ReactComponent as BlockedIcon} from "../../assets/icons/blocked.svg";
import {ReactComponent as BinIcon} from "../../assets/icons/trash.svg";
import {ReactComponent as CogIcon} from "../../assets/icons/cog.svg";
import {ReactComponent as PreviousIcon} from "../../assets/icons/chevron_left.svg";
import {ReactComponent as NextIcon} from "../../assets/icons/chevron_right.svg";
import {ReactComponent as FirstIcon} from "../../assets/icons/chevron_left_double.svg";
import {ReactComponent as LastIcon} from "../../assets/icons/chevron_right_double.svg";
import {ReactComponent as ArrowUpIcon} from "../../assets/icons/arrow_up.svg";
import {ReactComponent as ArrowDownIcon} from "../../assets/icons/arrow_down.svg";
import {ReactComponent as ArrowLeftIcon} from "../../assets/icons/arrow_left.svg";
import {ReactComponent as ArrowRightIcon} from "../../assets/icons/arrow_right.svg";
import {ReactComponent as ResetIcon} from "../../assets/icons/reset.svg";
import {ReactComponent as FilterIcon} from "../../assets/icons/filter.svg";
import {ReactComponent as SearchIcon} from "../../assets/icons/search.svg";

const StyledMiniButton = styled.span`
display: inline-flex;
align-items: center;
justify-content: center;
width: ${props => props.size};
height: ${props => props.size};
color: ${props => props.disabled ? props.theme.disabledForeground : props.color};
background-color: ${props => props.background ? props.background : "transparent"};
border-radius: 50%;
cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
position: relative;
margin: .1rem;
& > * {
    flex: 0 0 65%;
}
& > svg {
    fill: ${props => props.disabled ? props.theme.colors.disabledForeground : props.color};
    stroke: ${props => props.disabled ? props.theme.colors.disabledForeground : props.color};
    height: 100%;
    stroke-width: .15em;
}
`;

const MiniButton = props => {
    return (
    <StyledMiniButton {...props}>
        {props.glyph}
    </StyledMiniButton>
    );
}

StyledMiniButton.defaultProps = {
    color: "#555",
    size: "2rem"
}

export const EditMiniButton = props => (
    <MiniButton {...props} glyph={<EditIcon />} />
);

export const UserMiniButton = props => (
    <MiniButton {...props} glyph={<UserIcon />} />
);

export const CreateMiniButton = props => (
    <MiniButton {...props} glyph={<CreateIcon />} />
);

export const AddMiniButton = props => (
    <MiniButton {...props} glyph={<AddIcon />} />
);

export const RemoveMiniButton = props => (
    <MiniButton {...props} glyph={<RemoveIcon />} />
);

export const LockedMiniButton = props => (
    <MiniButton {...props} glyph={<LockedIcon />} />
);

export const UnlockedMiniButton = props => (
    <MiniButton {...props} glyph={<UnlockedIcon />} />
);

export const YesMiniButton = props => (
    <MiniButton {...props} glyph={<CheckmarkIcon />} />
);
YesMiniButton.defaultProps = {
}

export const NoMiniButton = props => (
    <MiniButton {...props} glyph={<CrossIcon />} />
);
NoMiniButton.defaultProps = {
}

export const CancelMiniButton = props => (
    <MiniButton {...props} glyph={<CrossIcon />} />
);
export const NextMiniButton = props => (
    <MiniButton {...props} glyph={<NextIcon />} />
);
export const LastMiniButton = props => (
    <MiniButton {...props} glyph={<LastIcon />} />
);
export const PreviousMiniButton = props => (
    <MiniButton {...props} glyph={<PreviousIcon />} />
);
export const FirstMiniButton = props => (
    <MiniButton {...props} glyph={<FirstIcon />} />
);
CancelMiniButton.defaultProps = {
}

export const AlertMiniButton = props => (
    <MiniButton {...props} glyph={<AlertIcon />} />
);

export const DeleteMiniButton = props => (
    <MiniButton {...props} glyph={<BinIcon />} />
);

export const UpMiniButton = props => (
    <MiniButton {...props} glyph={<ArrowUpIcon />} />
);

export const DownMiniButton = props => (
    <MiniButton {...props} glyph={<ArrowDownIcon />} />
);

export const LeftMiniButton = props => (
    <MiniButton {...props} glyph={<ArrowLeftIcon />} />
);

export const RightMiniButton = props => (
    <MiniButton {...props} glyph={<ArrowRightIcon />} />
);

export const ResetMiniButton = props => (
    <MiniButton {...props} glyph={<ResetIcon />} />
);

export const FilterMiniButton = props => (
    <MiniButton {...props} glyph={<FilterIcon />} />
);

export const SearchMiniButton = props => (
    <MiniButton {...props} glyph={<SearchIcon />} />
);

export default MiniButton;