"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import SnippetLoadingSkeleton from "./_components/SnippetLoadingSkeleton";
import NavigationHeader from "@/components/NavigationHeader";
import { Clock, Code, MessageSquare, Sparkles, User, Lock } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import CopyButton from "./_components/CopyButton";
import Comments from "./_components/Comments";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ConvexHttpClient } from "convex/browser";
import { useUser } from "@clerk/nextjs";
import CodeReviewDialog from "@/app/(root)/_components/CodeReviewDialog";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

function SnippetDetailPage() {
  const { user } = useUser();
  const [isProUser, setIsProUser] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingPro, setIsLoadingPro] = useState(false);
  const [isCodeReviewDialogOpen, setIsCodeReviewDialogOpen] = useState(false);
  const { language, editor } = useCodeEditorStore();

  const getCurrentCode = () => {
    return editor?.getValue() || "";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const convex = new ConvexHttpClient(
          process.env.NEXT_PUBLIC_CONVEX_URL!
        );

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

  const handleCodeReview = () => {
    if (!isProUser) {
      alert(
        "Code Review is a Pro feature. Please upgrade your plan to access this functionality."
      );
      return;
    }
    setIsCodeReviewDialogOpen(true);
  };

  const snippetId = useParams().id;

  const snippet = useQuery(api.snippets.getSnippetById, {
    snippetId: snippetId as Id<"snippets">,
  });
  const comments = useQuery(api.snippets.getComments, {
    snippetId: snippetId as Id<"snippets">,
  });

  if (snippet === undefined) return <SnippetLoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-[#ffffff08] p-2.5">
                  <Image
                    src={`/${snippet.language}.png`}
                    alt={`${snippet.language} logo`}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                    {snippet.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#8b8b8d]">
                      <User className="w-4 h-4" />
                      <span>{snippet.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8b8b8d]">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(snippet._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8b8b8d]">
                      <MessageSquare className="w-4 h-4" />
                      <span>{comments?.length} comments</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1.5 bg-[#ffffff08] text-[#808086] rounded-lg text-sm font-medium">
                {snippet.language}
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="mb-8 rounded-2xl overflow-hidden border border-[#ffffff0a] bg-[#121218]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#ffffff0a]">
              <div className="flex items-center gap-2 text-[#808086]">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">Source Code</span>
              </div>

              {/* Buttons aligned together */}
              <div className="flex items-center gap-3">
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

                <CopyButton code={snippet.code} />
              </div>
            </div>

            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[snippet.language].monacoLanguage}
              value={snippet.code}
              theme="vs-dark"
              beforeMount={defineMonacoThemes}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                readOnly: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
              }}
            />
          </div>

          <Comments snippetId={snippet._id} />
        </div>
      </main>
      <CodeReviewDialog
        isOpen={isCodeReviewDialogOpen}
        onClose={() => setIsCodeReviewDialogOpen(false)}
        code={getCurrentCode() || snippet.code} // fallback to stored snippet code
        language={language || snippet.language} // fallback to stored snippet language
      />
    </div>
  );
}
export default SnippetDetailPage;
