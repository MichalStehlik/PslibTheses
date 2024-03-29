import React, {useEffect, useMemo} from 'react';
import {useTable, usePagination, useSortBy, useFilters, useGlobalFilter, useRowSelect} from 'react-table';
import styled from 'styled-components';
import {ReactComponent as ChevronUp} from "../../assets/icons/chevron_up.svg";
import {ReactComponent as ChevronDown} from "../../assets/icons/chevron_down.svg";
import {Loader, Alert, Input, Select, NextMiniButton, LastMiniButton, PreviousMiniButton, FirstMiniButton, ResetMiniButton} from ".";

export const TableWrapper = styled.div`
display: block;
max-width: 100%;
overflow-x: auto;
overflow-y: hidden;
`;

export const Table = styled.table`
${props => props.width ? "width: {props.width};" : ""}
border-collapse: collapse;
box-sizing: margin-box;
& td, & th {
  border: 1px solid #ddd;
  padding: 8px;
}
& thead, & tbody {
  border-bottom: 2px solid #444;
}
`;

export const TableHeader = styled.thead`
`;

export const TableBody = styled.tbody`
${props => props.striped ? "& tr:nth-child(odd) {background: #FBFBFC;}" : ""}
${props => props.hover ? "& tr:hover {background-color: #C2CAD1;}" : ""}
`;

export const TableFooter = styled.tfoot`
`;

export const TableRow = styled.tr`
`;

export const DataCell = styled.td`
text-align: ${props => props.horizontal};
vertical-align: ${props => props.vertical};
`;

DataCell.defaultProps = {horizontal: "left", vertical: "center"};

export const HeadCell = styled.th`
text-align: ${props => props.horizontal};
vertical-align: ${props => props.vertical};
`;

HeadCell.defaultProps = {horizontal: "left", vertical: "center"};

const Paginator = styled.div`
display: grid;
grid-template-columns: auto auto auto;
grid-template-rows: auto;
grid-template-areas: "navigation pages size";
width: 100%;
`;

const PaginatorNavigation = styled.div`
display: flex;
flex-direction: row;
grid-area: navigation;
justify-self: start;
align-self: start;
`;

const PaginatorSize = styled.div`
grid-area: size;
justify-self: end;
`;

const PaginatorPages = styled.div`
display: flex;
flex-direction: row;
flex-wrap: wrap;
grid-area: pages;
justify-self: center;
align-self: start;
`;

const PaginatorPage = styled.span`
display: inline-block;
padding: 5px;
cursor: pointer;
`;

const RowsSelection = styled.div`
display: block;
margin: .3rem 1rem;
width: 100%;
`;

export const TextColumnFilter = ({ column: { filterValue, preFilteredRows, setFilter }}) => {
  return (
    <Input style={{display: "inline-block", width: "100%", boxSizing: "border-box"}} value={filterValue || ''} onChange={e => { setFilter(e.target.value || undefined) }} placeholder={`Zadejte text`}
    />
  )
}

export const BoolColumnFilter = ({ column: { filterValue, preFilteredRows, setFilter }}) => {
  return (
    <Select style={{display: "inline-block", width: "100%", boxSizing: "border-box"}} value={filterValue} onChange={e => { setFilter(e.target.value || undefined) }}>
      <option value="">Vše</option>
      <option value={true}>Ano</option>
      <option value={false}>Ne</option>
    </Select>
  )
}

export const ListColumnFilter = ({ column: { filterValue, preFilteredRows, setFilter }}, values) => {
  return (
    <Select style={{display: "inline-block", width: "100%", boxSizing: "border-box"}} value={filterValue || "Vše"} onChange={e => { setFilter(e.target.value || undefined) }}>
      <option value="">Vše</option>
      {Object.keys(values).map((key, index) => (
        <option key={index} value={key}>{values[key]}</option>
      ))}
    </Select>
  )
}

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
        )
    }
)

