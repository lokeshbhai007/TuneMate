"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  RotateCcw,
  Languages,
  Play,
  Square,
  Volume2,
  CheckCircle,
  Lightbulb,
  MessageSquare,
  Copy,
  Check,
  Star,
  ArrowRight,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";

// API utility functions
const GeminiAPI = {
  async evaluateAnswer(question, answer) {
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, answer }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate answer");
      }

      return await response.json();
    } catch (error) {
      console.error("Error evaluating answer:", error);
      throw error;
    }
  },

  async generateQuestion(
    topic = null,
    difficulty = "beginner",
    questionType = "random"
  ) {
    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, difficulty, questionType }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate question");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating question:", error);
      throw error;
    }
  },

  async translateText(text) {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, targetLang: "bengali" }),
      });

      if (!response.ok) {
        throw new Error("Failed to translate text");
      }

      return await response.json();
    } catch (error) {
      console.error("Error translating text:", error);
      throw error;
    }
  },
};

// Fallback questions in case API fails
const fallbackQuestions = [
  {
    english: "Describe your daily morning routine.",
    topic: "Daily Life",
    type: "conversation",
  },
  {
    english: "What would you like to do when you grow up?",
    topic: "Future Plans",
    type: "conversation",
  },
];

// Confirmation Modal Component
function ConfirmationModal({ isOpen, onConfirm, onCancel, hasProgress }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              duration: 0.5,
              bounce: 0.3,
            }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-black/90 border border-terminal-border rounded-lg p-6 max-w-md w-full terminal-glow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-terminal-yellow" />
                  <h3 className="text-lg font-semibold text-terminal-text">
                    New Question
                  </h3>
                </div>
                <button
                  onClick={onCancel}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4 text-terminal-muted" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-terminal-text/80">
                  {hasProgress
                    ? "You have an answer recorded for this question. Getting a new question will clear your current progress."
                    : "Are you sure you want to get a new question?"}
                </p>

                {hasProgress && (
                  <div className="bg-terminal-red/20 border border-terminal-red/50 rounded-lg p-3">
                    <p className="text-terminal-red text-sm">
                      ⚠️ Your current answer and evaluation will be lost
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 cursor-pointer bg-terminal-border text-terminal-muted rounded-md hover:bg-terminal-border/80 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2 cursor-pointer bg-terminal-purple/20 border border-terminal-purple text-terminal-purple rounded-md hover:bg-terminal-purple/30 transition-colors"
                  >
                    Get New
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ResultCard component matching your existing design
function ResultCard({ action, data, onCopy }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const actionConfig = {
    evaluation: {
      title: "Answer Evaluation",
      icon: CheckCircle,
      color: "green",
    },
    improvement: {
      title: "Improved Version",
      icon: Lightbulb,
      color: "blue",
    },
    feedback: {
      title: "Learning Feedback",
      icon: MessageSquare,
      color: "purple",
    },
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      if (onCopy) onCopy();
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="bg-black/30 border border-terminal-border rounded-lg p-3 lg:p-4 hover-glow">
      <div className="flex items-center space-x-2 mb-3 lg:mb-4">
        <Icon
          className={`h-4 w-4 lg:h-5 lg:w-5 text-terminal-${config.color}`}
        />
        <h3 className="font-medium text-terminal-text text-sm lg:text-base">
          {config.title}
        </h3>
      </div>

      {action === "evaluation" && (
        <div className="space-y-3 lg:space-y-4">
          {/* Score */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm font-medium text-terminal-green">
                Score:
              </span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-terminal-yellow fill-current" />
                <span className="text-terminal-yellow font-bold">
                  {data.score}/10
                </span>
              </div>
            </div>
            <p className="text-terminal-text/80 text-sm lg:text-base">
              {data.feedback}
            </p>
          </div>

          {/* Mistakes */}
          {data.mistakes && data.mistakes.length > 0 && (
            <div className="bg-terminal-red/20 border border-terminal-red/50 rounded-lg p-3">
              <h4 className="text-xs lg:text-sm font-medium text-terminal-red mb-2">
                Areas to Improve:
              </h4>
              <ul className="space-y-1">
                {data.mistakes.map((mistake, index) => (
                  <li
                    key={index}
                    className="text-xs lg:text-sm text-terminal-text/70"
                  >
                    • {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {action === "improvement" && (
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs lg:text-sm font-medium text-terminal-blue">
              Improved Version:
            </span>
            <button
              onClick={() => copyToClipboard(data.improved, "improved")}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              {copiedIndex === "improved" ? (
                <Check className="h-3 w-3 lg:h-4 lg:w-4 text-terminal-green" />
              ) : (
                <Copy className="h-3 w-3 lg:h-4 lg:w-4 text-terminal-muted" />
              )}
            </button>
          </div>
          <p className="text-terminal-text text-sm lg:text-base">
            {data.improved}
          </p>
        </div>
      )}
    </div>
  );
}

export default function EnglishPracticeApp() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showBengali, setShowBengali] = useState(false);
  const [bengaliTranslation, setBengaliTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [audioSupported, setAudioSupported] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Auto-feedback related states
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [lastTranscriptLength, setLastTranscriptLength] = useState(0);
  const [autoEvaluationTriggered, setAutoEvaluationTriggered] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Configuration for auto-feedback
  const SILENCE_THRESHOLD = 3000; // 3 seconds of silence
  const MIN_ANSWER_LENGTH = 10; // Minimum characters for a valid answer

  useEffect(() => {
    // Check for speech recognition support
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setAudioSupported(true);
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => {
            const newTranscript = prev + finalTranscript;
            setLastTranscriptLength(newTranscript.length);
            return newTranscript;
          });
        }

        // Handle interim results for real-time display (optional)
        if (interimTranscript && !finalTranscript) {
          // Reset silence timer while user is speaking
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            setSilenceTimer(null);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      };
    }

    // Check for speech synthesis support
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Load initial question
    getRandomQuestion();
  }, []);

  // Auto-evaluation effect
  useEffect(() => {
    if (
      transcript.length > lastTranscriptLength &&
      transcript.length >= MIN_ANSWER_LENGTH &&
      !autoEvaluationTriggered
    ) {
      // Clear existing timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }

      // Set new silence timer
      const timer = setTimeout(() => {
        if (
          transcript.trim().length >= MIN_ANSWER_LENGTH &&
          !isEvaluating &&
          !autoEvaluationTriggered
        ) {
          console.log("Auto-triggering evaluation after silence period");
          setAutoEvaluationTriggered(true);
          evaluateAnswer();
        }
      }, SILENCE_THRESHOLD);

      setSilenceTimer(timer);
    }

    setLastTranscriptLength(transcript.length);
  }, [transcript, autoEvaluationTriggered, isEvaluating]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [silenceTimer]);

  const getRandomQuestion = async () => {
    setIsLoadingQuestion(true);
    try {
      const questionData = await GeminiAPI.generateQuestion();
      setCurrentQuestion(questionData);
      setBengaliTranslation("");
    } catch (error) {
      console.error("Failed to generate question, using fallback:", error);
      const randomIndex = Math.floor(Math.random() * fallbackQuestions.length);
      setCurrentQuestion(fallbackQuestions[randomIndex]);
    } finally {
      resetState();
      setIsLoadingQuestion(false);
    }
  };

  const resetState = () => {
    setTranscript("");
    setEvaluation(null);
    setShowBengali(false);
    setAutoEvaluationTriggered(false);
    setLastTranscriptLength(0);
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  };

  const translateToBengali = async () => {
    if (!currentQuestion || bengaliTranslation) return;

    setIsTranslating(true);
    try {
      const translation = await GeminiAPI.translateText(
        currentQuestion.english
      );
      setBengaliTranslation(translation.translated);
    } catch (error) {
      console.error("Translation failed:", error);
      setBengaliTranslation("Translation not available");
    } finally {
      setIsTranslating(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && audioSupported) {
      setIsListening(true);
      setTranscript("");
      setEvaluation(null); // Clear previous evaluation
      setAutoEvaluationTriggered(false); // Reset auto-evaluation flag
      setLastTranscriptLength(0);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);

      // If there's content and we haven't triggered auto-evaluation yet, do it now
      if (
        transcript.trim().length >= MIN_ANSWER_LENGTH &&
        !autoEvaluationTriggered &&
        !isEvaluating
      ) {
        setAutoEvaluationTriggered(true);
        // Small delay to ensure transcript is fully captured
        setTimeout(() => {
          evaluateAnswer();
        }, 500);
      }
    }
  };

  const speakQuestion = (text) => {
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = showBengali ? "bn-BD" : "en-US";
      utterance.rate = 0.9;
      synthRef.current.speak(utterance);
    }
  };

  const handleLanguageToggle = async () => {
    if (!showBengali && !bengaliTranslation) {
      await translateToBengali();
    }
    setShowBengali(!showBengali);
  };

  const evaluateAnswer = async () => {
    if (!transcript.trim() || isEvaluating) return;

    console.log("Starting evaluation for transcript:", transcript);
    setIsEvaluating(true);

    // Clear any pending silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }

    try {
      const result = await GeminiAPI.evaluateAnswer(
        currentQuestion.english,
        transcript
      );
      setEvaluation(result);
      console.log("Evaluation completed:", result);
    } catch (error) {
      console.error("Evaluation failed:", error);
      // Fallback evaluation
      setEvaluation({
        score: 5,
        feedback:
          "We couldn't evaluate your answer right now, but keep practicing!",
        mistakes: ["Please try again later for detailed feedback."],
        improved: transcript,
        strengths: ["You attempted to answer the question."],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleManualEvaluation = () => {
    if (!autoEvaluationTriggered) {
      setAutoEvaluationTriggered(true);
      evaluateAnswer();
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setEvaluation(null);
    setAutoEvaluationTriggered(false);
    setLastTranscriptLength(0);
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  };

  // Handle next question button click
  const handleNextQuestionClick = () => {
    // Check if there's any progress (transcript or evaluation)
    const hasProgress = transcript.trim().length > 0 || evaluation !== null;

    // if (hasProgress) {
    setShowConfirmModal(true);
    // }
  };

  // Handle confirmation
  const handleConfirmNewQuestion = () => {
    setShowConfirmModal(false);
    getRandomQuestion();
  };

  // Handle cancel
  const handleCancelNewQuestion = () => {
    setShowConfirmModal(false);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-terminal flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-terminal-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-terminal-text">
            {isLoadingQuestion ? "Generating question..." : "Loading..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <Header />
      <div className="min-h-screen bg-gradient-terminal p-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Question Card */}
          <div className="bg-black/30 border border-terminal-border rounded-lg p-4 lg:p-6 terminal-glow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-terminal-purple" />
                <span className="text-terminal-purple text-sm font-medium">
                  {currentQuestion.topic}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLanguageToggle}
                  disabled={isTranslating}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    showBengali
                      ? "bg-terminal-green/20 text-terminal-green border border-terminal-green/50"
                      : "bg-terminal-border text-terminal-muted hover:bg-terminal-border/80"
                  }`}
                >
                  <Languages className="h-3 w-3 inline mr-1" />
                  {isTranslating
                    ? "Translating..."
                    : showBengali
                    ? "Bengali"
                    : "English"}
                </button>
                <button
                  onClick={() =>
                    speakQuestion(
                      showBengali ? bengaliTranslation : currentQuestion.english
                    )
                  }
                  disabled={showBengali && !bengaliTranslation}
                  className="p-2 cursor-pointer rounded-md bg-terminal-blue/20 text-terminal-blue hover:bg-terminal-blue/30 transition-colors disabled:opacity-50"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg lg:text-xl text-terminal-text font-medium leading-relaxed">
                {showBengali
                  ? bengaliTranslation || "Translation loading..."
                  : currentQuestion.english}
              </p>
            </div>
          </div>

          {/* Voice Input Section */}
          <div className="bg-black/30 border border-terminal-border rounded-lg px-4 py-2 lg:p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-terminal-text">
                Your Answer
              </h3>

              {/* Voice Control Button */}
              <div className="flex justify-center ">
                {audioSupported ? (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isEvaluating}
                    className={`p-6 rounded-full transition-all duration-300 cursor-pointer ${
                      isListening
                        ? "bg-terminal-red/20 border-2 border-terminal-red text-terminal-red animate-pulse"
                        : "bg-terminal-green/20 border-2 border-terminal-green text-terminal-green hover:bg-terminal-green/30"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </button>
                ) : (
                  <div className="text-terminal-red text-sm">
                    Voice input not supported in this browser
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-terminal-muted text-sm">
                  {isListening
                    ? "Listening... Speak your answer"
                    : "Click the microphone to start speaking"}
                </p>

                {/* Auto-evaluation status */}
                {transcript && !isEvaluating && !autoEvaluationTriggered && (
                  <p className="text-terminal-blue text-xs">
                    Auto-feedback will trigger after you stop speaking...
                  </p>
                )}

                {isEvaluating && (
                  <p className="text-terminal-yellow text-xs flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 border border-terminal-yellow border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing your answer...</span>
                  </p>
                )}
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="bg-terminal-card border border-terminal-border rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-medium text-terminal-blue mb-2">
                    What you said:
                  </h4>
                  <p className="text-terminal-text text-left">{transcript}</p>

                  <div className="flex justify-center space-x-3 mt-4">
                    {/* Manual evaluation button - only show if auto-evaluation hasn't been triggered */}
                    {!autoEvaluationTriggered && !isEvaluating && (
                      <button
                        onClick={handleManualEvaluation}
                        className="px-6 py-2 bg-terminal-blue/20 border border-terminal-blue text-terminal-blue rounded-md hover:bg-terminal-blue/30 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Get Feedback Now</span>
                      </button>
                    )}

                    <button
                      onClick={clearTranscript}
                      disabled={isEvaluating}
                      className="px-4 py-2 bg-terminal-border text-terminal-muted rounded-md hover:bg-terminal-border/80 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Evaluation Results */}
          {evaluation && (
            <div className="space-y-4">
              <ResultCard action="evaluation" data={evaluation} />
              <ResultCard action="improvement" data={evaluation} />
            </div>
          )}

          {/* Next Question Button */}
          <div className="text-center ">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNextQuestionClick}
              disabled={isLoadingQuestion}
              className="cursor-pointer px-6 py-3 bg-terminal-purple/20 border border-terminal-purple text-terminal-purple rounded-lg hover:bg-terminal-purple/30 transition-all button-glow flex items-center space-x-2 mx-auto disabled:opacity-50"
            >
              {isLoadingQuestion ? (
                <>
                  <div className="w-4 h-4 border-2 border-terminal-purple border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  <span>Next Question</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmNewQuestion}
        onCancel={handleCancelNewQuestion}
        hasProgress={transcript.trim().length > 0 || evaluation !== null}
      />
    </div>
  );
}
