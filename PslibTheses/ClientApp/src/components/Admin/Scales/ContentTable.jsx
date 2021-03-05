import React from 'react';
import { Subheading, CardHeader, CardFooter, CardBody,  Table, TableHeader, TableBody, TableRow, DataCell, HeadCell, RemoveMiniButton, AddMiniButton } from "../../general";

const ContentTable = props => {
    return (
        <>
        <CardHeader>
            <Subheading>Stupně škály</Subheading>
        </CardHeader>
        <CardBody>
        <Table width="100%">
            <TableHeader>
                <TableRow>
                    <HeadCell>Horní hranice</HeadCell>
                    <HeadCell>Číselné hodnocení</HeadCell>
                    <HeadCell>Slovní hodnocení</HeadCell>
                    <HeadCell>Akce</HeadCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {props.data && props.data.length > 0 ?
                props.data.map((item, index) => (
                    <TableRow key={index}>
                        <DataCell>{item.rate}</DataCell>
                        <DataCell>{item.mark}</DataCell>
                        <DataCell>{item.name}</DataCell>
                        <DataCell><RemoveMiniButton onClick={e => {props.removeData(item.rate);props.fetchData()}}/></DataCell>
                    </TableRow>
                ))
                :
                <TableRow>
                    <DataCell colSpan="1000">Žádné</DataCell>
                </TableRow>
                }
            </TableBody>
        </Table>
        </CardBody>
        <CardFooter><AddMiniButton onClick={e => {props.setMode();}} /></CardFooter>
        </>
    )
}

export default ContentTable;