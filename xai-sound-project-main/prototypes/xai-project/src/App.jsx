import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import Home from './Home.jsx';
import ContentPage from './ContentPage.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/content",
        element: <ContentPage />,
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
