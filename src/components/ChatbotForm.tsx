import { TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  useAlert,
  useAppContext,
  useTranslations,
} from '../contexts/AppContext';
import { chatService } from '@/services/chatService';

type ChatbotFormProps = {
  isThinking: boolean;
  setIsThinking: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatbotForm = ({ isThinking, setIsThinking }: ChatbotFormProps) => {
  const t = useTranslations();
  const { setChatHistory, language } = useAppContext();
  const [inputValue, setInputValue] = useState<string>('');
  const [placeholder, setPlaceholder] = useState<string>('');
  const { setAlert } = useAlert();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userMessage = inputValue.trim();
    if (!userMessage) return;

    setIsThinking(true);

    setChatHistory((history) => [
      ...history,
      { role: 'user', message: userMessage },
    ]);

    setInputValue('');

    try {
      await chatService.sendMessageStream(userMessage, (chunk) => {
        setChatHistory((history) => {
          const lastMsg = history[history.length - 1];

          if (lastMsg?.role === 'bot' && lastMsg.streaming) {
            return [
              ...history.slice(0, -1),
              { ...lastMsg, message: lastMsg.message + chunk },
            ];
          } else {
            return [
              ...history,
              { role: 'bot', message: chunk, streaming: true },
            ];
          }
        });
      });

      setChatHistory((history) => {
        const lastMsg = history[history.length - 1];
        if (lastMsg?.role === 'bot' && lastMsg.streaming) {
          return [...history.slice(0, -1), { ...lastMsg, streaming: false }];
        }
        return history;
      });
    } catch (error) {
      console.error('Error sending message to agent:', error);
      setAlert(true, 'error', t.errors.ask_agent.alert);
      setChatHistory((history) => [
        ...history,
        { role: 'bot', message: t.errors.ask_agent.chat },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    const text = t.input.placeholder;
    setPlaceholder(text);
  }, [language]);

  return (
    <form onSubmit={onSubmit} className="chat-form">
      <TextField
        size="medium"
        multiline
        maxRows={4}
        id="message"
        placeholder={placeholder}
        disabled={isThinking}
        className="message-input"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.value);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            const form = e.currentTarget.closest('form');
            if (form) {
              form.requestSubmit();
            }
          }
        }}
        value={isThinking ? '' : inputValue}
        sx={{
          marginBottom: '0px !important',
          '& .MuiOutlinedInput-root': {
            padding: 0,
            borderRadius: '32px !important',
            alignItems: 'center',
            minHeight: '47px',
          },
          '& .MuiInputBase-inputMultiline': {
            padding: '12px 16px',
            lineHeight: '23px',
            borderRadius: '32px !important',
          },
          '& .MuiInputAdornment-root': {
            height: '46px',
            marginRight: '4px',
          },
        }}
        slotProps={{
          input: {
            endAdornment: (
              <div className="buttons">
                {!!inputValue && !isThinking && (
                  <button
                    type="button"
                    className="material-symbols-outlined button clear"
                    onClick={() => setInputValue('')}
                  >
                    close_small
                  </button>
                )}
                <button
                  type="submit"
                  className="material-symbols-outlined button"
                  disabled={!inputValue || isThinking}
                >
                  send
                </button>
              </div>
            ),
          },
        }}
      />
    </form>
  );
};

export default ChatbotForm;
