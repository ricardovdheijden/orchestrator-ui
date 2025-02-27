import { EuiButton } from '@elastic/eui';
import React, { FC } from 'react';
import { EngineStatusValue } from '../../types';

interface WfoEngineStatusButtonProps {
    engineStatus?: EngineStatusValue;
    changeEngineStatus: () => void;
}

export const WfoEngineStatusButton: FC<WfoEngineStatusButtonProps> = ({
    engineStatus,
    changeEngineStatus,
}) => {
    if (!engineStatus) {
        return (
            <EuiButton isLoading fill>
                Loading...
            </EuiButton>
        );
    }
    return engineStatus === 'RUNNING' ? (
        <EuiButton
            onClick={changeEngineStatus}
            color="warning"
            fill
            iconType="pause"
        >
            Pause the engine
        </EuiButton>
    ) : (
        <EuiButton
            onClick={changeEngineStatus}
            color="primary"
            fill
            iconType="play"
        >
            Start the engine
        </EuiButton>
    );
};
