import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DepositPage = () => {
  const navigate = useNavigate();
  const [selectedToken, setSelectedToken] = useState('BNB');
  const [amount, setAmount] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const adressToDeposit = '0x62961858E29cd6700182ab2E8faF77CEADBE8Be2';

  const handleDeposit = () => {
    // Логика для обработки пополнения
    setShowPopup(true);
  };

  const handleConfirmDeposit = () => {
    // Логика для подтверждения пополнения
    alert('Пополнение подтверждено');
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col items-center justify-center">
      <button
        className="absolute top-4 left-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 shadow-md text-lg font-semibold transform hover:scale-105 transition"
        onClick={() => navigate('/')}
      >
        ← На главный экран
      </button>

      <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Пополнение криптовалюты</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Выберите токен</label>
          <div className="relative">
            <select
              className="block appearance-none w-full bg-gray-600 border border-gray-500 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-gray-400"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              <option value="BNB">
                BNB
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Количество</label>
          <input
            type="number"
            className="block appearance-none w-full bg-gray-600 border border-gray-500 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-gray-400"
            placeholder="Введите количество"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button
          className="w-full px-4 py-3 bg-green-600 rounded-lg hover:bg-green-500 shadow-md text-lg font-semibold transform hover:scale-105 transition"
          onClick={handleDeposit}
        >
          Пополнить
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Информация для пополнения</h2>
            <p className="mb-2"><strong>Имя токена:</strong> {selectedToken}</p>
            <p className="mb-2"><strong>Количество токена:</strong> {amount}</p>
            <p className="mb-4">
                <strong>Адрес для пополнения:</strong>
                <span
                    className="cursor-pointer text-gray-300 hover:text-gray-200"
                    onClick={() => navigator.clipboard.writeText({adressToDeposit})}
                >
                    {adressToDeposit}
                </span>
            </p>
            <p className="mb-6 text-center text-gray-400">Переведите на кошелёк указанную сумму, после обработки транзакции ваши средства поступят вам на счёт.</p>
            <button
                className="w-full px-4 py-3 bg-green-600 rounded-lg hover:bg-green-500 shadow-md text-lg font-semibold transform hover:scale-105 transition"
                onClick={handleConfirmDeposit}
            >
                Я пополнил
            </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DepositPage;