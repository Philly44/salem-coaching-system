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
    let cleanedContent = removeDuplicateHeading(content, 'Talk/Listen Ratio Analysis');
    
    // Look for markdown table patterns
    const lines = cleanedContent.split('\n');
    let tableLines: string[] = [];
    let inTable = false;
    let tableStarted = false;
    
    for (const line of lines) {
      // Check if line is part of a table (contains pipes)
      if (line.includes('|')) {
        inTable = true;
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

  // Function to extract only strategy points from Weekly Growth Plan
  const extractStrategiesOnly = (content: string): string => {
    // First, remove any duplicate heading
    let cleanedContent = removeDuplicateHeading(content, 'Weekly Growth Plan');
    
    // Debug: Log the content we're trying to parse
    console.log('Weekly Growth Plan raw content:', cleanedContent.substring(0, 200));
    
    // If content is empty or too short, return empty
    if (!cleanedContent || cleanedContent.trim().length < 10) {
      console.log('Weekly Growth Plan content is empty or too short');
      return '';
    }
    
    // More flexible strategy patterns
    const strategyPatterns = [
      /^Strategy\s*#?\s*\d+\s*:/im,
      /^Strategy\s+\w+\s*:/im,
      /^\d+\.\s*Strategy/im,
      /^#\s*Strategy/im,
      /^-\s*Strategy/im,
      /^\*\s*Strategy/im
    ];
    
    // Check if content contains any strategy pattern
    const hasStrategy = strategyPatterns.some(pattern => pattern.test(cleanedContent));
    
    if (!hasStrategy) {
      console.log('No strategy patterns found in content');
      // If no clear strategy markers, but content exists, return the whole content
      // This ensures something displays rather than empty
      return cleanedContent;
    }
    
    // Initialize array to hold strategies
    const extractedStrategies: string[] = [];
    
    // Split content into lines for processing
    const lines = cleanedContent.split('\n');
    let currentStrategy: string[] = [];
    let inStrategy = false;
    let strategyNumber = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line starts a strategy (more flexible matching)
      const isStrategyStart = strategyPatterns.some(pattern => pattern.test(line));
      
      if (isStrategyStart) {
        // Save previous strategy if exists
        if (inStrategy && currentStrategy.length > 0) {
          extractedStrategies.push(currentStrategy.join('\n').trim());
        }
        
        // Start new strategy
        strategyNumber++;
        currentStrategy = [line];
        inStrategy = true;
        
        // Only collect first 2 strategies
        if (strategyNumber > 2) {
          break;
        }
      } else if (inStrategy) {
        // Check if we've hit a section that ends the strategy
        const endPatterns = [
          /^Strategy\s*#/i,  // Another strategy
          /^Section\s+/i,    // Section marker
          /^Rationale:/i,    // Rationale section - MUST NOT INCLUDE
          /^Let me/i,        // Analysis text
          /^Based on/i,      // Analysis text
          /^The focus/i,     // Summary text
          /^\s*Performance/i, // Performance sections
          /^-{3,}$/,         // Horizontal rules
          /^={3,}$/          // Horizontal rules
        ];
        
        // Check if this line matches any end pattern
        const shouldEnd = endPatterns.some(pattern => pattern.test(line));
        
        if (shouldEnd) {
          // End current strategy
          if (currentStrategy.length > 0) {
            extractedStrategies.push(currentStrategy.join('\n').trim());
          }
          inStrategy = false;
          currentStrategy = [];
          
          // If we hit rationale or other end markers, stop processing entirely
          if (/^Rationale:/i.test(line) || /^The focus/i.test(line)) {
            break;
          }
        } else {
          // Add line to current strategy (including empty lines for formatting)
          currentStrategy.push(line);
        }
      }
    }
    
    // Don't forget the last strategy if still in progress
    if (inStrategy && currentStrategy.length > 0 && strategyNumber <= 2) {
      extractedStrategies.push(currentStrategy.join('\n').trim());
    }
    
    console.log(`Found ${extractedStrategies.length} strategies`);
    
    // Return only the first two strategies
    return extractedStrategies.slice(0, 2).join('\n\n');
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
            let strategyContent = cleaned.substring(strategyMatch.index);
            
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
                  table: ({ children }) => (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-50">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="bg-white divide-y divide-gray-200">
                      {children}
                    </tbody>
                  ),
                  th: ({ children }) => (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {children}
                    </td>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-700">{children}</em>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 rounded px-1 py-0.5 text-sm text-gray-800">{children}</code>
                  ),
                  pre: ({ children }) => (
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