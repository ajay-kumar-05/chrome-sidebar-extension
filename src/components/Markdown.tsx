import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  children: string;
}

/**
 * Render assistant Markdown (headings, lists, tables, code, links, …) the way a
 * GitHub PR description preview would. Raw HTML is ignored by default, so this
 * is safe to feed untrusted model output.
 */
export default function Markdown({ children }: Props) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
