"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Code,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Play,
  Loader2,
  FileText,
} from "lucide-react";

interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

interface CodeReviewResult {
  overallRating: number;
  tidiness: number;
  neatness: number;
  productivity: number;
  summary: string;
  suggestions: string[];
  errors: string[];
  improvements: string[];
  explanation: string;
  testCases: TestCase[];
}

interface CodeReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

const CodeReviewDialog = ({
  isOpen,
  onClose,
  code,
  language,
}: CodeReviewDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleCodeReview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/code-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.error || "Failed to get code review");
      }

      const result: CodeReviewResult = await response.json();
      setReviewResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during code review"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));

  const renderSection = (
    title: string,
    items: string[],
    icon: React.ReactNode,
    color: string
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-sm font-semibold text-white">{title}</h4>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${color} border-l-4 border-l-current`}
            >
              <p className="text-sm text-gray-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ratingKeys: (keyof Pick<
    CodeReviewResult,
    "overallRating" | "tidiness" | "neatness" | "productivity"
  >)[] = ["overallRating", "tidiness", "neatness", "productivity"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#12121a] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Code Review
                  </h2>
                  <p className="text-sm text-gray-400">
                    AI-powered code analysis and suggestions
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {!reviewResult && !isLoading && !error && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Ready to Review Your Code
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Get detailed analysis, suggestions, and test cases for your{" "}
                    {language} code
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCodeReview}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Start Code Review
                  </motion.button>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Analyzing Your Code...
                    </h3>
                    <p className="text-gray-400">This may take a few moments</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Review Failed
                  </h3>
                  <p className="text-gray-400 mb-6">{error}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCodeReview}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Try Again
                  </motion.button>
                </div>
              )}

              {reviewResult && (
                <div className="space-y-8">
                  {/* Ratings */}
                  <div className="bg-[#1a1a2e]/50 rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Overall Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {ratingKeys.map((key) => (
                        <div key={key} className="text-center">
                          <div className="flex justify-center mb-2">
                            {renderStars(reviewResult[key])}
                          </div>
                          <p className="text-sm font-medium text-white">
                            {key.replace("Rating", "")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {reviewResult[key]}/5
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#1a1a2e]/50 rounded-xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Summary
                      </h3>
                    </div>
                    <p className="text-gray-200 leading-relaxed">
                      {reviewResult.summary}
                    </p>
                  </div>

                  {/* Suggestions */}
                  {renderSection(
                    "Suggestions",
                    reviewResult.suggestions,
                    <Lightbulb className="w-5 h-5 text-yellow-400" />,
                    "bg-yellow-500/10"
                  )}

                  {/* Errors */}
                  {renderSection(
                    "Errors & Issues",
                    reviewResult.errors,
                    <AlertTriangle className="w-5 h-5 text-red-400" />,
                    "bg-red-500/10"
                  )}

                  {/* Improvements */}
                  {renderSection(
                    "Improvements",
                    reviewResult.improvements,
                    <CheckCircle className="w-5 h-5 text-green-400" />,
                    "bg-green-500/10"
                  )}

                  {/* Detailed Explanation */}
                  <div className="bg-[#1a1a2e]/50 rounded-xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Code className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Detailed Explanation
                      </h3>
                    </div>
                    <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {reviewResult.explanation}
                    </div>
                  </div>

                  {/* Test Cases */}
                  {reviewResult.testCases.length > 0 && (
                    <div className="bg-[#1a1a2e]/50 rounded-xl p-6 border border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Play className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Demo Test Cases
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {reviewResult.testCases.map((testCase, index) => (
                          <div
                            key={index}
                            className="bg-[#0f0f1a] rounded-lg p-4 border border-white/5"
                          >
                            <h4 className="text-sm font-medium text-white mb-2">
                              Test Case {index + 1}
                            </h4>
                            <p className="text-xs text-gray-400 mb-3">
                              {testCase.description}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-gray-300 mb-1">
                                  Input:
                                </p>
                                <code className="block bg-black/30 rounded p-2 text-xs text-green-400 font-mono">
                                  {testCase.input}
                                </code>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-300 mb-1">
                                  Expected Output:
                                </p>
                                <code className="block bg-black/30 rounded p-2 text-xs text-blue-400 font-mono">
                                  {testCase.expectedOutput}
                                </code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CodeReviewDialog;
