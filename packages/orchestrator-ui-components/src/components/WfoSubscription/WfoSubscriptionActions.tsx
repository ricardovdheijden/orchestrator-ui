import React, { FC, useState } from 'react';
import Link from 'next/link';

import {
    EuiButton,
    EuiContextMenuItem,
    EuiContextMenuPanel,
    EuiPanel,
    EuiAvatar,
    EuiTitle,
    EuiPopover,
    EuiToolTip,
} from '@elastic/eui';
import { useTranslations } from 'next-intl';

import { useOrchestratorTheme } from '../../hooks';
import { flattenArrayProps, getWorkflowTargetColor } from './utils';

import {
    SubscriptionAction,
    useSubscriptionActions,
} from '../../hooks/useSubscriptionActions';

import { WfoXCircleFill } from '../../icons';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { WorkflowTarget } from '../../types';

type MenuItemProps = {
    key: string;
    icon: string;
    action: SubscriptionAction;
    index: number;
    target: WorkflowTarget;
};

type MenuBlockProps = {
    title: string;
};
const MenuBlock: FC<MenuBlockProps> = ({ title }) => (
    <EuiTitle size="xxxs">
        <h3>{title}</h3>
    </EuiTitle>
);

export type WfoSubscriptionActionsProps = {
    subscriptionId: string;
};

export const WfoSubscriptionActions: FC<WfoSubscriptionActionsProps> = ({
    subscriptionId,
}) => {
    const { theme } = useOrchestratorTheme();

    const t = useTranslations('subscriptions.detail.actions');
    const [isPopoverOpen, setPopover] = useState(false);
    const { data: subscriptionActions } =
        useSubscriptionActions(subscriptionId);

    const onButtonClick = () => {
        setPopover(!isPopoverOpen);
    };

    const closePopover = () => {
        setPopover(false);
    };

    const MenuItem: FC<MenuItemProps> = ({ icon, action, target }) => {
        // Change icon to include x if there's a reason
        // Add tooltip with reason
        const linkIt = (actionItem: ReactJSXElement) => {
            return (
                <Link
                    href={{
                        pathname: `/start-workflow/${action.name}`,
                        query: { subscriptionId: subscriptionId },
                    }}
                >
                    {actionItem}
                </Link>
            );
        };

        const tooltipIt = (actionItem: ReactJSXElement) => {
            /** 
              Whether an action is disabled is indicated by it having a reason property. 
              The value of the reason property is as a translation key that should
              be part of the local translations under subscription.details.workflow.disableReasons
              Some of these reasons may contain dynamic values. The values are passed as extra keys next to
              the reason key. The complete reason object is passed to the translate function to make this work.
              An extra variable passed in might be of type array, before passing it in arrays are flattened to , 
              concatenated strings.
              
              Example action item response for an action that is disabled
              const reason = {
                name: "...",
                description: "...",
                reason: "random_reason_translation_key" => 
                  this maps to a key in subscription.details.workflow.disableReasons containing
                  ".... {randomVar1} .... {randomVar2}  "
                randomVar: [
                  "array value 1",
                  "array value 2"
                ],
                randomVar2: "flat string"

              }

              // Translation function invocation
              t('randonReason', reason)
            */
            if (!action.reason) return actionItem;

            const tooltipContent = t(action.reason, flattenArrayProps(action));

            return (
                <div>
                    <EuiToolTip position="top" content={tooltipContent}>
                        {actionItem}
                    </EuiToolTip>
                </div>
            );
        };

        const getIcon = () => {
            return action.reason ? (
                <div css={{ display: 'flex', width: theme.base * 2 }}>
                    <EuiAvatar
                        name={icon}
                        size="s"
                        color={theme.colors.lightShade}
                    />
                    <div
                        css={{
                            transform: 'translate(-11px, -8px);',
                        }}
                    >
                        <WfoXCircleFill
                            width={20}
                            height={20}
                            color={theme.colors.danger}
                        />
                    </div>
                </div>
            ) : (
                <div css={{ width: theme.base * 2 }}>
                    <EuiAvatar
                        name={icon}
                        size="s"
                        color={getWorkflowTargetColor(target, theme)}
                    />
                </div>
            );
        };

        const ActionItem = () => (
            <EuiContextMenuItem icon={getIcon()} disabled={!!action.reason}>
                {action.description}
            </EuiContextMenuItem>
        );

        return action?.reason
            ? tooltipIt(<ActionItem />)
            : linkIt(<ActionItem />);
    };

    const button = (
        <EuiButton
            iconType="arrowDown"
            iconSide="right"
            onClick={onButtonClick}
        >
            {t('actions')}
        </EuiButton>
    );

    return (
        <EuiPopover
            id="subscriptionActionPopover"
            button={button}
            isOpen={isPopoverOpen}
            closePopover={closePopover}
            panelPaddingSize="none"
            anchorPosition="downLeft"
        >
            <EuiContextMenuPanel>
                <EuiPanel color="transparent" paddingSize="s">
                    {subscriptionActions && subscriptionActions.modify && (
                        <>
                            <MenuBlock title={t('modify')}></MenuBlock>
                            {subscriptionActions.modify.map((action, index) => (
                                <MenuItem
                                    key={`m_${index}`}
                                    icon={'M'}
                                    action={action}
                                    index={index}
                                    target={WorkflowTarget.MODIFY}
                                />
                            ))}
                        </>
                    )}

                    {subscriptionActions && subscriptionActions.system && (
                        <>
                            <MenuBlock title={t('system')}></MenuBlock>
                            {subscriptionActions.system.map((action, index) => (
                                <MenuItem
                                    key={`s_${index}`}
                                    icon={'System'}
                                    action={action}
                                    index={index}
                                    target={WorkflowTarget.SYSTEM}
                                />
                            ))}
                        </>
                    )}

                    {subscriptionActions && subscriptionActions.terminate && (
                        <>
                            <MenuBlock title={t('terminate')}></MenuBlock>
                            {subscriptionActions.terminate.map(
                                (action, index) => (
                                    <MenuItem
                                        key={`t_${index}`}
                                        icon={'Terminate'}
                                        action={action}
                                        index={index}
                                        target={WorkflowTarget.TERMINATE}
                                    />
                                ),
                            )}
                        </>
                    )}
                </EuiPanel>
            </EuiContextMenuPanel>
        </EuiPopover>
    );
};
