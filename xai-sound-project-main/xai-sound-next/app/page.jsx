import DisplayFiles from './ui/DisplayFiles.jsx';
import UploadFile from "@/app/ui/UploadFiles";
import {FilesProvider} from "@/app/context/FilesContext";

function Page() {
    return (
        <>
            <FilesProvider>
                <UploadFile />
                <DisplayFiles />
            </FilesProvider>
        </>
    );
}
export default Page;
