// src/App.js
import { useRoutes, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';
import NewsList from './components/NewsList'
import Layout from './pages/Layout';
import Signup from './pages/Signup';
import Login from './pages/Login';

import HelloWorld from './components/HelloWorld';

const App = () => {
  const { user } = useAuthContext();

  const elements = useRoutes([
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: user ? <NewsList /> : <Navigate to="/login" /> },
        { path: '/signup', element: !user ? <Signup /> : <Navigate to="/" /> },
        { path: '/login', element: !user ? <Login /> : <Navigate to="/" /> },
      ]
    }
  ]);

  return elements;
};

export default App;