// src/components/ActionButtons.jsx
import {
  CheckCircle,
  Lightbulb,
  Heart,
  MessageCircle,
  Loader2,
} from "lucide-react";

export default function ActionButtons({
  onAction,
  loading,
  activeAction,
  disabled,
  inputText,
  contextText,
  onClearAll, // Add this prop
}) {
  const buttons = [
    {
      id: "fix-grammar",
      label: "Fix Grammar",
      icon: CheckCircle,
      color: "green",
      description: "Correct grammar...",
    },
    {
      id: "reply-suggestion",
      label: "Reply Generate",
      icon: MessageCircle,
      color: "yellow",
      description: "Suggest responses...",
    },
    {
      id: "simplify",
      label: "Simplify",
      icon: Lightbulb,
      color: "blue",
      description: "Make text easier...",
    },
    {
      id: "make-polite",
      label: "Make Polite",
      icon: Heart,
      color: "purple",
      description: "Add polite tone...",
    },
  ];

  const handleAction = async (actionId) => {
    if (actionId === "reply-suggestion") {
      // Handle reply generation with API call
      await handleReplyGeneration(actionId);
    } else if (actionId === "fix-grammar") {
      // Handle grammar fixing with API call
      await handleGrammarFix(actionId);
    } else {
      // Handle other actions normally
      onAction(actionId);
    }
  };

  const handleGrammarFix = async (actionId) => {
    if (!inputText || inputText.trim() === "") {
      alert("Please enter some text in the primary input field first.");
      return;
    }

    // Simply call the parent's onAction - let it handle the API call
    onAction(actionId);
  };

  const handleReplyGeneration = async (actionId) => {
    if (!inputText || inputText.trim() === "") {
      alert("Please enter some text in the primary input field first.");
      return;
    }

    // Simply call the parent's onAction - let it handle the API call
    onAction(actionId);
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Header Section */}
      <div className="flex items-center justify-between p-2 lg:p-2 space-x-2">
        {/* ACTION Label */}
        <div className="group flex items-center space-x-1 cursor-default">
          <span className="text-terminal-green group-hover:text-terminal-green/80 transition-colors duration-200 font-mono">
            {">"}
          </span>
          <span className="text-terminal-green group-hover:text-terminal-green/80 transition-colors duration-200 font-mono text-sm lg:text-base font-semibold tracking-wider">
            ACTION:
          </span>
          {/* <div className="w-1.5 h-1.5 bg-terminal-green rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200 animate-pulse"></div> */}
        </div>

        {/* CLEAR ALL Button */}
        <div 
          className="group flex items-center space-x-1 cursor-pointer px-2 py-1 rounded-md hover:bg-terminal-red/10 transition-all duration-200 transform hover:scale-105 active:scale-95"
          onClick={handleClearAll}
        >
          <span className="text-terminal-red group-hover:text-terminal-red/80 transition-colors duration-200 font-mono">
            {">"}
          </span>
          <span className="text-terminal-red underline group-hover:text-terminal-red/80 transition-colors duration-200 font-mono text-sm lg:text-base font-semibold tracking-wider">
            CLEAR ALL
          </span>
          <div className="w-1.5 h-1.5 bg-terminal-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {buttons.map(({ id, label, icon: Icon, color, description }) => (
          <button
            key={id}
            onClick={() => handleAction(id)}
            disabled={disabled || loading}
            className={`group relative bg-terminal-card border border-terminal-border rounded-lg p-3 lg:p-4 button-glow hover:border-terminal-${color} disabled:opacity-50 disabled:cursor-not-allowed card-glow`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-terminal-${color}/20`}>
                {loading && activeAction === id ? (
                  <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin text-terminal-text" />
                ) : (
                  <Icon
                    className={`h-4 w-4 lg:h-5 lg:w-5 text-terminal-${color}`}
                  />
                )}
              </div>
              <div className="text-left">
                <div className="font-medium text-terminal-text text-sm lg:text-base">
                  {label}
                </div>
                <div className="text-xs lg:text-sm text-terminal-muted">
                  {description}
                </div>
              </div>
            </div>

            {loading && activeAction === id && (
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <div className="text-terminal-green font-mono text-xs lg:text-sm">
                  Processing...
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}