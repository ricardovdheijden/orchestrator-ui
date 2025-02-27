import React, { ReactNode } from 'react';
import { EuiBasicTable, EuiBasicTableColumn, Pagination } from '@elastic/eui';
import { Criteria } from '@elastic/eui/src/components/basic_table/basic_table';
import { WfoTableHeaderCell } from './WfoTableHeaderCell';

import type {
    WfoDataSorting,
    TableColumnKeys,
    WfoDataSearch,
} from '../utils/columns';
import {
    WFO_STATUS_COLOR_FIELD,
    WfoTableControlColumnConfig,
    WfoTableDataColumnConfig,
} from '../utils/columns';
import { useOrchestratorTheme } from '../../../hooks';
import { getStyles } from './styles';
import { SortOrder } from '../../../types';
import { WfoStatusColorField } from './WfoStatusColorField';

export type WfoBasicTableColumns<T> = {
    [Property in keyof T]: WfoTableDataColumnConfig<T, Property> & {
        render?: (cellValue: T[Property], row: T) => ReactNode;
    };
};

export type WfoBasicTableColumnsWithControlColumns<T> =
    WfoBasicTableColumns<T> & WfoTableControlColumnConfig<T>;

export type WfoBasicTableProps<T> = {
    data: T[];
    columns:
        | WfoBasicTableColumnsWithControlColumns<T>
        | WfoBasicTableColumns<T>;
    hiddenColumns?: TableColumnKeys<T>;
    dataSorting?: WfoDataSorting<T>;
    pagination?: Pagination;
    isLoading?: boolean;
    onCriteriaChange?: (criteria: Criteria<T>) => void;
    onUpdateDataSorting?: (updatedDataSorting: WfoDataSorting<T>) => void;
    onDataSearch?: (updatedDataSearch: WfoDataSearch<T>) => void;
    getStatusColorForRow?: (row: T) => string;
};

export const WfoBasicTable = <T,>({
    data,
    columns,
    hiddenColumns,
    dataSorting,
    pagination,
    isLoading,
    onCriteriaChange,
    onUpdateDataSorting,
    onDataSearch,
    getStatusColorForRow,
}: WfoBasicTableProps<T>) => {
    const { theme } = useOrchestratorTheme();
    const { basicTableStyle, getStatusColumnStyle } = getStyles(theme);

    const statusColorColumn: WfoTableControlColumnConfig<T> = {
        statusColorField: {
            field: WFO_STATUS_COLOR_FIELD,
            name: '',
            width: theme.size.xs,
            render: (_, row) =>
                getStatusColorForRow ? (
                    <WfoStatusColorField color={getStatusColorForRow(row)} />
                ) : (
                    <></>
                ),
        },
    };

    const allTableColumns:
        | WfoBasicTableColumnsWithControlColumns<T>
        | WfoBasicTableColumns<T> = getStatusColorForRow
        ? { ...statusColorColumn, ...columns }
        : { ...columns };

    const tableStyling = getStatusColorForRow
        ? [basicTableStyle, getStatusColumnStyle(1)]
        : basicTableStyle;

    return (
        <EuiBasicTable
            css={tableStyling}
            items={data}
            columns={mapWfoTableColumnsToEuiColumns(
                allTableColumns,
                hiddenColumns,
                dataSorting,
                onUpdateDataSorting,
                onDataSearch,
            )}
            pagination={pagination}
            onChange={onCriteriaChange}
            loading={isLoading}
        />
    );
};

function mapWfoTableColumnsToEuiColumns<T>(
    tableColumns: WfoBasicTableColumns<T>,
    hiddenColumns?: TableColumnKeys<T>,
    dataSorting?: WfoDataSorting<T>,
    onDataSort?: (updatedDataSorting: WfoDataSorting<T>) => void,
    onDataSearch?: (updatedDataSearch: WfoDataSearch<T>) => void,
): EuiBasicTableColumn<T>[] {
    function isVisibleColumn(columnKey: string) {
        return !hiddenColumns?.includes(columnKey as keyof T);
    }

    function mapColumnKeyToEuiColumn(colKey: string): EuiBasicTableColumn<T> {
        const typedColumnKey = colKey as keyof T;
        const column: WfoBasicTableColumns<T>[keyof T] =
            tableColumns[typedColumnKey];
        const { name, render, width, description, sortable, filterable } =
            column;

        // In most cases columns are sortable and filterable, making them optional saves some lines in configuring the table
        const isSortable = sortable ?? true;
        const isFilterable = filterable ?? true;

        const sortOrder =
            dataSorting?.field === colKey ? dataSorting.sortOrder : undefined;

        const handleOnSetSortOrder = (updatedSortOrder: SortOrder) =>
            onDataSort?.({
                field: typedColumnKey,
                sortOrder: updatedSortOrder,
            });

        const handleOnSearch = (searchText: string) =>
            onDataSearch?.({
                field: typedColumnKey,
                searchText,
            });

        // Not spreading the column object here as it might contain additional props.
        // EUI does not handle extra props well.
        return {
            render,
            width,
            description,
            field: typedColumnKey,
            name: name && (
                <WfoTableHeaderCell
                    fieldName={typedColumnKey.toString()}
                    sortOrder={sortOrder}
                    onSetSortOrder={
                        isSortable ? handleOnSetSortOrder : undefined
                    }
                    onSearch={isFilterable ? handleOnSearch : undefined}
                >
                    {name}
                </WfoTableHeaderCell>
            ),
            truncateText: true,
            textOnly: true,
        };
    }

    return Object.keys(tableColumns)
        .filter(isVisibleColumn)
        .map(mapColumnKeyToEuiColumn);
}
