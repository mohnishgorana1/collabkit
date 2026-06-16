'use client'
import { createContext, ReactNode, useContext } from 'react'

const WorkspaceContext = createContext<any>(null);

export function WorkspaceProvider({ children, data }: { children: ReactNode, data: any }){
    return (
        <WorkspaceContext.Provider value={data}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export const useWorkspaceData = () => useContext(WorkspaceContext);