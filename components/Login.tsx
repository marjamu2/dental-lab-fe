
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ToothIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

export const Login: React.FC = () => {
    const { login, register, state } = useAppContext();
    const navigate = useNavigate();
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isLoginView) {
            try {
                await login({ email, password });
                navigate('/');
            } catch (err: any) {
                setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
            }
        } else {
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden.');
                setIsLoading(false);
                return;
            }
            try {
                await register({ email, password });
                alert('Registro exitoso. Ahora puede iniciar sesión.');
                setIsLoginView(true);
            } catch (err: any) {
                setError(err.message || 'Error durante el registro.');
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="flex justify-center items-center mb-6 space-x-3">
                    <div className="bg-primary-800 p-2 rounded-lg">
                        <ToothIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-900">Dental Lab</h1>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>
                    <p className="text-center text-gray-500 mb-6">
                        {isLoginView ? 'Bienvenido de nuevo' : 'Complete los datos para registrarse'}
                    </p>
                    
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLoginView ? "current-password" : "new-password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        
                        {!isLoginView && (
                             <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                            >
                                {isLoading ? <LoadingSpinner size="sm" /> : (isLoginView ? 'Ingresar' : 'Registrarse')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-sm text-primary-600 hover:text-primary-500">
                            {isLoginView ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
