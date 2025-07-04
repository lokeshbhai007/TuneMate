// src/components/OutputDisplay.jsx
import ResultCard from "./ResultCard";
import { Monitor, Loader2 } from "lucide-react";

export default function OutputDisplay({
  results,
  loading,
  activeAction,
  lastAction,
}) {
  // Show result for the last completed action, not all results
  const currentResult =
    lastAction && results[lastAction] ? results[lastAction] : null;
  const hasCurrentResult = currentResult !== null;

  return (
    <div className="space-y-4 ">
      <div className="bg-terminal-card border border-terminal-border rounded-lg p-3 lg:p-4 min-h-[200px] lg:min-h-[600px] flex flex-col">
        <div className="flex items-center p-2 lg:p-2 space-x-2">
          <span className="text-terminal-green">{">"}</span>
          <span className="text-terminal-green font-mono text-sm lg:text-base">
            OUTPUT:
          </span>
        </div>

        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4">
              <Loader2 className="h-6 w-6 lg:h-8 lg:w-8 animate-spin text-terminal-green" />
              <div className="text-center">
                <div className="text-terminal-green font-mono text-sm lg:text-base">
                  Processing...
                </div>
                <div className="text-terminal-muted text-xs lg:text-sm">
                  AI is analyzing your text
                </div>
              </div>
            </div>
          ) : hasCurrentResult ? (
            <div className="space-y-4 lg:space-y-6 flex-1">
              <ResultCard
                key={lastAction}
                action={lastAction}
                data={currentResult}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 space-y-4 text-terminal-muted">
              <Monitor className="h-8 w-8 lg:h-12 lg:w-12" />
              <div className="text-center">
                <div className="font-medium text-sm lg:text-base">
                  Ready for input
                </div>
                <div className="text-xs lg:text-sm">
                  Enter text and select an action to see results
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}