export const DataTable = ({ columns, data, fetchData, isLoading, error, totalPages, initialState, storageId, showRowSelect = false, setSelectedRows }) => {
    const defaultColumn = useMemo(
        () => ({
            Filter: TextColumnFilter,
        }),
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        setGlobalFilter,
        selectedFlatRows,
        setAllFilters,
        state,
    } = useTable(
        { columns, data, defaultColumn, initialState, manualPagination: true, pageCount: totalPages, manualSortBy: true, disableMultiSort: true, manualFilters: true },
        useGlobalFilter, useFilters, useSortBy, usePagination, useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                showRowSelect ?
                    {
                        id: "selection",
                        Header: ({ getToggleAllPageRowsSelectedProps }) => (
                            <div>
                                <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
                            </div>
                        ),
                        Cell: ({ row }) => (
                            <div>
                                <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                            </div>
                        ),
                    } : {},
                    ...columns,
                ])
        }
        );

    useEffect(() => {
        fetchData({ page: state.pageIndex, size: state.pageSize, sort: state.sortBy, filters: state.filters });
    }, [fetchData, state.pageIndex, state.pageSize, state.sortBy, state.filters]);

    useEffect(() => {
        if (storageId) localStorage.setItem(storageId, JSON.stringify(state));
    }, [state, storageId]);

    useEffect(() => {
        if (setSelectedRows) { setSelectedRows(selectedFlatRows.map(d => d.original)); }
    }, [state]);
    
    return (
      <>
          <TableWrapper>
              <Table {...getTableProps()}>
                  <TableHeader>
                      {headerGroups.map(headerGroup => (
                          <TableRow {...headerGroup.getHeaderGroupProps()}>
                              {headerGroup.headers.map(column => (
                                  <HeadCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                                      {column.render('Header')}
                                      <span>
                                          {column.isSorted
                                              ? column.isSortedDesc
                                                  ? <ChevronUp height="1em" stroke="black" />
                                                  : <ChevronDown height="1em" stroke="black" />
                                              : ''}
                                      </span>
                                  </HeadCell>
                              ))}
                          </TableRow>
                      ))}
                      {headerGroups.map(headerGroup => (
                          <TableRow {...headerGroup.getHeaderGroupProps()}>
                              {headerGroup.headers.map(column => (
                                  <HeadCell {...column.getHeaderProps()}>
                                      {column.canFilter ? column.render('Filter') : null}
                                  </HeadCell>
                              ))}
                          </TableRow>
                      ))}
                  </TableHeader>
                  <TableBody hover striped {...getTableBodyProps()}>
                      {
                          error ? (
                              <TableRow>
                                  <DataCell colSpan={1000}><Alert text={error.text + (error.status ? " (" + error.status + ")" : "")} variant="error" /></DataCell>
                              </TableRow>
                          ) : (
                              isLoading ? (
                                  <TableRow><DataCell align="center" colSpan={1000}><Loader size="2em" /></DataCell></TableRow>
                              ) : page.map(
                                  (row, i) => {
                                      prepareRow(row);
                                      return (
                                          <TableRow {...row.getRowProps()}>
                                              {row.cells.map(cell => {
                                                  return <DataCell {...cell.getCellProps()}>{cell.render('Cell')}</DataCell>
                                              })}
                                          </TableRow>
                                      )
                                  }
                              )
                          )
                      }
                  </TableBody>
              </Table>
          </TableWrapper>
          <Paginator>
              <PaginatorNavigation>
                  <FirstMiniButton onClick={() => gotoPage(0)} disabled={!canPreviousPage} />
                  <PreviousMiniButton onClick={() => previousPage()} disabled={!canPreviousPage} />
                  <NextMiniButton onClick={() => nextPage()} disabled={!canNextPage} />
                  <LastMiniButton onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} />
                  <ResetMiniButton onClick={() => setAllFilters([])} title="Zobrazit vše" />
              </PaginatorNavigation>
              <PaginatorPages>
                  {[...Array(pageCount).keys()].map((num) => (<PaginatorPage key={num} onClick={() => { gotoPage(num) }}>{num + 1}</PaginatorPage>))}
              </PaginatorPages>
              <PaginatorSize>
                  <Select value={state.pageSize} onChange={e => {
                      setPageSize(Number(e.target.value))
                  }}
                  >{[5, 10, 50, 100, 250, 500].map(pageSize => (
                      <option key={pageSize} value={pageSize}>{pageSize}</option>
                  ))}
                  </Select>
              </PaginatorSize>
            </Paginator>
            {showRowSelect
                ?
                <RowsSelection>
                    {"Je vybráno " + Object.keys(state.selectedRowIds).length + " řádků."}
                </RowsSelection>
                :
                null
            }

      </>
  )

}

DataTable.defaultProps = {
    initialState: { pageIndex: 0, pageSize: 50 }
}