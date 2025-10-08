'use client';

import {useContext} from 'react';
import {FilesContext} from "@/app/context/FilesContext";


function UploadFiles() {
    const { setFiles } = useContext(FilesContext)

    async function handleUpload(event) {
        const fileList = Array.from(event.target.files);
        const uploadedFiles = await Promise.all(fileList.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: reader.result,
                    });
                };
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }));

        try {
            setFiles(uploadedFiles);
        } catch (err) {
            console.error('Error reading files', err);
        }
    }

    return (
        <div className={'flex items-center justify-center'}>
            <label
                className={
                    'cursor-pointer bg-blue-600 text-white shadow-[#276EFB7F] shadow-2xl font-bold uppercase p-4 mt-8 rounded'
                }>
                Upload Files
                <input type={'file'} onChange={handleUpload} className={'hidden'} />
            </label>
        </div>
    )
}

export default UploadFiles;