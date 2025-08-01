// src/components/Header.jsx
import { Brain, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "../components/Theme-toggle";
import { useRouter } from 'next/navigation';

// Custom SVG Logo Component
const TuneMateLogo = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer growth ring */}
    <circle
      cx="16"
      cy="16"
      r="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.3"
    />

    {/* Human figure/connection symbol */}
    <circle cx="16" cy="10" r="3" fill="currentColor" opacity="0.8" />

    {/* Body/communication flow */}
    <path
      d="M16 13v6c0 1 0 2 0 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Arms reaching out - representing expression and connection */}
    <path
      d="M13 16c-2 0-4 1-4 1M19 16c2 0 4 1 4 1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />

    {/* Heart/kindness symbol */}
    <path
      d="M12 19.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5z"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="M16.5 19.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5z"
      fill="currentColor"
      opacity="0.6"
    />

    {/* Communication waves/clarity */}
    <path
      d="M22 12c1 0 2 1 2 2s-1 2-2 2M26 10c1.5 0 3 1.5 3 3s-1.5 3-3 3"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* Confidence/growth indicator */}
    <path
      d="M8 24l2-2 2 2 2-2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

// Typing Animation Component
const TypingAnimation = () => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const fullText = "TuneMate";
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseTime = 1000;

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing forward
          if (currentIndex < fullText.length) {
            setDisplayText(fullText.slice(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
          } else {
            // Pause before deleting
            setTimeout(() => setIsDeleting(true), pauseTime);
          }
        } else {
          // Deleting backward
          if (currentIndex > 0) {
            setDisplayText(fullText.slice(0, currentIndex - 1));
            setCurrentIndex(currentIndex - 1);
          } else {
            // Start typing again
            setIsDeleting(false);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, fullText]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <span className="inline-flex items-center">
      {displayText}
      <span
        className={`ml-0.5 w-0.5 h-5 lg:h-6 bg-terminal-green transition-opacity duration-100 ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
};

export default function Header() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/english-practice");
  };

  return (
    <header className="bg-terminal-card border-b border-terminal-border">
      <div className="container mx-auto px-4 lg:px-32 py-2 lg:py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="flex items-center space-x-2">
              <TuneMateLogo className="h-10 w-10 lg:h-12 lg:w-12 text-terminal-green" />
              <h1 className="text-lg lg:text-2xl font-bold text-terminal-green min-w-[120px] lg:min-w-[160px]">
                <TypingAnimation />
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-terminal-muted">
              <Brain className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="text-xs lg:text-sm">AI-Powered</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-terminal-muted">
              <Zap className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="text-xs lg:text-sm">Real-time</span>
            </div>
            <div>
              <button></button>
            </div>
            <div>
              <button
                onClick={handleClick}
                className="px-4 py-1 md:py-2 bg-purple-600 text-white rounded cursor-pointer hover:bg-purple-700"
              >
                Practice
              </button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
