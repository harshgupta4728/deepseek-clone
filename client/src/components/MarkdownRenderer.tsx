import React from 'react';
import ReactMarkdown from 'react-markdown';
import  SyntaxHighlighter  from 'react-syntax-highlighter';
import  oneDark  from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const components: Components = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const code = String(children).replace(/\n$/, '');
      const isCopied = copiedCode === code;
      const isInline = !match;

      if (isInline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props}>
            {children}
          </code>
        );
      }

      return (
        <div className="relative group">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => copyToClipboard(code)}
              className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
              title="Copy code"
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
                      <SyntaxHighlighter
              style={oneDark}
              language={match?.[1] || 'text'}
              PreTag="div"
              className="rounded-lg"
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.875rem',
              }}
             
            >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    },
    pre({ children, ...props }) {
      return <pre {...props}>{children}</pre>;
    },
    table({ children, ...props }) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
            {children}
          </table>
        </div>
      );
    },
    th({ children, ...props }) {
      return (
        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left bg-gray-100 dark:bg-gray-700 font-semibold" {...props}>
          {children}
        </th>
      );
    },
    td({ children, ...props }) {
      return (
        <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left" {...props}>
          {children}
        </td>
      );
    },
    blockquote({ children, ...props }) {
      return (
        <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props}>
          {children}
        </blockquote>
      );
    },
    a({ children, href, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <ReactMarkdown
      className="markdown prose prose-sm dark:prose-invert max-w-none"
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
