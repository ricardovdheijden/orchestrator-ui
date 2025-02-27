import React, { ReactElement } from 'react';
import {
    EuiButton,
    EuiFlexItem,
    EuiHorizontalRule,
    EuiPanel,
    EuiSpacer,
} from '@elastic/eui';
import { WfoListItemStartPage } from './WfoListItemStartPage';
import { ItemsList } from '../../types';

interface WfoListStartPage {
    list: ItemsList;
}

export default function WfoListStartPage({
    list,
}: WfoListStartPage): ReactElement {
    return (
        list?.items && (
            <EuiFlexItem style={{ minWidth: 300 }}>
                <EuiPanel hasShadow={false} hasBorder={true} paddingSize="l">
                    <p style={{ fontWeight: 600 }}>{list.title}</p>
                    <EuiSpacer size="m" />
                    {list.items.map((item, index) => (
                        <div key={index}>
                            <WfoListItemStartPage
                                item={item}
                                type={list.type}
                            />
                            {index === list.items.length - 1 ? null : (
                                <EuiHorizontalRule margin="none" />
                            )}
                        </div>
                    ))}
                    <EuiSpacer size="m" />
                    <EuiButton fullWidth={true}>{list.buttonName}</EuiButton>
                </EuiPanel>
            </EuiFlexItem>
        )
    );
}
