import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateBotPage from './pages/CreateBotPage';
import ChatPage from './pages/ChatPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateBotPage />} />
        <Route path="/chat/share" element={<ChatPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;