import { ContentProvider } from './context/ContentContext';
import './globals.css'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ContentProvider>{children}</ContentProvider>
            </body>
        </html>
    );
}
