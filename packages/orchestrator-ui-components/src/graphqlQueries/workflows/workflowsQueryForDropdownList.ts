import { gql } from 'graphql-request';
import { parse } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import {
    GraphqlQueryVariables,
    WorkflowDefinition,
    WorkflowDefinitionsResult,
} from '../../types';

export const GET_WORKFLOWS_FOR_DROPDOWN_LIST_GRAPHQL_QUERY: TypedDocumentNode<
    WorkflowDefinitionsResult<WorkflowDefinition>,
    GraphqlQueryVariables<WorkflowDefinition>
> = parse(gql`
    query StartWorkflows(
        $first: IntType!
        $after: IntType!
        $filterBy: [GraphqlFilter!]
    ) {
        workflows(first: $first, after: $after, filterBy: $filterBy) {
            page {
                name
                description
                products {
                    productId
                    name
                }
            }
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
                totalItems
                sortFields
                filterFields
            }
        }
    }
`);
