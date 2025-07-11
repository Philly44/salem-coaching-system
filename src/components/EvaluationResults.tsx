// src/components/EvaluationResults.tsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface EvaluationResult {
  category: string;
  content: string;
}

interface EvaluationResultsProps {
  results: EvaluationResult[];
  transcript: string;
}

export default function EvaluationResults({ results }: EvaluationResultsProps) {      
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Function to remove duplicate heading from content
  const removeDuplicateHeading = (content: string, category: string): string => {     
    // Escape special regex characters in the category name
    const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex patterns to match the category as a markdown heading
    const patterns = [
      new RegExp(`^#\\s+${escapedCategory}\\s*\\n`, 'i'),
      new RegExp(`^##\\s+${escapedCategory}\\s*\\n`, 'i'),
      new RegExp(`^###\\s+${escapedCategory}\\s*\\n`, 'i'),
      new RegExp(`^####\\s+${escapedCategory}\\s*\\n`, 'i'),
      new RegExp(`^#####\\s+${escapedCategory}\\s*\\n`, 'i'),
      new RegExp(`^######\\s+${escapedCategory}\\s*\\n`, 'i'),
      new RegExp(`^${escapedCategory}\\s*\\n={3,}\\s*\\n`, 'i'),
      new RegExp(`^${escapedCategory}\\s*\\n-{3,}\\s*\\n`, 'i'),
    ];

    let cleanedContent = content.trim();

    // Check each pattern and remove if found at the start
    for (const pattern of patterns) {
      if (pattern.test(cleanedContent)) {
        cleanedContent = cleanedContent.replace(pattern, '');
        break;
      }
    }

    // For Coaching Notes, also check for duplicate heading after initial text        
    if (category === 'Coaching Notes') {
      // Remove standalone "Coaching Notes" on its own line anywhere in the content
      cleanedContent = cleanedContent.replace(/^Coaching Notes\s*$/gm, '');

      // Remove the introductory line pattern
      cleanedContent = cleanedContent.replace(/^Here are encouraging[^:]+:\s*\n*/i, '');

      // Also remove with markdown formatting
      const middlePatterns = [
        /^#\s+Coaching Notes\s*$/gmi,
        /^##\s+Coaching Notes\s*$/gmi,
        /^###\s+Coaching Notes\s*$/gmi,
        /^####\s+Coaching Notes\s*$/gmi,
        /^#####\s+Coaching Notes\s*$/gmi,
        /^######\s+Coaching Notes\s*$/gmi,
        /^Coaching Notes\s*\n={3,}\s*$/gmi,
        /^Coaching Notes\s*\n-{3,}\s*$/gmi,
      ];

      for (const pattern of middlePatterns) {
        cleanedContent = cleanedContent.replace(pattern, '');
      }

      // Clean up any resulting double line breaks
      cleanedContent = cleanedContent.replace(/\n\n\n+/g, '\n\n');
    }

    return cleanedContent;
  };

  // Function to extract only table content from markdown
  const extractTableOnly = (content: string): string => {
    // First, remove any duplicate heading
    const cleanedContent = removeDuplicateHeading(content, 'Talk/Listen Ratio Analysis');

    // Look for markdown table patterns
    const lines = cleanedContent.split('\n');
    const tableLines: string[] = [];
    let tableStarted = false;

    for (const line of lines) {
      // Check if line is part of a table (contains pipes)
      if (line.includes('|')) {
        tableStarted = true;
        tableLines.push(line);
      } else if (tableStarted && line.trim() === '') {
        // Empty line after table, stop collecting
        break;
      } else if (tableStarted && !line.includes('|')) {
        // Non-table content after table started, stop collecting
        break;
      }
    }

    // If we found a table, return just the table
    if (tableLines.length > 0) {
      return tableLines.join('\n');
    }

    // If no table found, return the original content
    return cleanedContent;
  };

  return (
    <div className="space-y-6">
      {results.map((result, index) => {
        // Special handling for Talk/Listen Ratio Analysis
        const isTalkListenRatio = result.category === 'Talk/Listen Ratio Analysis';   
        // Special handling for Weekly Growth Plan
        const isWeeklyGrowthPlan = result.category === 'Weekly Growth Plan';

        // Clean the content appropriately
        let cleanedContent;
        if (isTalkListenRatio) {
          cleanedContent = extractTableOnly(result.content);
        } else if (isWeeklyGrowthPlan) {
          // For Weekly Growth Plan, extract only the strategies
          const cleaned = removeDuplicateHeading(result.content, result.category);    

          // Find where Strategy #1 starts
          const strategyStartPattern = /Strategy\s*#?\s*1:/i;
          const strategyMatch = cleaned.match(strategyStartPattern);

          if (strategyMatch && strategyMatch.index !== undefined) {
            // Start from Strategy #1
            const strategyContent = cleaned.substring(strategyMatch.index);

            // Then cut off at end markers (but not "Based on" since that's at the beginning)
            const endMarkers = ['This plan was generated because:', 'Rationale:', 'Let me', 'The focus', 'In summary'];
            let cutoffIndex = strategyContent.length;

            for (const marker of endMarkers) {
              const markerIndex = strategyContent.indexOf(marker);
              if (markerIndex > 0 && markerIndex < cutoffIndex) {
                cutoffIndex = markerIndex;
              }
            }

            cleanedContent = strategyContent.substring(0, cutoffIndex).trim();        
          } else {
            // Fallback if no Strategy #1 found - just show cleaned content
            cleanedContent = cleaned;
          }
        } else if (result.category === 'Follow-up Email') {
          // Special handling for email content
          const cleaned = removeDuplicateHeading(result.content, result.category);
          
          // Extract subject line and body
          const subjectMatch = cleaned.match(/Subject:\s*(.+?)(?:\n|$)/i);
          const bodyMatch = cleaned.match(/(?:Subject:.+?\n\n?)([\s\S]+)/i);
          
          if (subjectMatch && bodyMatch) {
            // Format as proper email display
            cleanedContent = `**Subject:** ${subjectMatch[1]}\n\n---\n\n${bodyMatch[1].trim()}`;
          } else {
            cleanedContent = cleaned;
          }
        } else {
          cleanedContent = removeDuplicateHeading(result.content, result.category);
        }
        return (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{result.category}</h2> 
              <button
                onClick={() => copyToClipboard(result.content, index)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                title="Copy to clipboard"
              >
                {copiedIndex === index ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ children }: { children?: React.ReactNode }) => (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }: { children?: React.ReactNode }) => (
                    <thead className="bg-gray-50">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }: { children?: React.ReactNode }) => (
                    <tbody className="bg-white divide-y divide-gray-200">
                      {children}
                    </tbody>
                  ),
                  th: ({ children }: { children?: React.ReactNode }) => (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }: { children?: React.ReactNode }) => (
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {children}
                    </td>
                  ),
                  h1: ({ children }: { children?: React.ReactNode }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>
                  ),
                  h2: ({ children }: { children?: React.ReactNode }) => (
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>
                  ),
                  h3: ({ children }: { children?: React.ReactNode }) => (
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{children}</h3>
                  ),
                  p: ({ children }: { children?: React.ReactNode }) => (
                    <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>  
                  ),
                  ul: ({ children }: { children?: React.ReactNode }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>
                  ),
                  ol: ({ children }: { children?: React.ReactNode }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>
                  ),
                  li: ({ children }: { children?: React.ReactNode }) => (
                    <li className="text-gray-700">{children}</li>
                  ),
                  strong: ({ children }: { children?: React.ReactNode }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }: { children?: React.ReactNode }) => (
                    <em className="italic text-gray-700">{children}</em>
                  ),
                  blockquote: ({ children }: { children?: React.ReactNode }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }: { children?: React.ReactNode }) => (
                    <code className="bg-gray-100 rounded px-1 py-0.5 text-sm text-gray-800">{children}</code>
                  ),
                  pre: ({ children }: { children?: React.ReactNode }) => (
                    <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto mb-4"> 
                      {children}
                    </pre>
                  ),
                  hr: () => null, // Remove horizontal rules
                }}
              >
                {cleanedContent}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}