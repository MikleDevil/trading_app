import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const db = getDatabase();

      // Проверяем, авторизован ли пользователь
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const userRef = ref(db, `users/${currentUser.uid}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
              setUserData(snapshot.val());
            } else {
              console.log("No user data found.");
            }
          } catch (error) {
            console.error("Error fetching user data:", error.message);
          } finally {
            setLoading(false);
          }
        } else {
          console.log("User is not authenticated. Redirecting to login...");
          navigate("/login");
        }
      });

      return () => unsubscribe();
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("User logged out.");
      navigate("/login"); // Перенаправляем на страницу входа
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Данные пользователя не найдены.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Профиль</h1>
        <div className="mb-4">
          <p className="text-lg">
            <strong>Имя пользователя:</strong> {userData.username || "Не указано"}
          </p>
          <p className="text-lg">
            <strong>Email:</strong> {userData.email}
          </p>
          <p className="text-lg">
            <strong>Дата создания:</strong>{" "}
            {new Date(userData.createdAt).toLocaleString() || "Не указано"}
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 py-2 rounded hover:bg-blue-500 transition text-center"
          >
            На главный экран
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 py-2 rounded hover:bg-red-500 transition text-center"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
