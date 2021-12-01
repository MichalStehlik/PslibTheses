import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";

export const Summary = props => {
    const { set } = useParams();
    return <p>{set}</p>
}

export default Summary;