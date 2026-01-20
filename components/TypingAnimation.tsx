'use client';

import { useState, useEffect, useRef } from 'react';

interface TypingAnimationProps {
  sentences: string[];
  className?: string;
}

export default function TypingAnimation({ sentences, className = '' }: TypingAnimationProps) {
  const [typingText, setTypingText] = useState('');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const typingRef = useRef<{ charIndex: number; isDeleting: boolean; timeoutId: NodeJS.Timeout | null }>({
    charIndex: 0,
    isDeleting: false,
    timeoutId: null
  });

  useEffect(() => {
    const currentSentence = sentences[currentSentenceIndex];
    
    const type = () => {
      const { charIndex, isDeleting } = typingRef.current;
      
      if (isDeleting) {
        setTypingText(currentSentence.substring(0, charIndex - 1));
        typingRef.current.charIndex--;
      } else {
        setTypingText(currentSentence.substring(0, charIndex + 1));
        typingRef.current.charIndex++;
      }

      if (!isDeleting && typingRef.current.charIndex === currentSentence.length) {
        typingRef.current.timeoutId = setTimeout(() => {
          typingRef.current.isDeleting = true;
          type();
        }, 2000);
        return;
      } else if (isDeleting && typingRef.current.charIndex === 0) {
        typingRef.current.isDeleting = false;
        setCurrentSentenceIndex((prev) => (prev + 1) % sentences.length);
        return;
      }

      const speed = isDeleting ? 50 : 100;
      typingRef.current.timeoutId = setTimeout(type, speed);
    };

    typingRef.current.charIndex = 0;
    typingRef.current.isDeleting = false;
    typingRef.current.timeoutId = setTimeout(type, 100);
    
    return () => {
      if (typingRef.current.timeoutId) {
        clearTimeout(typingRef.current.timeoutId);
      }
    };
  }, [currentSentenceIndex, sentences]);

  return (
    <span className={className}>
      {typingText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
