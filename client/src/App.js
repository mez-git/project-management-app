import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { AuthProvider } from './auth/AuthContext';
    import PrivateRoute from './auth/PrivateRoute';

    import LoginPage from './pages/LoginPage';
    import RegisterPage from './pages/RegisterPage';
    import DashboardPage from './pages/DashboardPage';
    import ProjectListPage from './pages/ProjectListPage';
    import ProjectDetailsPage from './pages/ProjectDetailsPage';
    import TaskDetailsPage from './pages/TaskDetailsPage';
    import UserManagementPage from './pages/UserManagementPage'; 
    import NotFoundPage from './pages/NotFoundPage'; 

    import Layout from './components/Layout'; 

    
    import { ThemeProvider, createTheme } from '@mui/material/styles';
    import CssBaseline from '@mui/material/CssBaseline';

    const theme = createTheme({
        palette: {
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
        },
    });


    function App() {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline /> 
          <Router>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                  <Route index element={<DashboardPage />} />
                  <Route path="projects" element={<ProjectListPage />} />
                  <Route path="projects/:id" element={<ProjectDetailsPage />} />
                  <Route path="tasks/:id" element={<TaskDetailsPage />} />
                  <Route path="users" element={<UserManagementPage />} /> 
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      );
    }

    export default App;