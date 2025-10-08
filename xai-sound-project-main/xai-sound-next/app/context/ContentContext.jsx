'use client';

import { createContext, useState, useEffect, useCallback } from 'react';

export const ContentContext = createContext({
    contentData: [],
    setContentData: () => {},
});

export function ContentProvider({ children }) {
    const [contentData, _setContentData] = useState([]);

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem('contentData');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    _setContentData(parsed);
                }
            }
        } catch (err) {
            console.error('Could not load contentData from sessionStorage', err);
        }
    }, []);

    const setContentData = useCallback((data) => {
        _setContentData(data);
        try {
            sessionStorage.setItem('contentData', JSON.stringify(data));
        } catch (err) {
            console.error('Could not save contentData to sessionStorage', err);
        }
    }, []);

    return (
        <ContentContext.Provider value={{ contentData, setContentData }}>
            {children}
        </ContentContext.Provider>
    );
}
