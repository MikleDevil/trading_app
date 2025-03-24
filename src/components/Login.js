import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    // При монтировании компонента проверяем, авторизован ли пользователь
    useEffect(() => {
        const auth = getAuth();
    
        // Отслеживаем изменения состояния авторизации
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // Если пользователь авторизован, перенаправляем его на главную страницу
            setIsAuthenticated(true);
            navigate('/'); // Перенаправление на главную страницу
          } else {
            // Если нет, остаемся на странице входа
            setIsAuthenticated(false);
          }
        });
    
        // Очистка подписки при размонтировании компонента
        return () => unsubscribe();
      }, [navigate]);

    const handleLogin = async (e) => {
      e.preventDefault();
      const auth = getAuth();
  
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // Если вход успешен, перенаправляем на главную страницу
        navigate('/');
      } catch (err) {
        setError('Неправильный логин или пароль');
      }
    };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="flex flex-col space-y-4" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="p-2 bg-gray-700 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 bg-gray-700 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-green-600 py-2 rounded hover:bg-green-500">
          Login
        </button>
        <button type="submit" className="bg-green-600 py-2 rounded hover:bg-green-500"
            onClick={() => window.location.href = '/register'}>
          Sign In
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
