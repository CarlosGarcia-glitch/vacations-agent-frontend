import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute ';
import Login from '@/pages/Login/Login';
import Chat from '@/pages/Chat/Chat';

export const RouterProvider = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
