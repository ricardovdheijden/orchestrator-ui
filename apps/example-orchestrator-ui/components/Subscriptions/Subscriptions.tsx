import {
    Table,
    TableColumns,
    getTypedFieldFromObject,
    CheckmarkCircleFill,
    MinusCircleOutline,
    useOrchestratorTheme,
    SubscriptionStatusBadge,
    ControlColumn,
    PlusCircleFill,
    useStringQueryWithGraphql,
    parseDate,
} from '@orchestrator-ui/orchestrator-ui-components';
import React, { FC } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { EuiFlexItem } from '@elastic/eui';
import {
    GET_SUBSCRIPTIONS_PAGINATED_DEFAULT_VARIABLES,
    GET_SUBSCRIPTIONS_PAGINATED_REQUEST_DOCUMENT,
    SubscriptionsQueryVariables,
    SubscriptionsResult,
    SubscriptionsSort,
} from './subscriptionQuery';

type Subscription = {
    subscriptionId: string;
    description: string;
    status: string;
    insync: boolean;
    startDate: Date | null;
    endDate: Date | null;
    productName: string;
    tag: string | null;
    organisationName: string | null;
    organisationAbbreviation: string | null;
    note: string | null;
};

export type SubscriptionsProps = {
    pageSize: number;
    setPageSize: (updatedPageSize: number) => void;
    pageIndex: number;
    setPageIndex: (updatedPageIndex: number) => void;
    sortOrder: SubscriptionsSort;
    setSortOrder: (updatedSortOrder: SubscriptionsSort) => void;
};

export const Subscriptions: FC<SubscriptionsProps> = ({
    pageSize,
    pageIndex,
    sortOrder,
    setPageSize,
    setPageIndex,
    setSortOrder,
}) => {
    const router = useRouter();
    const { theme } = useOrchestratorTheme();

    const tableColumnConfig: TableColumns<Subscription> = {
        description: {
            displayAsText: 'Description',
            initialWidth: 400,
            renderCell: (cellValue, row) => (
                <Link href={`/subscriptions/${row.subscriptionId}`}>
                    {cellValue}
                </Link>
            ),
        },
        insync: {
            displayAsText: 'In Sync',
            initialWidth: 110,
            renderCell: (cellValue) =>
                cellValue ? (
                    <CheckmarkCircleFill color={theme.colors.primary} />
                ) : (
                    <MinusCircleOutline color={theme.colors.mediumShade} />
                ),
        },
        organisationName: {
            displayAsText: 'Customer Name',
            isHiddenByDefault: true,
        },
        organisationAbbreviation: {
            displayAsText: 'Customer',
            initialWidth: 200,
        },
        productName: {
            displayAsText: 'Product',
            initialWidth: 250,
            isHiddenByDefault: true,
        },
        tag: {
            initialWidth: 100,
            displayAsText: 'Tag',
        },
        startDate: {
            displayAsText: 'Start Date',
            initialWidth: 150,
            renderCell: (cellValue) =>
                // Todo: determine if this renders the date correctly with respect to timezones
                cellValue ? cellValue.toLocaleString('nl-NL') : '',
        },
        endDate: {
            displayAsText: 'End Date',
            initialWidth: 150,
            renderCell: (cellValue) =>
                // Todo: determine if this renders the date correctly with respect to timezones
                cellValue ? cellValue.toLocaleString('nl-NL') : '',
        },
        status: {
            displayAsText: 'Status',
            initialWidth: 110,
            renderCell: (cellValue) => (
                <SubscriptionStatusBadge subscriptionStatus={cellValue} />
            ),
        },
        subscriptionId: {
            displayAsText: 'ID',
            initialWidth: 100,
            renderCell: (cellValue) => cellValue.slice(0, 8),
        },
        note: {
            displayAsText: 'Note',
            renderCell: (cellValue) => (cellValue ? cellValue : ''),
        },
    };

    const sortedColumnId = getTypedFieldFromObject(
        sortOrder.field,
        tableColumnConfig,
    );

    const { isLoading, data } = useStringQueryWithGraphql<
        SubscriptionsResult,
        SubscriptionsQueryVariables
    >(GET_SUBSCRIPTIONS_PAGINATED_REQUEST_DOCUMENT, {
        ...GET_SUBSCRIPTIONS_PAGINATED_DEFAULT_VARIABLES,
        first: pageSize,
        after: pageIndex,
        sortBy: sortedColumnId && {
            field: sortedColumnId.toString(),
            order: sortOrder.order,
        },
    });

    if (!sortedColumnId) {
        router.replace('/subscriptions');
        return null;
    }

    if (isLoading || !data) {
        return <h1>Loading...</h1>;
    }

    const initialColumnOrder: Array<keyof Subscription> = [
        'subscriptionId',
        'description',
        'status',
        'insync',
        'organisationName',
        'organisationAbbreviation',
        'productName',
        'tag',
        'startDate',
        'endDate',
        'note',
    ];

    const leadingControlColumns: ControlColumn<Subscription>[] = [
        {
            id: 'inlineSubscriptionDetails',
            width: 40,
            rowCellRender: () => (
                <EuiFlexItem>
                    <PlusCircleFill color={theme.colors.mediumShade} />
                </EuiFlexItem>
            ),
        },
    ];

    return (
        <Table
            data={mapApiResponseToSubscriptionTableData(data)}
            pagination={{
                pageSize: pageSize,
                pageIndex: Math.floor(pageIndex / pageSize),
                pageSizeOptions: [5, 10, 15, 20, 25, 100],
                totalRecords: parseInt(data.subscriptions.pageInfo.totalItems),
                onChangePage: (updatedPageNumber) =>
                    setPageIndex(updatedPageNumber * pageSize),
                onChangeItemsPerPage: (itemsPerPage) =>
                    setPageSize(itemsPerPage),
            }}
            columns={tableColumnConfig}
            leadingControlColumns={leadingControlColumns}
            initialColumnOrder={initialColumnOrder}
            dataSorting={{
                columnId: sortedColumnId,
                sortDirection: sortOrder.order,
            }}
            updateDataSorting={(dataSorting) =>
                setSortOrder({
                    field: dataSorting.columnId,
                    order: dataSorting.sortDirection,
                })
            }
        ></Table>
    );
};

function mapApiResponseToSubscriptionTableData(
    graphqlResponse: SubscriptionsResult,
): Subscription[] {
    return graphqlResponse.subscriptions.edges.map(
        (baseSubscription): Subscription => {
            const {
                description,
                insync,
                organisation,
                product,
                startDate,
                endDate,
                status,
                subscriptionId,
                note,
            } = baseSubscription.node;

            return {
                description,
                insync,
                organisationName: organisation.name ?? null,
                organisationAbbreviation: organisation.abbreviation ?? null,
                productName: product.name,
                tag: product.tag ?? null,
                startDate: parseDate(startDate),
                endDate: parseDate(endDate),
                status,
                subscriptionId,
                note,
            };
        },
    );
}
