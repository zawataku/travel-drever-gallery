import React, { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await signInWithEmailAndPassword(email, password);
            if (success) {
                navigate('/admin');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className='max-w-2xl w-full flex p-2 md:p-3 flex-col justify-center items-center min-h-screen'>
            <div className="w-full bg-white rounded-lg shadow-lg mx-auto p-6 md:p-10">
                <h2 className="text-2xl font-bold">管理者ログイン</h2>
                <hr className="my-4 border-neutral-200" />
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor='email' className="block text-sm font-medium text-neutral-700 mb-2">Email: </label>
                        <input
                            id='email'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor='password' className="block text-sm font-medium text-neutral-700 mb-2">Password: </label>
                        <input
                            id='password'
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-800 disabled:bg-neutral-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'ログイン中...' : 'ログイン'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error.message}</p>}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;