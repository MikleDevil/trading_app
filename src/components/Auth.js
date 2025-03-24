import React from 'react';

const Auth = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Login to Crypto Trading</h1>
      <button
        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition text-xl"
        onClick={() => alert('Авторизация через Telegram')}
      >
        Login via Telegram
      </button>
    </div>
  );
};

export default Auth;
