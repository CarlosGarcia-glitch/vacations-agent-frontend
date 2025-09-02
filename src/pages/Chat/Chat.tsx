import { useEffect, useRef, useState } from 'react';
import {
  useAlert,
  useAppContext,
  useTranslations,
} from '../../contexts/AppContext';

import ChatbotForm from '../../components/ChatbotForm';
import ChatbotMessage, { IChat } from '../../components/ChatbotMessage';
import ChatbotIcon from '../../components/icons/ChatbotIcon';
import { LoginOutlined } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { chatService } from '@/services/chatService';
import ChatbotThinking from '@/components/ChatbotThinking/ChatbotThinking';
import './Chat.scss';
import AuthService from '@/services/authService';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const t = useTranslations();
  const { setUser, user } = useAppContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const { language, setLanguage, chatHistory, setChatHistory } =
    useAppContext();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const { setAlert } = useAlert();

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initChat = async () => {
      try {
        const { session_id } = await chatService.createChatSession();
        localStorage.setItem('sessionId', session_id);
        try {
          await chatService.sendMessage('');
          setChatHistory([
            {
              message: `¡Hola, ${user?.given_name}! ¿Cómo puedo ayudarte a planear tu próximo día de vacaciones?`,
              role: 'bot',
            },
          ]);
        } catch (error) {
          throw new Error('Error sending message to agent');
        }
      } catch (err) {
        setAlert(true, 'error', t.errors.init_chat.alert);
        setChatHistory([
          {
            role: 'bot',
            message: t.errors.init_chat.chat,
          },
        ]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, []);

  useEffect(() => {
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatHistory]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
  };

  const lastBotIndex = chatHistory?.map((m) => m.role).lastIndexOf('bot');

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    }
  };

  return (
    <div className="container">
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">ISOL Agent</h2>
          </div>
          <div className="buttons-header">
            <div>
              <button
                onClick={toggleLanguage}
                className="material-symbols-outlined"
              >
                {language === 'es' ? 'language_spanish' : 'language_us'}
              </button>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="material-symbols-outlined"
              >
                <LoginOutlined sx={{ height: 38 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Chatbot Body */}
        <div className="chat-body" ref={chatBodyRef}>
          {loading ? (
            <div className="chat-loading">
              <CircularProgress />
            </div>
          ) : (
            <>
              {chatHistory.map((chat: IChat, index: number) => (
                <ChatbotMessage
                  key={index}
                  role={chat.role}
                  message={chat.message}
                  isLastMsg={chat.role === 'bot' && index === lastBotIndex}
                />
              ))}
              {isThinking && <ChatbotThinking />}
            </>
          )}
        </div>

        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatbotForm isThinking={isThinking} setIsThinking={setIsThinking} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
