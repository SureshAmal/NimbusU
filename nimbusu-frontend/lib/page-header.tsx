"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface PageHeaderInfo {
    title: string;
    subtitle?: string;
}

interface PageHeaderContextValue {
    header: PageHeaderInfo | null;
    setHeader: (info: PageHeaderInfo | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
    header: null,
    setHeader: () => { },
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
    const [header, setHeaderState] = useState<PageHeaderInfo | null>(null);
    const setHeader = useCallback((info: PageHeaderInfo | null) => setHeaderState(info), []);
    return (
        <PageHeaderContext.Provider value={{ header, setHeader }}>
            {children}
        </PageHeaderContext.Provider>
    );
}

export function usePageHeader() {
    return useContext(PageHeaderContext);
}
