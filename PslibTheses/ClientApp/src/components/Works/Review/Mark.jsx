import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from "../../../providers/ApplicationProvider";
import { Alert, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Subheading, Loader, TableWrapper, Table, TableRow, TableHeader, TableBody, HeadCell, DataCell, CardFooter, TableFooter } from "../../general";
import styled from 'styled-components';
import axios from "axios";

const Mark = ({ work, role }) => {
    const [{ accessToken, profile }, dispatch] = useAppContext();
    const [setData, setSetData] = useState(null);
    const [isSetLoading, setSetIsLoading] = useState(false);
    const [setError, setSetError] = useState(false);
    const fetchSet = () => {
        setSetIsLoading(true);
        setError(false);
        axios.get(process.env.REACT_APP_API_URL + "/sets/" + work.setId, {
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setSetData(response.data);
            })
            .catch(error => {
                if (error.response) {
                    setSetError({ status: error.response.status, text: error.response.statusText });
                }
                else {
                    setSetError({ status: 0, text: "Neznámá chyba" });
                }
                setSetData(null);
            });
        setSetIsLoading(false);
    };
    return (
        <Card>
            <CardHeader>
                <Subheading>Výsledná známka</Subheading>
            </CardHeader>
        </Card>
        );
}

export default Mark;