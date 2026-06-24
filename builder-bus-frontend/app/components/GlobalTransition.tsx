'use client';

import React from 'react';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import RoleSwitchTransition from './RoleSwitchTransition';

export default function GlobalTransition() {
    const { transition } = useUnifiedApp();

    return (
        <RoleSwitchTransition
            isVisible={transition.visible}
            roleId={transition.roleId}
            roleName={transition.roleName}
        />
    );
}
