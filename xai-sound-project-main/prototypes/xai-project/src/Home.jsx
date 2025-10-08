import {useState} from 'react';
import UploadedFiles from './components/UploadedFiles.jsx';

function Home() {
  const [files, setFiles] = useState([]);

  function handleUpload(event) {
    if (event.target.files[0] !== '') {
      setFiles((prev) => [...prev, event.target.files[0]]);
    }
  }

  return (
    <>
      <div className={'flex items-center justify-center'}>
        <label
          className={
            'cursor-pointer bg-blue-600 text-white shadow-[#276EFB7F] shadow-2xl font-bold uppercase p-4 mt-8 rounded'
          }>
          Upload Files
          <input type={'file'} onChange={handleUpload} className={'hidden'} />
        </label>
      </div>
      <UploadedFiles files={files} />
    </>
  );
}

export default Home;
