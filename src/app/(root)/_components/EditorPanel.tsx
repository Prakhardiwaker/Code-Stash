"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  RotateCcwIcon,
  ShareIcon,
  TypeIcon,
  Sparkles,
  Lock,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { EditorPanelSkeleton } from "./EditorPanelSkeleton";
import useMounted from "@/hooks/useMounted";
import ShareSnippetDialog from "./ShareSnippetDialog";
import CodeReviewDialog from "./CodeReviewDialog";
import { api } from "../../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

function EditorPanel() {
  const clerk = useClerk();
  const { user } = useUser();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCodeReviewDialogOpen, setIsCodeReviewDialogOpen] = useState(false);
  const { language, theme, fontSize, editor, setFontSize, setEditor } =
    useCodeEditorStore();
  const [isProUser, setIsProUser] = useState(false);
  const [isLoadingPro, setIsLoadingPro] = useState(false);

  const mounted = useMounted();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const convex = new ConvexHttpClient(
          process.env.NEXT_PUBLIC_CONVEX_URL!
        );

        // we already have `user` from useUser()
        if (!user?.id) {
          setIsProUser(false);
          return;
        }

        const convexUser = await convex.query(api.users.getUser, {
          userId: user.id,
        });

        setIsProUser(!!convexUser?.isPro);
      } catch (err) {
        console.error("Failed to fetch convex user:", err);
        setIsProUser(false);
      } finally {
        setIsLoadingPro(false);
      }
    };

    fetchUser();
  }, [user?.id]);

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(newCode);
  }, [language, editor]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  // Add custom scrollbar styles when component mounts
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Monaco Editor Custom Scrollbar Styles */
      .monaco-editor .monaco-scrollable-element > .scrollbar > .slider {
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 4px !important;
      }
      
      .monaco-editor .monaco-scrollable-element > .scrollbar > .slider:hover {
        background: rgba(255, 255, 255, 0.2) !important;
      }
      
      .monaco-editor .monaco-scrollable-element > .scrollbar > .slider.active {
        background: rgba(255, 255, 255, 0.3) !important;
      }
      
      .monaco-editor .monaco-scrollable-element > .scrollbar {
        background: rgba(18, 18, 26, 0.5) !important;
      }
      
      .monaco-editor .monaco-scrollable-element .scrollbar.vertical {
        background: transparent !important;
        width: 12px !important;
      }
      
      .monaco-editor .monaco-scrollable-element .scrollbar.horizontal {
        background: transparent !important;
        height: 12px !important;
      }

      /* Webkit scrollbar styles as fallback */
      .monaco-editor ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
        background: transparent;
      }
      
      .monaco-editor ::-webkit-scrollbar-track {
        background: rgba(18, 18, 26, 0.3);
        border-radius: 4px;
      }
      
      .monaco-editor ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: content-box;
      }
      
      .monaco-editor ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
        background-clip: content-box;
      }
      
      .monaco-editor ::-webkit-scrollbar-thumb:active {
        background: rgba(255, 255, 255, 0.3);
        background-clip: content-box;
      }

      .monaco-editor ::-webkit-scrollbar-corner {
        background: rgba(18, 18, 26, 0.3);
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value) localStorage.setItem(`editor-code-${language}`, value);
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

  const handleCodeReview = () => {
    if (!isProUser) {
      // You might want to show an upgrade modal instead
      alert(
        "Code Review is a Pro feature. Please upgrade your plan to access this functionality."
      );
      return;
    }
    setIsCodeReviewDialogOpen(true);
  };

  const getCurrentCode = () => {
    return editor?.getValue() || "";
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image
                src={"/" + language + ".png"}
                alt="Logo"
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">
                Write and execute your code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Font Size Slider */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) =>
                    handleFontSizeChange(parseInt(e.target.value))
                  }
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer accent-blue-500"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>

            {/* Code Review Button */}
            <motion.button
              whileHover={{ scale: isProUser ? 1.02 : 1 }}
              whileTap={{ scale: isProUser ? 0.98 : 1 }}
              onClick={handleCodeReview}
              disabled={!isProUser}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isProUser
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 opacity-90 hover:opacity-100 text-white"
                  : "bg-[#1e1e2e] text-gray-500 cursor-not-allowed"
              }`}
              title={
                isProUser
                  ? "Get AI code review"
                  : "Upgrade to Pro to use Code Review"
              }
            >
              {isProUser ? (
                <Sparkles className="size-4" />
              ) : (
                <Lock className="size-4" />
              )}
              <span className="text-sm font-medium">Code Review</span>
              {!isProUser && (
                <span className="text-xs bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                  PRO
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsShareDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
            >
              <ShareIcon className="size-4 text-white" />
              <span className="text-sm font-medium text-white ">Share</span>
            </motion.button>
          </div>
        </div>

        {/* Editor  */}
        <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded && (
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={(editor) => setEditor(editor)}
              options={{
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                renderLineHighlight: "all",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                  useShadows: false,
                  vertical: "visible",
                  horizontal: "visible",
                  verticalSliderSize: 12,
                  horizontalSliderSize: 12,
                },
              }}
            />
          )}

          {!clerk.loaded && <EditorPanelSkeleton />}
        </div>
      </div>

      {/* Dialogs */}
      {isShareDialogOpen && (
        <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
      )}

      <CodeReviewDialog
        isOpen={isCodeReviewDialogOpen}
        onClose={() => setIsCodeReviewDialogOpen(false)}
        code={getCurrentCode()}
        language={language}
      />
    </div>
  );
}
export default EditorPanel;
