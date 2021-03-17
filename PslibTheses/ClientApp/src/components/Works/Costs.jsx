import React from 'react';
import {Table, TableBody, TableHeader, TableRow, DataCell, HeadCell, TableFooter, Button, CardHeader, CardFooter, CardBody, Subheading, ButtonBlock } from "../general";

const Display = ({isEditable, data, switchEditMode}) => {
        return (
            <>
            <CardHeader><Subheading>Náklady</Subheading></CardHeader>
            <CardBody>
                <Table width="100%">
                    <TableHeader>
                        <TableRow>
                            <HeadCell>v Kč</HeadCell>
                            <HeadCell>Celkové</HeadCell>
                            <HeadCell>Hrazené školou</HeadCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <HeadCell>Výrobní náklady</HeadCell>
                            <DataCell>{data.materialCosts}</DataCell>
                            <DataCell>{data.materialCostsProvidedBySchool}</DataCell>
                        </TableRow>
                        <TableRow>
                            <HeadCell>Náklady na služby</HeadCell>
                            <DataCell>{data.servicesCosts}</DataCell>
                            <DataCell>{data.servicesCostsProvidedBySchool}</DataCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <HeadCell>Celkem</HeadCell>
                            <DataCell>{Number(data.materialCosts) + Number(data.servicesCosts)}</DataCell>
                            <DataCell>{Number(data.materialCostsProvidedBySchool) + Number(data.servicesCostsProvidedBySchool)}</DataCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                {data.detailExpenditures 
                ?
                <>
                    <Subheading>Podrobnosti</Subheading>
                    <div dangerouslySetInnerHTML={{__html: data.detailExpenditures }} />
                </>
                :
                ""
                }
                
            </CardBody>
            {isEditable ? 
            <CardFooter>
                <ButtonBlock>
                    <Button onClick={e => switchEditMode(true)}>Editovat</Button>   
                </ButtonBlock>
            </CardFooter>
            : 
            ""
            }
            </>
        );
};

export default Display;