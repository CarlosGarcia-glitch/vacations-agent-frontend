import BotAvatar from '../Avatar/BotAvatar'
import Styles from './_ChatbotThinking.module.scss'

const ChatbotThinking = () => {
   return (
    <div className={`message bot-message`}>
        <BotAvatar />
        <div className={Styles.dot_flashing}></div>
      </div>
   )
}

export default ChatbotThinking