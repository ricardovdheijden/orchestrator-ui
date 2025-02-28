import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Pagination } from '@elastic/eui/src/components';

import {
    DEFAULT_PAGE_SIZE,
    DEFAULT_PAGE_SIZES,
    METADATA_RESOURCE_TYPES_TABLE_LOCAL_STORAGE_KEY,
    WfoLoading,
    WfoProductBlockBadge,
} from '../../components';
import type { WfoTableColumns, WfoDataSorting } from '../../components';
import { WfoTableWithFilter } from '../../components';
import {
    getDataSortHandler,
    getPageChangeHandler,
    getEsQueryStringHandler,
} from '../../components';

import type { ResourceTypeDefinition } from '../../types';
import { BadgeType, SortOrder } from '../../types';
import type { StoredTableConfig } from '../../components';
import {
    useDataDisplayParams,
    useQueryWithGraphql,
    useStoredTableConfig,
} from '../../hooks';

import { GET_RESOURCE_TYPES_GRAPHQL_QUERY } from '../../graphqlQueries';
import { EuiBadgeGroup } from '@elastic/eui';
import { WfoMetadataPageLayout } from './WfoMetadataPageLayout';
import { WfoFirstPartUUID } from '../../components/WfoTable/WfoFirstPartUUID';
import { mapSortableAndFilterableValuesToTableColumnConfig } from '../../components/WfoTable/utils/mapSortableAndFilterableValuesToTableColumnConfig';

export const RESOURCE_TYPE_FIELD_ID: keyof ResourceTypeDefinition =
    'resourceTypeId';
export const RESOURCE_TYPE_FIELD_TYPE: keyof ResourceTypeDefinition =
    'resourceType';
export const RESOURCE_TYPE_FIELD_DESCRIPTION: keyof ResourceTypeDefinition =
    'description';
export const RESOURCE_TYPE_FIELD_PRODUCT_BLOCKS: keyof ResourceTypeDefinition =
    'productBlocks';

export const WfoResourceTypesPage = () => {
    const t = useTranslations('metadata.resourceTypes');

    const [tableDefaults, setTableDefaults] =
        useState<StoredTableConfig<ResourceTypeDefinition>>();

    const getStoredTableConfig = useStoredTableConfig<ResourceTypeDefinition>(
        METADATA_RESOURCE_TYPES_TABLE_LOCAL_STORAGE_KEY,
    );

    useEffect(() => {
        const storedConfig = getStoredTableConfig();

        if (storedConfig) {
            setTableDefaults(storedConfig);
        }
    }, [getStoredTableConfig]);

    const { dataDisplayParams, setDataDisplayParam } =
        useDataDisplayParams<ResourceTypeDefinition>({
            // TODO: Improvement: A default pageSize value is set to avoid a graphql error when the query is executed
            // the fist time before the useEffect has populated the tableDefaults. Better is to create a way for
            // the query to wait for the values to be available
            // https://github.com/workfloworchestrator/orchestrator-ui/issues/261
            pageSize: tableDefaults?.selectedPageSize || DEFAULT_PAGE_SIZE,
            sortBy: {
                field: RESOURCE_TYPE_FIELD_TYPE,
                order: SortOrder.ASC,
            },
        });

    const tableColumns: WfoTableColumns<ResourceTypeDefinition> = {
        resourceTypeId: {
            field: RESOURCE_TYPE_FIELD_ID,
            name: t('resourceId'),
            width: '90',
            render: (value) => <WfoFirstPartUUID UUID={value} />,
            renderDetails: (value) => value,
        },
        resourceType: {
            field: RESOURCE_TYPE_FIELD_TYPE,
            name: t('type'),
            width: '200',
            render: (value) => (
                <WfoProductBlockBadge badgeType={BadgeType.RESOURCE_TYPE}>
                    {value}
                </WfoProductBlockBadge>
            ),
        },
        description: {
            field: RESOURCE_TYPE_FIELD_DESCRIPTION,
            name: t('description'),
        },
        productBlocks: {
            field: RESOURCE_TYPE_FIELD_PRODUCT_BLOCKS,
            name: t('usedInProductBlocks'),
            render: (productBlocks) => (
                <>
                    {productBlocks.map((productBlock, index) => (
                        <WfoProductBlockBadge
                            key={index}
                            badgeType={BadgeType.PRODUCT_BLOCK}
                        >
                            {productBlock.name}
                        </WfoProductBlockBadge>
                    ))}
                </>
            ),
            renderDetails: (productBlocks) => (
                <EuiBadgeGroup gutterSize="s">
                    {productBlocks.map((productBlock, index) => (
                        <WfoProductBlockBadge
                            key={index}
                            badgeType={BadgeType.PRODUCT_BLOCK}
                        >
                            {productBlock.name}
                        </WfoProductBlockBadge>
                    ))}
                </EuiBadgeGroup>
            ),
        },
    };

    const { data, isFetching } = useQueryWithGraphql(
        GET_RESOURCE_TYPES_GRAPHQL_QUERY,
        {
            first: dataDisplayParams.pageSize,
            after: dataDisplayParams.pageIndex * dataDisplayParams.pageSize,
            sortBy: dataDisplayParams.sortBy,
        },
        'resourceTypes',
    );

    if (!data) {
        return <WfoLoading />;
    }

    const dataSorting: WfoDataSorting<ResourceTypeDefinition> = {
        field: dataDisplayParams.sortBy?.field ?? RESOURCE_TYPE_FIELD_TYPE,
        sortOrder: dataDisplayParams.sortBy?.order ?? SortOrder.ASC,
    };

    const { totalItems, sortFields, filterFields } =
        data.resourceTypes.pageInfo;

    const pagination: Pagination = {
        pageSize: dataDisplayParams.pageSize,
        pageIndex: dataDisplayParams.pageIndex,
        pageSizeOptions: DEFAULT_PAGE_SIZES,
        totalItemCount: totalItems ? totalItems : 0,
    };

    return (
        <WfoMetadataPageLayout>
            <WfoTableWithFilter<ResourceTypeDefinition>
                data={data ? data.resourceTypes.page : []}
                tableColumns={mapSortableAndFilterableValuesToTableColumnConfig(
                    tableColumns,
                    sortFields,
                    filterFields,
                )}
                dataSorting={dataSorting}
                defaultHiddenColumns={tableDefaults?.hiddenColumns}
                onUpdateDataSort={getDataSortHandler<ResourceTypeDefinition>(
                    setDataDisplayParam,
                )}
                onUpdatePage={getPageChangeHandler<ResourceTypeDefinition>(
                    setDataDisplayParam,
                )}
                onUpdateEsQueryString={getEsQueryStringHandler<ResourceTypeDefinition>(
                    setDataDisplayParam,
                )}
                pagination={pagination}
                isLoading={isFetching}
                esQueryString={dataDisplayParams.esQueryString}
                localStorageKey={
                    METADATA_RESOURCE_TYPES_TABLE_LOCAL_STORAGE_KEY
                }
            />
        </WfoMetadataPageLayout>
    );
};
