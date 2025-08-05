import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-base font-semibold my-1" {...props} />,
        p: ({node, ...props}) => <p className="mb-2" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
        li: ({node, ...props}) => <li className="mb-1" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
        a: ({node, ...props}) => <a className="text-primary-600 hover:underline" {...props} />,
        code: (props) => {
            const { className, children, ...rest } = props as any;
            
            return (
                <pre className="bg-gray-800 text-white p-2 rounded-md my-2 overflow-x-auto">
                    <code className={className} {...rest}>
                        {children}
                    </code>
                </pre>
            );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
