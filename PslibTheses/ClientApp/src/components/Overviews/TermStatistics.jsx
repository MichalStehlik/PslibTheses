import React from 'react';
import styled from 'styled-components';

const StatsContainer = styled.div`
display: grid;
grid-template-columns: auto auto;
grid-template-rows: 1fr 1fr;
grid-template-areas: "mark questions" "mark points";
height: 100%;
gap: .2rem 1rem;
`;
const StatsMark = styled.div`
grid-area: mark;
display: flex;
justify-content: center;
align-items: center;
padding: .3rem;
border: black solid thin;
`;
const StatsQuestions = styled.div`
grid-area: questions;
display: flex;
justify-content: center;
align-items: center;
`;
const StatsPoints = styled.div`
grid-area: points;
display: flex;
justify-content: center;
align-items: center;
`;

export const TermStatistics = ({ mark, questions, points, color }) => {
    return (
        <StatsContainer>
            <StatsMark>{mark}</StatsMark>
            <StatsQuestions title="Otázky: kritické / zodpovězené / celkem">{questions}</StatsQuestions>
            <StatsPoints title="Body: získané / z zodpovězených / celkem">{points}</StatsPoints>
        </StatsContainer>
        );
}

export default TermStatistics;