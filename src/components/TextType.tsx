import { useEffect, useRef, useState } from 'react';

interface TextTypeProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  cursorBlinkDuration?: number;
  className?: string;
  onDone?: () => void; // called after all texts have been typed (no delete on last)
}

export default function TextType({
  texts,
  typingSpeed = 75,
  deletingSpeed = 50,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = '_',
  cursorBlinkDuration = 0.5,
  className = '',
  onDone,
}: TextTypeProps) {
  const [displayed, setDisplayed] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<'typing' | 'pausing' | 'deleting'>('typing');
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cursor blink
  useEffect(() => {
    if (!showCursor) return;
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, cursorBlinkDuration * 1000);
    return () => clearInterval(interval);
  }, [showCursor, cursorBlinkDuration]);

  // Typing machine
  useEffect(() => {
    const tick = () => {
      if (doneRef.current) return;

      const currentText = texts[indexRef.current];

      if (phaseRef.current === 'typing') {
        charRef.current += 1;
        setDisplayed(currentText.slice(0, charRef.current));

        if (charRef.current >= currentText.length) {
          // Finished typing this text
          const isLast = indexRef.current === texts.length - 1;
          if (isLast) {
            // Last text typed — done, no delete
            doneRef.current = true;
            onDone?.();
            return;
          }
          phaseRef.current = 'pausing';
          timerRef.current = setTimeout(tick, pauseDuration);
          return;
        }
      } else if (phaseRef.current === 'pausing') {
        phaseRef.current = 'deleting';
      } else if (phaseRef.current === 'deleting') {
        charRef.current -= 1;
        setDisplayed(currentText.slice(0, charRef.current));

        if (charRef.current <= 0) {
          indexRef.current += 1;
          phaseRef.current = 'typing';
        }
      }

      const delay =
        phaseRef.current === 'deleting' ? deletingSpeed : typingSpeed;
      timerRef.current = setTimeout(tick, delay);
    };

    timerRef.current = setTimeout(tick, typingSpeed);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className={className}>
      {displayed}
      {showCursor && (
        <span style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s' }}>
          {cursorCharacter}
        </span>
      )}
    </span>
  );
}
