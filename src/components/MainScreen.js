import React, { useEffect, useState } from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, push, set } from "firebase/database";

const MainScreen = () => {
  const [userId, setUserId] = useState(null);
  const [sellOrders, setSellOrders] = useState([]);
  const [buyOrders, setBuyOrders] = useState([]);
  const [selectedChart, setSelectedChart] = useState('BNBUSDT');
  const [showPopup, setShowPopup] = useState(false);
  const [orderType, setOrderType] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [priceUSD, setPriceUSD] = useState('');
  const [bnbPrice, setBnbPrice] = useState(0); // Инициализируем с 0

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            setUserId(user.uid);
        } else {
            setUserId(null);
        }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const database = getDatabase();
      const ordersRef = ref(database, `users/${userId}/orders`);

      const unsubscribe = onValue(ordersRef, (snapshot) => {
        const ordersData = snapshot.val();
        if (ordersData) {
          const ordersList = Object.keys(ordersData).map((key) => ({
            id: key,
            ...ordersData[key],
          }));
          setSellOrders(ordersList.filter(order => order.order_type === "SELL"));
          setBuyOrders(ordersList.filter(order => order.order_type === "BUY"));
        } else {
          setSellOrders([]);
          setBuyOrders([]);
        }
      });

      return () => unsubscribe();
    }
  }, [userId]);

  // Функция для получения текущей стоимости BNB через Binance API
  const fetchBnbPrice = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
      const data = await response.json();
      setBnbPrice(parseFloat(data.price));
    } catch (error) {
      console.error('Ошибка при получении цены BNB:', error);
    }
  };

  useEffect(() => {
    fetchBnbPrice();
    const interval = setInterval(fetchBnbPrice, 60000); // обновление каждые 60 секунд
    return () => clearInterval(interval);
  }, []);

  const createOrder = (type) => {
    setOrderType(type);
    setShowPopup(true);
  };

  const confirmOrder = () => {
    const database = getDatabase();

    if (!userId) {
      alert('User not authenticated');
      return;
    }

    const amountBNB = (amountUSD / bnbPrice).toFixed(3);

    const orderData = {
      order_type: orderType,
      token_name: selectedChart,
      price: priceUSD,
      count: amountBNB,
    };

    const OrderRefs = ref(database, 'users/' + userId + '/orders');
    const newOrderRef = push(OrderRefs);
    set(newOrderRef, orderData)
      .then(() => {
        alert(`Order ${orderType} created successfully!`);
        setShowPopup(false);
        setAmountUSD('');
        setPriceUSD('');
      })
      .catch((error) => {
        alert(`Error creating order: ${error.message}`);
      });
  };

  return (
    <div id="root" className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center bg-gray-700 shadow-md rounded-b-2xl">
        <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-wider">BALANCE</h1>
            <button 
                className="w-12 h-12 ml-4 bg-gray-500 rounded-full border-2 border-gray-300 flex items-center justify-center"
                onClick={() => window.location.href = '/deposit'}
            >
            +
            </button>
        </div>
        <button 
            className="w-12 h-12 bg-gray-500 rounded-full border-2 border-gray-300 flex items-center justify-center"
            onClick={() => window.location.href = '/profile'}
        >
          👤
        </button>
      </header>

      {/* TradingView Chart */}
      <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg" style={{ height: '60vh' }}>
        <AdvancedRealTimeChart 
            symbol={selectedChart} 
            theme="dark"
            autosize/>
      </div>

      {/* Token Selection */}
      <div className="mt-6 flex space-x-4">
        <button
          className={`px-4 py-2 rounded-lg ${selectedChart === 'XRPBNB' ? 'bg-gray-500' : 'bg-gray-600'}`}
          onClick={() => setSelectedChart('XRPBNB')}
        >
          XRP
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${selectedChart === 'BNBUSDT' ? 'bg-gray-500' : 'bg-gray-600'}`}
          onClick={() => setSelectedChart('BNBUSDT')}
        >
          BUSD
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${selectedChart === 'BNBETH' ? 'bg-gray-500' : 'bg-gray-600'}`}
          onClick={() => setSelectedChart('BNBETH')}
        >
          ETH
        </button>
      </div>

      {/* Buttons for BUY and SELL */}
      <div className="mt-6 flex space-x-4">
        <div className="flex flex-col items-center">
          <button
            className="px-10 py-3 bg-red-600 rounded-lg hover:bg-red-500 shadow-md text-lg font-semibold transform hover:scale-105 transition"
            onClick={() => createOrder("SELL")}
          >
            SELL
          </button>
          {sellOrders.map((order) => (
            <div key={order.id} className="bg-gray-700 rounded-lg shadow-md p-4 mt-4 w-full text-gray-400">
              <p><strong>Токен:</strong> {order.token_name}</p>
              <p><strong>Цена:</strong> {order.price}</p>
              <p><strong>Количество:</strong> {order.count}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <button
            className="px-10 py-3 bg-green-600 rounded-lg hover:bg-green-500 shadow-md text-lg font-semibold transform hover:scale-105 transition"
            onClick={() => createOrder("BUY")}
          >
            BUY
          </button>
          {buyOrders.map((order) => (
            <div key={order.id} className="bg-gray-700 rounded-lg shadow-md mt-4 p-4 w-full text-gray-400">
              <p><strong>Токен:</strong> {order.token_name}</p>
              <p><strong>Цена:</strong> {order.price}</p>
              <p><strong>Количество:</strong> {order.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder Sections */}
      {(sellOrders.length === 0 && buyOrders.length === 0) && (
        <div className="mt-8 grid grid-cols-2 gap-6 w-11/12 max-w-3xl">
            <div className="bg-gray-700 rounded-lg shadow-md h-32 flex items-center justify-center text-gray-400">
            Placeholder 1
            </div>
            <div className="bg-gray-700 rounded-lg shadow-md h-32 flex items-center justify-center text-gray-400">
            Placeholder 2
            </div>
        </div>
      )}

      {/* Popup for Order Configuration */}
        {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">{orderType} Order</h2>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Amount in USD</label>
                <div className="flex">
                <input
                    type="number"
                    className="block appearance-none w-full bg-gray-600 border border-gray-500 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-gray-400"
                    placeholder="Enter amount in USD"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(e.target.value)}
                />
                <span className="ml-2 self-center">≈ {(amountUSD / bnbPrice).toFixed(3)} BNB</span>
                </div>
            </div>
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Price in USD</label>
                <input
                type="number"
                className="block appearance-none w-full bg-gray-600 border border-gray-500 text-white py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-gray-400"
                placeholder="Enter price in USD"
                value={priceUSD}
                onChange={(e) => setPriceUSD(e.target.value)}
                />
            </div>
            <button
                className="w-full px-4 py-3 bg-green-600 rounded-lg hover:bg-green-500 shadow-md text-lg font-semibold transform hover:scale-105 transition"
                onClick={confirmOrder}
            >
                Confirm {orderType}
            </button>
            <button
                className="w-full mt-2 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-500 shadow-md text-lg font-semibold transform hover:scale-105 transition"
                onClick={() => setShowPopup(false)}
            >
                Cancel
            </button>
            </div>
        </div>
        )}
    </div>
  );
};

export default MainScreen;