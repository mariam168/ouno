import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

const API_BASE_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loadingAuth, setLoadingAuth] = useState(true);

    const logout = React.useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setCurrentUser(null);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token'); 
        
        if (storedToken && storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser)); 
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                setToken(storedToken); 
            } catch (e) {
                console.error("AuthContext: Failed to parse stored user or set auth header:", e);
                logout();
            }
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }

        const responseInterceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401 && axios.defaults.headers.common['Authorization']) {
                    console.warn("AuthContext: Interceptor caught 401, logging out.");
                    logout(); 
                }
                return Promise.reject(error);
            }
        );
        setLoadingAuth(false); 

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]); 
    const login = (userData, userToken) => {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData)); 
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        setToken(userToken); 
        setCurrentUser(userData);
    };

    const value = {
        currentUser,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: currentUser?.role === 'admin',
        isActivated: currentUser?.isActivated, 
        loadingAuth,
        API_BASE_URL,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loadingAuth && children}
        </AuthContext.Provider>
    );
};
