import React, { JSX, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { WfoLoading } from '../WfoLoading';
import { OrchestratorConfigContext } from '../../contexts';

interface AuthProps {
    children: JSX.Element;
}

export const WfoAuth = ({ children }: AuthProps): JSX.Element => {
    const { authActive } = useContext(OrchestratorConfigContext);
    const { status } = useSession({
        required: authActive,
    });

    if (status === 'loading') {
        return <WfoLoading />;
    }
    return children;
};
