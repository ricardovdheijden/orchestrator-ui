import React from 'react';
import { EuiBadge, EuiButton } from '@elastic/eui';
import { useEuiTheme } from '@elastic/eui';

export function Index() {
    const { euiTheme } = useEuiTheme();

    return (
        <>
            <div>
                <span>EuiBadge:</span>
                <EuiBadge color="primary">Badge-1</EuiBadge>
                <EuiBadge color={euiTheme.colors.primary}>Badge-2</EuiBadge>
            </div>
            <div>
                <span>EuiButton</span>
                <EuiButton color="primary" fill>
                    Button
                </EuiButton>
            </div>
        </>
    );
}

export default Index;
