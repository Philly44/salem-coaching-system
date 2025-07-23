// src/components/EvaluationResults.tsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Mail, MessageSquare, FileText } from 'lucide-react';
import { generateSMSFromResults, generateThreePartSMS } from '@/utils/smsGenerator';
import { generatePlainTextEmail } from '@/utils/emailTextVersions';
import type { EvaluationResult } from '@/types/evaluation';

interface EvaluationResultsProps {
  results: EvaluationResult[];
  transcript: string;
}

export default function EvaluationResults({ results }: EvaluationResultsProps) {      
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Find key results for SMS generation
  const emailResult = results.find(r => r && r.category === 'Email After Interview, Same Day');
  const impactfulResult = results.find(r => r && (r.category.includes('"') || r.category.includes('That ') || r.category.includes('When ')));
  const titleResult = results.find(r => r && r.category === 'Title');
  
  // Extract title content and remove markdown bold markers
  const titleContent = titleResult?.content.replace(/\*\*/g, '') || '';

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
    <div>
      {/* Display Title as a header, not as a card */}
      {titleContent && (
        <div className="mb-8 text-center">
          <h1 className="text-lg font-semibold text-gray-800">
            {titleContent}
          </h1>
        </div>
      )}
      
      {/* Display all other results as cards */}
      <div className="space-y-6">
        {results.filter(result => result && result.category !== 'Title').map((result, index) => {
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
        } else if (result.category === 'Email After Interview, Same Day') {
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
          
          
          // Clean up any trailing markdown artifacts
          strategy1Content = strategy1Content.replace(/\*+\s*$/, '').trim();
          strategy2Content = strategy2Content.replace(/\*+\s*$/, '').trim();
          
          
          return (
            <div key={index}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{result.category}</h2>
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
        const isFollowUpEmail = result.category === 'Email After Interview, Same Day';
        
        // Special handling for email with multiple copy options
        if (isFollowUpEmail) {
          // Generate SMS from available data
          const smsMessage = generateSMSFromResults(
            result.content,
            impactfulResult?.content || '',
            titleResult?.content || ''
          );
          const threePartSMS = generateThreePartSMS(
            result.content,
            impactfulResult?.content || '',
            titleResult?.content || ''
          );
          const plainTextEmail = generatePlainTextEmail(cleanedContent);
          
          return (
            <div 
              key={index} 
              className="rounded-xl shadow-lg p-6 animate-fade-in bg-green-100 shadow-green-200/30"
              style={{ 
                animationDelay: `${index * 100}ms`,
                boxShadow: '0 2px 10px 0 rgba(34, 197, 94, 0.15)'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-gray-900 text-xl">
                  Momentum Email
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
              
              {/* Email Content - Keep original formatting */}
              <div className="prose prose-gray max-w-none mb-6">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({children}: {children?: React.ReactNode}) => <p className="mb-4 leading-relaxed">{children}</p>,
                    br: () => <br className="my-2" />
                  }}
                >
                  {/* Convert single line breaks to double for proper paragraph spacing */}
                  {result.content.replace(/\n(?!\n)/g, '\n\n')}
                </ReactMarkdown>
              </div>
              
              {/* SMS Options - presented as separate cards */}
              <div className="space-y-4">
                  
                  {/* Quick SMS - Single Message Block */}
                  <div className="mb-4 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">⚡ Lightning Touch (SMS)</h3>
                      <button
                        onClick={() => copyToClipboard(smsMessage, index * 10 + 3)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index * 10 + 3 ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-700">{smsMessage}</p>
                  </div>
                  
                  {/* 3-Part SMS Sequence Block */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">🔥 Text Trifecta (SMS)</h3>
                      <button
                        onClick={() => copyToClipboard(threePartSMS.join('\n\n'), index * 10 + 7)}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index * 10 + 7 ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded-lg">
{threePartSMS.join('\n\n')}
                      </pre>
                    </div>
                  </div>
              </div>
            </div>
          );
        }
        
        // Special handling for Great Moment (impactful statement)
        if (isImpactfulStatement) {
          // Remove the "## Great Moment" header if it exists
          let processedContent = cleanedContent;
          processedContent = processedContent.replace(/^##\s*Great Moment\s*\n/gm, '');
          processedContent = processedContent.replace(/^Great Moment\s*\n/gm, '');
          
          // First, let's clean up any markdown bold markers that might be causing duplication
          processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '$1');
          
          // Parse the content to extract the quote, timestamp, and explanation
          const lines = processedContent.split('\n').filter(line => line.trim());
          
          // Find the quote line (contains 💫 and quotes)
          let quoteLine = lines.find(line => line.includes('💫') && line.includes('"'));
          
          // Clean the quote - remove extra emoji
          if (quoteLine) {
            quoteLine = quoteLine.replace(/💫\s*💫/, '💫'); // Remove duplicate emoji
            quoteLine = quoteLine.trim();
          }
          
          // Find the timestamp/description line
          let timestampLine = null;
          let explanationLines = [];
          
          // Process remaining lines after quote
          const quoteIndex = quoteLine ? lines.indexOf(quoteLine) : -1;
          const remainingLines = quoteIndex >= 0 ? lines.slice(quoteIndex + 1) : lines;
          
          // Look for timestamp line and collect explanation
          for (const line of remainingLines) {
            if (line.match(/^\[[\d:]+\]/) && !timestampLine) {
              timestampLine = line;
            } else if (line.toLowerCase().includes('this moment') || 
                      line.toLowerCase().includes('this quote') ||
                      line.toLowerCase().includes('the advisor') ||
                      line.trim().startsWith('•') ||
                      line.trim().startsWith('-')) {
              explanationLines.push(line);
            }
          }
          
          return (
            <div 
              key={index} 
              className="rounded-xl shadow-lg p-6 animate-fade-in bg-amber-100 shadow-amber-200/30 hover:shadow-amber-200/50 transition-all duration-300"
              style={{ 
                animationDelay: `${index * 100}ms`,
                boxShadow: '0 2px 10px 0 rgba(251, 191, 36, 0.15)'
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-gray-900 text-2xl md:text-3xl">
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
              <div className="space-y-4">
                {quoteLine && (
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <p className="text-gray-800 italic text-lg leading-relaxed">
                      {quoteLine.startsWith('💫') ? quoteLine : `💫 ${quoteLine}`}
                    </p>
                  </div>
                )}
                {timestampLine && (
                  <p className="text-gray-700">
                    {timestampLine}
                  </p>
                )}
                {explanationLines.length > 0 && (
                  <div className="space-y-2">
                    {explanationLines.map((line, i) => {
                      // Check if this line starts a bullet point
                      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                        return (
                          <p key={i} className="text-gray-700 ml-4">
                            • {line.replace(/^[-•]\s*/, '').trim()}
                          </p>
                        );
                      }
                      return <p key={i} className="text-gray-700">{line}</p>;
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        // Special handling for Interview Scorecard
        const isScorecard = result.category === 'Interview Scorecard';
        if (isScorecard) {
          return (
            <div 
              key={index} 
              className="rounded-xl shadow-lg p-6 animate-fade-in bg-white"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-bold text-gray-900 text-xl">Interview Scorecard</h2>
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
              <div className="prose prose-gray max-w-none scorecard-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }: { children?: React.ReactNode }) => (
                      <table className="w-full border-collapse mb-6">
                        {children}
                      </table>
                    ),
                    thead: ({ children }: { children?: React.ReactNode }) => (
                      <thead>
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }: { children?: React.ReactNode }) => (
                      <tbody>
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }: { children?: React.ReactNode }) => (
                      <tr className="border-b border-gray-200">
                        {children}
                      </tr>
                    ),
                    th: ({ children }: { children?: React.ReactNode }) => (
                      <th className="text-left py-2 px-3 bg-gray-50 font-semibold text-gray-900">
                        {children}
                      </th>
                    ),
                    td: ({ children }: { children?: React.ReactNode }) => (
                      <td className="py-2 px-3 text-gray-700">
                        {children}
                      </td>
                    ),
                    h1: ({ children }: { children?: React.ReactNode }) => (
                      <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>
                    ),
                    h2: ({ children }: { children?: React.ReactNode }) => (
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 mt-4">{children}</h2>
                    ),
                    h3: ({ children }: { children?: React.ReactNode }) => (
                      <h3 className="text-base font-medium text-gray-900 mb-2">{children}</h3>
                    ),
                    p: ({ children }: { children?: React.ReactNode }) => (
                      <p className="text-gray-700 mb-3">{children}</p>
                    ),
                    strong: ({ children }: { children?: React.ReactNode }) => (
                      <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    ul: ({ children }: { children?: React.ReactNode }) => (
                      <ul className="list-disc list-inside mb-3 text-gray-700">{children}</ul>
                    ),
                    li: ({ children }: { children?: React.ReactNode }) => (
                      <li className="mb-1">{children}</li>
                    ),
                  }}
                >
                  {cleanedContent}
                </ReactMarkdown>
              </div>
            </div>
          );
        }
        
        return (
          <div 
            key={index} 
            className="rounded-xl shadow-lg p-6 animate-fade-in bg-white"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-bold text-gray-900 text-xl">
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
    </div>
  );
}