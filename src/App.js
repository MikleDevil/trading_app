import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainScreen from './components/MainScreen';
import Profile from './components/Profile';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import Deposit from './components/Deposit';

function App() {
  return (
    <BrowserRouter basename="/trading-app">
      <Routes>
        <Route
            path="/"
            element={
              <PrivateRoute>
                <MainScreen />
              </PrivateRoute>
            }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/deposit" element={<Deposit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
