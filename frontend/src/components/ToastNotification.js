import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Info, TriangleAlert } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end gap-3">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const { id, message, type, duration } = toast;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const enterTimeout = setTimeout(() => setIsVisible(true), 10);

        const exitTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onRemove(id), 400);
        }, duration);

        return () => {
            clearTimeout(enterTimeout);
            clearTimeout(exitTimer);
        };
    }, [id, duration, onRemove]);

    const getAppearance = () => {
        switch (type) {
            case 'success':
                return { borderColor: 'border-green-500', iconColor: 'text-green-500', Icon: CheckCircle };
            case 'error':
                return { borderColor: 'border-red-500', iconColor: 'text-red-500', Icon: X };
            case 'warning':
                return { borderColor: 'border-orange-500', iconColor: 'text-orange-500', Icon: TriangleAlert };
            default: 
                return { borderColor: 'border-indigo-500', iconColor: 'text-indigo-500', Icon: Info };
        }
    };

    const { borderColor, iconColor, Icon } = getAppearance();

    return (
        <div
            className={`flex w-full max-w-sm items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-lg ring-1 ring-black/5 transition-all duration-300 dark:bg-zinc-900 dark:ring-white/10 ${borderColor} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
            role="alert"
        >
            {Icon && (<div className="flex-shrink-0"><Icon size={20} className={iconColor} /></div>)}
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {typeof message === 'object' && message !== null ? JSON.stringify(message) : message}
                </p>
            </div>
            <button onClick={() => { setIsVisible(false); setTimeout(() => onRemove(id), 400); }} className="flex-shrink-0 p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-zinc-500 dark:hover:text-white" aria-label="Close toast">
                <X size={16} />
            </button>
        </div>
    );
};