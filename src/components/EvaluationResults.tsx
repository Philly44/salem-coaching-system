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

    // Remove common AI preambles first (applies to all categories)
    const aiPreamblePatterns = [
      /^Here are \d+ paragraphs? of[^:]+:\s*\n*/i,
      /^Here (?:are|is)[^:]+:\s*\n*/i,
      /^I've (?:created|generated|prepared)[^:]+:\s*\n*/i,
      /^Based on[^,]+, here[^:]+:\s*\n*/i,
    ];
    
    for (const pattern of aiPreamblePatterns) {
      cleanedContent = cleanedContent.replace(pattern, '');
    }

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

      // Remove the introductory line patterns
      cleanedContent = cleanedContent.replace(/^Here are encouraging[^:]+:\s*\n*/i, '');
      cleanedContent = cleanedContent.replace(/^Here are \d+ paragraphs? of encouraging[^:]+:\s*\n*/i, '');

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
      {results.filter(Boolean).map((result, index) => {
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
            cleanedContent = cleaned.substring(strategyMatch.index);
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
        
        
        // Special handling for Weekly Growth Plan - render as two separate cards
        if (isWeeklyGrowthPlan) {
          // Use the original content to ensure nothing is lost
          const fullContent = result.content;
          
          // Find both strategies in the original content with improved regex
          // Look for Strategy 2 first to find the split point
          const strategy2StartMatch = fullContent.match(/Strategy\s*#?\s*2:/i);
          let strategy1Content = '';
          let strategy2Content = '';
          
          if (strategy2StartMatch && strategy2StartMatch.index) {
            // Extract Strategy 1 (everything before Strategy 2)
            const strategy1Part = fullContent.substring(0, strategy2StartMatch.index);
            const strategy1Match = strategy1Part.match(/Strategy\s*#?\s*1:\s*([\s\S]*)/i);
            if (strategy1Match && strategy1Match[1]) {
              strategy1Content = strategy1Match[1].trim();
            }
            
            // Extract Strategy 2 (everything after Strategy 2:)
            const strategy2Part = fullContent.substring(strategy2StartMatch.index);
            const strategy2Match = strategy2Part.match(/Strategy\s*#?\s*2:\s*([\s\S]*)/i);
            if (strategy2Match && strategy2Match[1]) {
              strategy2Content = strategy2Match[1].trim();
            }
          } else {
            // Fallback: try original regex approach
            const strategy1Match = fullContent.match(/Strategy\s*#?\s*1:\s*([\s\S]*?)(?=Strategy\s*#?\s*2:|$)/i);
            const strategy2Match = fullContent.match(/Strategy\s*#?\s*2:\s*([\s\S]*?)$/i);
            
            if (strategy1Match && strategy1Match[1]) {
              strategy1Content = strategy1Match[1].trim();
            }
            
            if (strategy2Match && strategy2Match[1]) {
              strategy2Content = strategy2Match[1].trim();
            }
          }
          
          // If the regex approach didn't work, fall back to the split method
          if (!strategy1Content && !strategy2Content) {
            const strategies = cleanedContent.split(/(?=Strategy\s*#?\s*2:)/i);
            
            if (strategies.length >= 1) {
              const strategy1Full = strategies[0];
              strategy1Content = strategy1Full.replace(/^Strategy\s*#?\s*1:\s*/i, '').trim();
            }
            
            if (strategies.length >= 2) {
              const strategy2Full = strategies[1];
              strategy2Content = strategy2Full.replace(/^Strategy\s*#?\s*2:\s*/i, '').trim();
            }
          }
          
          // Debug logging to identify truncation
          console.log('Weekly Growth Plan - Full content length:', fullContent.length);
          console.log('Strategy 1 length:', strategy1Content.length);
          console.log('Strategy 2 length:', strategy2Content.length);
          
          // Clean up any trailing markdown artifacts
          strategy1Content = strategy1Content.replace(/\*+\s*$/, '').trim();
          strategy2Content = strategy2Content.replace(/\*+\s*$/, '').trim();
          
          // Check if content appears truncated
          const lastChars = strategy2Content.slice(-50);
          if (!lastChars.match(/[.!?]\s*$/)) {
            console.warn('Strategy 2 may be truncated - does not end with punctuation:', lastChars);
          }
          
          return (
            <div key={index}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{result.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Strategy 1 Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 min-h-full animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Strategy #1</h3>
                    <button
                      onClick={() => copyToClipboard(`Strategy #1: ${strategy1Content}`, index * 2)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index * 2 ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="prose prose-gray max-w-none break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {strategy1Content}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* Strategy 2 Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 min-h-full animate-fade-in" style={{ animationDelay: `${index * 100 + 150}ms` }}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Strategy #2</h3>
                    <button
                      onClick={() => copyToClipboard(`Strategy #2: ${strategy2Content}`, index * 2 + 1)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index * 2 + 1 ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="prose prose-gray max-w-none break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {strategy2Content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Check if this is the impactful statement (has quotes or specific phrases)
        const isImpactfulStatement = result.category.includes('"') || 
          result.category.includes('That ') || 
          result.category.includes('When ') ||
          result.category.includes('The Moment') ||
          result.category.includes('The Exchange') ||
          result.category.includes('The Part');
        
        // Check if this is the follow-up email
        const isFollowUpEmail = result.category === 'Follow-up Email';
        
        return (
          <div 
            key={index} 
            className={`rounded-xl shadow-lg p-6 animate-fade-in ${
              isImpactfulStatement 
                ? 'bg-amber-100 shadow-amber-200/30 hover:shadow-amber-200/50 transition-all duration-300' 
                : isFollowUpEmail
                ? 'bg-green-100 shadow-green-200/30'
                : 'bg-white'
            }`}
            style={{ 
              animationDelay: `${index * 100}ms`,
              ...(isImpactfulStatement && {
                boxShadow: '0 2px 10px 0 rgba(251, 191, 36, 0.15)'
              }),
              ...(isFollowUpEmail && {
                boxShadow: '0 2px 10px 0 rgba(34, 197, 94, 0.15)'
              })
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className={`font-bold text-gray-900 ${isImpactfulStatement ? 'text-2xl md:text-3xl' : 'text-2xl'}`}>
                {isImpactfulStatement && (
                  <span className="inline-block mr-2 text-amber-500">✨</span>
                )}
                {isFollowUpEmail && (
                  <span className="inline-block mr-2 text-green-600">✉️</span>
                )}
                {result.category}
              </h2> 
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