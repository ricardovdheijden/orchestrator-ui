import React, { Ref, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Step } from '../../../types';
import { WfoStepListHeader } from './WfoStepListHeader';
import { WfoLoading } from '../../WfoLoading';
import { StepListItem, WfoStepList, WfoStepListRef } from '../WfoStepList';
import { WfoJsonCodeBlock } from '../../WfoJsonCodeBlock/WfoJsonCodeBlock';
import { updateStepListItems } from '../stepListUtils';
import { useRawProcessDetails } from '../../../hooks';

export interface WfoWorkflowStepListProps {
    steps: Step[];
    startedAt: string;
    processId: string;
}

export const WfoProcessRawData = ({ processId }: { processId: string }) => {
    const { data, isFetching } = useRawProcessDetails(processId);
    return isFetching ? <WfoLoading /> : <WfoJsonCodeBlock data={data || {}} />;
};

export const WfoWorkflowStepList = React.forwardRef(
    (
        { steps = [], startedAt, processId }: WfoWorkflowStepListProps,
        reference: Ref<WfoStepListRef>,
    ) => {
        const [showHiddenKeys, setShowHiddenKeys] = useState(false);
        const [showRaw, setShowRaw] = useState(false);

        const t = useTranslations('processes.steps');

        const initialStepListItems: StepListItem[] = steps.map((step) => ({
            step,
            isExpanded: false,
        }));

        const [stepListItems, setStepListItems] =
            useState(initialStepListItems);

        useEffect(
            () =>
                setStepListItems((previousStepListItems) =>
                    updateStepListItems(previousStepListItems, steps),
                ),
            [steps],
        );

        const updateStepListItem = (
            stepListItemToUpdate: StepListItem,
            updateFunction: (stepListItem: StepListItem) => StepListItem,
        ) =>
            setStepListItems(
                stepListItems.map((stepListItem) =>
                    stepListItem === stepListItemToUpdate
                        ? updateFunction(stepListItem)
                        : stepListItem,
                ),
            );

        const allStepsAreExpanded = stepListItems.every(
            (item) => item.isExpanded,
        );

        const setExpandedStateStepListItems = (isExpanded: boolean) => {
            setStepListItems(
                stepListItems.map((item) => ({
                    ...item,
                    isExpanded,
                })),
            );
        };

        const toggleExpandedStateStepListItem = (stepListItem: StepListItem) =>
            updateStepListItem(stepListItem, (item) => ({
                ...item,
                isExpanded: !item.isExpanded,
            }));

        const handleExpandStepListItem = (stepListItem: StepListItem) =>
            updateStepListItem(stepListItem, (item) => ({
                ...item,
                isExpanded: true,
            }));

        return (
            <>
                <WfoStepListHeader
                    showHiddenKeys={showHiddenKeys}
                    showRaw={showRaw}
                    allDetailToggleText={
                        allStepsAreExpanded ? t('collapseAll') : t('expandAll')
                    }
                    onChangeShowHiddenKeys={setShowHiddenKeys}
                    onChangeShowRaw={setShowRaw}
                    onToggleAllDetailsIsOpen={() =>
                        setExpandedStateStepListItems(!allStepsAreExpanded)
                    }
                />

                {showRaw ? (
                    <WfoProcessRawData processId={processId} />
                ) : (
                    <WfoStepList
                        ref={reference}
                        stepListItems={stepListItems}
                        startedAt={startedAt}
                        showHiddenKeys={showHiddenKeys}
                        onToggleExpandStepListItem={
                            toggleExpandedStateStepListItem
                        }
                        onTriggerExpandStepListItem={handleExpandStepListItem}
                    />
                )}
            </>
        );
    },
);

WfoWorkflowStepList.displayName = 'WfoWorkflowStepList';
