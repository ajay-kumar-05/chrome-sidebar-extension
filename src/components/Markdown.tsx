import { isValidElement, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CopyIcon, CheckIcon } from './icons';

interface Props {
  children: string;
}

/** Recursively read the text content out of a React node tree. */
function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement(node)) return nodeText((node.props as { children?: ReactNode }).children);
  return '';
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="code-copy"
      title="Copy"
      aria-label="Copy code"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

/** A fenced code block with a language label and copy button. */
function PreBlock({ children }: { children?: ReactNode }) {
  const codeEl = Array.isArray(children) ? children[0] : children;
  const className = isValidElement(codeEl)
    ? ((codeEl.props as { className?: string }).className ?? '')
    : '';
  const lang = /language-(\w+)/.exec(className)?.[1] ?? '';
  const text = nodeText(children);

  return (
    <div className="code-block">
      <div className="code-bar">
        <span className="code-lang">{lang || 'code'}</span>
        <CopyButton text={text} />
      </div>
      <pre>{children}</pre>
    </div>
  );
}

/**
 * Render assistant Markdown (headings, lists, tables, code, links, …) the way a
 * GitHub PR description preview would. Raw HTML is ignored by default, so this
 * is safe to feed untrusted model output. Code fences get syntax highlighting
 * (rehype-highlight) plus a copy button.
 */
export default function Markdown({ children }: Props) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          pre: PreBlock,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
