// src/App.jsx
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Outlet />
    </div>
  );
}