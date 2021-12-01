import React from 'react';
import { MODE_EVALUATORS, MODE_TERM, MODE_OVERALL } from "./List";
import DetailPageEvaluators from "./DetailPageEvaluators";

export const DetailPager = ({ mode, ...rest }) => {
    switch (mode) {
        case MODE_TERM: return "Term";
        case MODE_OVERALL: return "Overall";
        default: return <DetailPageEvaluators mode={mode} {...rest} />
    }
}

export default DetailPager;