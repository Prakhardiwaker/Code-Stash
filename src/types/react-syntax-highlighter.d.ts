declare module "react-syntax-highlighter" {
  import * as React from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: { [key: string]: React.CSSProperties };
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    startingLineNumber?: number;
    lineProps?: (lineNumber: number) => React.HTMLAttributes<HTMLDivElement>;
    children?: React.ReactNode;
    customStyle?: React.CSSProperties;
  }

  const SyntaxHighlighter: React.FC<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

declare module "react-syntax-highlighter/dist/esm/styles/hljs";
declare module "react-syntax-highlighter/dist/esm/styles/prism";
