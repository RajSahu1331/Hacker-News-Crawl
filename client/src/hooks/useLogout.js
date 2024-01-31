import { useAuthContext } from './useAuthContext';

export const useLogout = () => {
    const { dispatch : dispatchUser } = useAuthContext();

    const logout = () => {
        localStorage.removeItem('user');
        dispatchUser({ type: 'LOGOUT' });
    }

    return { logout };
};