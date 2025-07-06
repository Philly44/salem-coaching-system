'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EvaluationResults from '@/components/EvaluationResults';

interface EvaluationResult {
  category: string;
  content: string;
}

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('Component mounted');
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + 2;
          }
          return prev;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading]);

  const handleEvaluate = async () => {
    console.log('handleEvaluate called, transcript:', transcript);
    
    if (!transcript.trim()) {
      console.log('Transcript is empty, returning');
      return;
    }

    console.log('Starting evaluation...');
    setLoading(true);
    setError('');
    setProgress(0);

    try {
      console.log('Making API call to /api/evaluate');
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to evaluate transcript');
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      setProgress(100);

      setTimeout(() => {
        // DEBUG: Check data structure
        console.log('Data structure:', JSON.stringify(data, null, 2));
        console.log('Data type:', typeof data);
        console.log('Is array?', Array.isArray(data));

        // Convert object to array format expected by EvaluationResults - REMOVED OVERVIEW
        const resultsArray = [
          { category: 'Title', content: data.title },
          { category: 'Most Impactful Statement', content: data.impactfulStatement },
          { category: 'Interview Scorecard', content: data.scorecard },
          { category: 'Talk/Listen Ratio Analysis', content: data.talkListenRatio },
          { category: 'Application Invitation Assessment', content: data.applicationInvitation },
          { category: 'Weekly Growth Plan', content: data.growthPlan },
          { category: 'Coaching Notes', content: data.coachingNotes }
        ].filter(item => item.content); // Remove any undefined entries

        console.log('Converted results array:', resultsArray);
        setResults(resultsArray);
        setLoading(false);
        console.log('Results set, loading complete');
      }, 500);

    } catch (err) {
      console.error('Error in handleEvaluate:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Instant Replay</h1>
          <p className="text-gray-600">Salem University</p>
        </div>

        {!results.length && (
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
            <div className="mb-6">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder=""
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 text-gray-900 placeholder-gray-400"
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleEvaluate}
              disabled={!transcript.trim() || loading}
              className="w-full bg-transparent hover:bg-transparent disabled:bg-transparent py-2 px-2 transition-all duration-200 transform hover:scale-110 disabled:scale-100 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-gray-900"></div>
              ) : (
                <Image
                  src="/tiger.png"
                  alt="Salem Tiger"
                  width={120}
                  height={120}
                  className="cursor-pointer"
                />
              )}
            </button>

            {loading && (
              <div className="mt-6">
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: '#00B140'
                    }}
                  ></div>
                </div>
                <p className="text-center mt-2 text-gray-600">Processing transcript... {progress}%</p>
              </div>
            )}
          </div>
        )}

        {results.length > 0 && (
          <>
            <button
              onClick={() => {
                setResults([]);
                setTranscript('');
                setError('');
                setProgress(0);
              }}
              className="mb-6 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← New Evaluation
            </button>
            <EvaluationResults results={results} transcript={transcript} />
          </>
        )}
      </div>
    </main>
  );
}