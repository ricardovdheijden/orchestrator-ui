import React, { useState, useContext, useRef, useEffect } from 'react';

import { getProductNamesFromProcess } from '../../utils';
import { useQueryWithGraphql } from '../../hooks';
import { GET_PROCESS_DETAIL_GRAPHQL_QUERY } from '../../graphqlQueries';
import { TimelineItem, WfoLoading } from '../../components';

import { WfoProcessDetail } from './WfoProcessDetail';
import {
    WfoStepListRef,
    WfoWorkflowStepList,
} from '../../components/WfoWorkflowSteps';

import {
    convertStepsToGroupedSteps,
    mapGroupedStepsToTimelineItems,
} from './timelineUtils';
import { Step, ProcessDoneStatuses } from '../../types';
import { OrchestratorConfigContext } from '../../contexts';

export type GroupedStep = {
    steps: Step[];
};

interface WfoProcessDetailPageProps {
    processId: string;
}

export const WfoProcessDetailPage = ({
    processId,
}: WfoProcessDetailPageProps) => {
    const { dataRefetchInterval } = useContext(OrchestratorConfigContext);
    const stepListRef = useRef<WfoStepListRef>(null);
    const [fetchInterval, setFetchInterval] = useState<number | undefined>(
        dataRefetchInterval.processDetail,
    );
    const { data, isFetching } = useQueryWithGraphql(
        GET_PROCESS_DETAIL_GRAPHQL_QUERY,
        {
            processId,
        },
        'processDetail',
        fetchInterval,
    );

    useEffect(() => {
        const lastStatus = data?.processes.page[0].lastStatus;
        const isInProgress = !(
            lastStatus && ProcessDoneStatuses.includes(lastStatus)
        );
        setFetchInterval(
            isInProgress ? dataRefetchInterval.processDetail : undefined,
        );
    }, [data, dataRefetchInterval.processDetail]);

    const process = data?.processes.page[0];
    const steps = process?.steps ?? [];

    const productNames = getProductNamesFromProcess(process);
    const pageTitle = process?.workflowName || '';

    const groupedSteps: GroupedStep[] = convertStepsToGroupedSteps(steps);
    const timelineItems: TimelineItem[] =
        mapGroupedStepsToTimelineItems(groupedSteps);

    return (
        <WfoProcessDetail
            pageTitle={pageTitle}
            productNames={productNames}
            buttonsAreDisabled={isFetching && !process}
            processDetail={process}
            timelineItems={timelineItems}
            onTimelineItemClick={(id: string) =>
                stepListRef.current?.scrollToStep(id)
            }
        >
            {(isFetching && !process && <WfoLoading />) ||
                (process !== undefined && (
                    <WfoWorkflowStepList
                        ref={stepListRef}
                        processId={process.processId}
                        steps={groupedSteps.flatMap(
                            (groupedStep) => groupedStep.steps,
                        )}
                        startedAt={process.startedAt}
                    />
                ))}
        </WfoProcessDetail>
    );
};
