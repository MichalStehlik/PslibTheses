import React, {useState, useEffect} from 'react';
import {useAppContext, ADD_MESSAGE} from "../../providers/ApplicationProvider";
import {Table, TableBody, TableHeader, TableRow, DataCell, HeadCell, TableFooter, Button, CardHeader, CardFooter, CardBody, Subheading, ButtonBlock } from "../general";
import {ADMIN_ROLE, EVALUATOR_ROLE} from "../../configuration/constants";

const Display = props => {
    const [{accessToken, profile}, dispatch] = useAppContext();
    const [isEditable, setIsEditable] = useState(true);
    useEffect(()=>{ 
        setIsEditable(
            (profile !== null) && (
                (
                    profile[ADMIN_ROLE] === "1" 
                    || (profile.sub === props.authorId && props.data.state === 0) 
                    || (profile.sub === props.managerId && props.data.state === 0)
                    || (profile.sub === props.userId && props.data.state === 0)  
                )
            )
        );
     },[accessToken, profile, props.owner]);
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
                            <DataCell>{props.data.materialCosts}</DataCell>
                            <DataCell>{props.data.materialCostsProvidedBySchool}</DataCell>
                        </TableRow>
                        <TableRow>
                            <HeadCell>Náklady na služby</HeadCell>
                            <DataCell>{props.data.servicesCosts}</DataCell>
                            <DataCell>{props.data.servicesCostsProvidedBySchool}</DataCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <HeadCell>Celkem</HeadCell>
                            <DataCell>{Number(props.data.materialCosts) + Number(props.data.servicesCosts)}</DataCell>
                            <DataCell>{Number(props.data.materialCostsProvidedBySchool) + Number(props.data.servicesCostsProvidedBySchool)}</DataCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                {props.data.detailExpenditures 
                ?
                <>
                    <Subheading>Podrobnosti</Subheading>
                    <div dangerouslySetInnerHTML={{__html: props.data.detailExpenditures }} />
                </>
                :
                ""
                }
                
            </CardBody>
            {isEditable ? 
            <CardFooter>
                <ButtonBlock>
                    <Button onClick={e => props.switchEditMode(true)}>Editovat</Button>   
                </ButtonBlock>
            </CardFooter>
            : 
            ""
            }
            </>
        );
};

export default Display;