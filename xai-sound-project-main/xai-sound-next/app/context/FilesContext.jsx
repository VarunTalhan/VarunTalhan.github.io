'use client';

import { createContext, useState, useEffect, useCallback } from 'react';

export const FilesContext = createContext({
    files: [],
    setFiles: () => {},
});

export function FilesProvider({ children }) {
    const [files, _setFiles] = useState([]);

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem('files');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    _setFiles(parsed);
                }
            }
        } catch (err) {
            console.error('Could not load files from sessionStorage', err);
        }
    }, []);

    const setFiles = useCallback((uploadedFiles) => {
        _setFiles((prev => {
            const newFiles = [...prev, ...uploadedFiles]
            try {
                sessionStorage.setItem('files', JSON.stringify(newFiles));
            } catch (err) {
                console.error('Could not save files to sessionStorage', err);
            }
            return newFiles;
        }))

    }, []);

    return (
        <FilesContext.Provider value={{ files, setFiles }}>
            {children}
        </FilesContext.Provider>
    );
}
