import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Card, CardHeader, CardBody, CardTypeValueList, CardTypeValueItem, Heading, Subheading, Loader, TableWrapper, Table, TableRow, TableHeader, TableBody, HeadCell, DataCell, CardFooter, TableFooter } from "../../general";


const Mark = props => {
    return (
        <Card>
            <CardHeader>
                <Subheading>Výsledná známka</Subheading>
            </CardHeader>
        </Card>
        );
}

export default Mark;