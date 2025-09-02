import { useEffect, useRef } from 'react';

import { useTranslations } from '../contexts/AppContext';
import BotAvatar from './Avatar/BotAvatar';

export interface IChat {
  role: 'bot' | 'user';
  message: string;
  isLastMsg?: boolean;
  streaming?: boolean;
}

const ChatbotMessage = ({ role, message, isLastMsg }: IChat) => {
  const t = useTranslations();

  const fullText: string = message === 'processing' ? t.processing : message;
  const element = useRef<HTMLDivElement>(null);
  let index: number = 0;

  useEffect(() => {
    function typeWriter() {
      if (role === 'bot' && isLastMsg) {
        if (index < fullText.length) {
          if (element?.current) {
            element.current.textContent += fullText.charAt(index);
          }
          index++;
          setTimeout(typeWriter, 20);
        }
      } else {
        if (element?.current) {
          element.current.textContent = fullText;
        }
      }
    }

    typeWriter();
  }, []);

  return (
    <div className={`message ${role}-message`}>
      {role === 'bot' && <BotAvatar />}
      <p ref={element} className="message-text" />
    </div>
  );
};

export default ChatbotMessage;
