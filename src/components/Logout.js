import React from "react";
import { getAuth, signOut } from 'firebase/auth';

const Logout = () => {
    const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      // После выхода можно перенаправить на страницу входа
    } catch (err) {
      console.error('Error signing out:', err.message);
    }
  };

  return (
    <button className="bg-red-600 py-2 px-4 rounded hover:bg-red-500" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;
