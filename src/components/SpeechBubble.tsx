import React, { useEffect, useState } from 'react';
import '../App.css';

interface SpeechBubbleProps {
  text: string;
  visible: boolean;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, visible }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!visible || !text) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [visible, text, currentIndex]);

  if (!visible) return null;

  return (
    <div className="speech-bubble">
      <div className="speech-bubble__content">{displayedText}</div>
      <div className="speech-bubble__pointer" />
    </div>
  );
};

export default SpeechBubble;
