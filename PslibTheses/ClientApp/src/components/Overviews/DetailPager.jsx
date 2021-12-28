import React from 'react';
import { MODE_TERM, MODE_OVERALL } from "./List";
import DetailPageOverall from "./DetailPageOverall";
import DetailPageTerm from "./DetailPageTerm";

export const DetailPager = ({ mode, term, ...rest }) => {
    switch (mode) {
        case MODE_TERM: return term === null ? null : <DetailPageTerm mode={mode} term={term} {...rest} />;
        default: return <DetailPageOverall mode={mode} {...rest} />
    }
}

export default DetailPager;