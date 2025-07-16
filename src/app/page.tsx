'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import EvaluationResults from '@/components/EvaluationResults';

interface EvaluationResult {
  category: string;
  content: string;
}

// Hardcoded jokes for loading entertainment
const JOKES = [
  {
    question: "Why don't scientists trust atoms?",
    answer: "They make up everything!"
  },
  {
    question: "Why did the bicycle fall over?",
    answer: "It was two-tired!"
  },
  {
    question: "What do you call a fake noodle?",
    answer: "An impasta!"
  },
  {
    question: "Why don't eggs tell jokes?",
    answer: "They'd crack each other up!"
  },
  {
    question: "What do you call a bear with no teeth?",
    answer: "A gummy bear!"
  },
  {
    question: "Why did the scarecrow win an award?",
    answer: "He was outstanding in his field!"
  },
  {
    question: "What do you call a dinosaur that crashes his car?",
    answer: "Tyrannosaurus Wrecks!"
  },
  {
    question: "Why can't a bicycle stand up by itself?",
    answer: "It's two tired!"
  },
  {
    question: "What did the ocean say to the beach?",
    answer: "Nothing, it just waved!"
  },
  {
    question: "Why did the math book look so sad?",
    answer: "Because it had too many problems!"
  },
  {
    question: "What do you call cheese that isn't yours?",
    answer: "Nacho cheese!"
  },
  {
    question: "Why did the cookie go to the doctor?",
    answer: "Because it felt crumbly!"
  },
  {
    question: "What do you call a pile of cats?",
    answer: "A meowtain!"
  },
  {
    question: "Why did the coffee file a police report?",
    answer: "It got mugged!"
  },
  {
    question: "What's orange and sounds like a parrot?",
    answer: "A carrot!"
  },
  {
    question: "Why don't skeletons fight each other?",
    answer: "They don't have the guts!"
  },
  {
    question: "What did one wall say to the other wall?",
    answer: "I'll meet you at the corner!"
  },
  {
    question: "Why did the golfer bring two pairs of pants?",
    answer: "In case he got a hole in one!"
  },
  {
    question: "What do you call a factory that makes good products?",
    answer: "A satisfactory!"
  },
  {
    question: "Why did the picture go to jail?",
    answer: "Because it was framed!"
  },
  {
    question: "What do you call a can opener that doesn't work?",
    answer: "A can't opener!"
  },
  {
    question: "Why did the stadium get hot after the game?",
    answer: "All the fans left!"
  },
  {
    question: "What do you call a snowman with a six-pack?",
    answer: "An abdominal snowman!"
  },
  {
    question: "Why did the computer go to the doctor?",
    answer: "It had a virus!"
  },
  {
    question: "What's the best thing about Switzerland?",
    answer: "I don't know, but the flag is a big plus!"
  },
  {
    question: "Why don't oysters share?",
    answer: "Because they're shellfish!"
  },
  {
    question: "What do you call a sleeping bull?",
    answer: "A bulldozer!"
  },
  {
    question: "Why did the banana go to the doctor?",
    answer: "It wasn't peeling well!"
  },
  {
    question: "What do you call a boomerang that doesn't come back?",
    answer: "A stick!"
  },
  {
    question: "Why did the invisible man turn down the job offer?",
    answer: "He couldn't see himself doing it!"
  },
  {
    question: "What do you call a bear in the rain?",
    answer: "A drizzly bear!"
  },
  {
    question: "Why was the broom late?",
    answer: "It over-swept!"
  },
  {
    question: "What do you call a line of rabbits jumping backwards?",
    answer: "A receding hare-line!"
  },
  {
    question: "Why don't vampires go to barbecues?",
    answer: "They don't like steak!"
  },
  {
    question: "What did the grape say when it got stepped on?",
    answer: "Nothing, it just let out a little wine!"
  },
  {
    question: "Why did the belt get arrested?",
    answer: "For holding up a pair of pants!"
  },
  {
    question: "What do you call a fish wearing a crown?",
    answer: "A king fish!"
  },
  {
    question: "Why did the tomato turn red?",
    answer: "Because it saw the salad dressing!"
  },
  {
    question: "What do you call a parade of rabbits hopping backwards?",
    answer: "A receding hare-line!"
  },
  {
    question: "Why did the cookie cry?",
    answer: "Because his mom was a wafer so long!"
  },
  {
    question: "What do you call a factory that sells passable products?",
    answer: "A satisfactory!"
  },
  {
    question: "Why did the chicken go to the séance?",
    answer: "To talk to the other side!"
  },
  {
    question: "What do you call a lazy kangaroo?",
    answer: "A pouch potato!"
  },
  {
    question: "Why did the mushroom go to the party?",
    answer: "Because he was a fungi!"
  },
  {
    question: "What do you call a fish with no eyes?",
    answer: "Fsh!"
  },
  {
    question: "Why did the computer keep freezing?",
    answer: "It left its Windows open!"
  },
  {
    question: "What do you call a group of disorganized cats?",
    answer: "A cat-astrophe!"
  },
  {
    question: "Why did the student eat his homework?",
    answer: "Because the teacher said it was a piece of cake!"
  },
  {
    question: "What do you call an alligator in a vest?",
    answer: "An investigator!"
  },
  {
    question: "Why don't mountains ever get cold?",
    answer: "They wear snow caps!"
  },
  {
    question: "What did the janitor say when he jumped out of the closet?",
    answer: "Supplies!"
  },
  {
    question: "Why did the teddy bear say no to dessert?",
    answer: "Because she was stuffed!"
  },
  {
    question: "What do you call a dog magician?",
    answer: "A labracadabrador!"
  },
  {
    question: "Why did the gym close down?",
    answer: "It just didn't work out!"
  },
  {
    question: "What do you call a pencil with two erasers?",
    answer: "Pointless!"
  },
  {
    question: "Why did the clock go to the principal's office?",
    answer: "For tocking too much!"
  },
  {
    question: "What do you call a cow with no legs?",
    answer: "Ground beef!"
  },
  {
    question: "Why did the orange stop?",
    answer: "It ran out of juice!"
  },
  {
    question: "What do you call a bird that's afraid of heights?",
    answer: "A chicken!"
  },
  {
    question: "Why did the calendar feel depressed?",
    answer: "Its days were numbered!"
  },
  {
    question: "What do you call a shoe made of a banana?",
    answer: "A slipper!"
  },
  {
    question: "Why did the melon jump into the lake?",
    answer: "It wanted to be a water-melon!"
  },
  {
    question: "What do you call a broken can opener?",
    answer: "A can't opener!"
  },
  {
    question: "Why did the tree go to the dentist?",
    answer: "To get a root canal!"
  },
  {
    question: "What do you call a sad cup of coffee?",
    answer: "Depresso!"
  },
  {
    question: "Why did the book join the police?",
    answer: "He wanted to go undercover!"
  },
  {
    question: "What do you call a belt made of watches?",
    answer: "A waist of time!"
  },
  {
    question: "Why did the phone wear glasses?",
    answer: "Because it lost all its contacts!"
  },
  {
    question: "What do you call a dinosaur that loves pancakes?",
    answer: "A tri-syrup-tops!"
  },
  {
    question: "Why did the baker work so hard?",
    answer: "He kneaded the dough!"
  },
  {
    question: "What do you call a pig that does karate?",
    answer: "A pork chop!"
  },
  {
    question: "Why did the painting go to jail?",
    answer: "It was framed!"
  },
  {
    question: "What do you call a magical dog?",
    answer: "A labracadabrador!"
  },
  {
    question: "Why did the ghost go to the party?",
    answer: "For the boos!"
  },
  {
    question: "What do you call a bear caught in the rain?",
    answer: "A drizzly bear!"
  },
  {
    question: "Why did the rubber band go to the gym?",
    answer: "To get stretched!"
  },
  {
    question: "What do you call a sheep with no legs?",
    answer: "A cloud!"
  },
  {
    question: "Why did the pencil go to the party?",
    answer: "To draw a crowd!"
  },
  {
    question: "What do you call a cow that plays an instrument?",
    answer: "A moo-sician!"
  },
  {
    question: "Why did the blanket go to the doctor?",
    answer: "It had a cover-up!"
  },
  {
    question: "What do you call a fish that needs help with his voice?",
    answer: "Auto-tuna!"
  },
  {
    question: "Why did the donut go to the dentist?",
    answer: "To get a filling!"
  },
  {
    question: "What do you call a train carrying bubblegum?",
    answer: "A chew-chew train!"
  },
  {
    question: "Why did the computer go to therapy?",
    answer: "It had too many bytes!"
  },
  {
    question: "What do you call a sleeping pizza?",
    answer: "A PIZZZZa!"
  },
  {
    question: "Why did the baseball player get arrested?",
    answer: "For stealing second base!"
  },
  {
    question: "What do you call a sad strawberry?",
    answer: "A blueberry!"
  },
  {
    question: "Why did the light bulb fail his test?",
    answer: "He wasn't too bright!"
  },
  {
    question: "What do you call a nervous javelin thrower?",
    answer: "Shakespeare!"
  },
  {
    question: "Why did the scissors go to school?",
    answer: "To get sharp!"
  },
  {
    question: "What do you call a boat that's afraid of the water?",
    answer: "A nervous wreck!"
  },
  {
    question: "Why did the robot go on a diet?",
    answer: "He had a byte problem!"
  },
  {
    question: "What do you call a lazy bull?",
    answer: "A bulldozer!"
  },
  {
    question: "Why did the grape stop in the middle of the road?",
    answer: "Because it ran out of juice!"
  },
  {
    question: "What do you call a duck that gets all A's?",
    answer: "A wise quacker!"
  },
  {
    question: "Why did the mirror go to school?",
    answer: "To get a reflection!"
  },
  {
    question: "What do you call a frozen dog?",
    answer: "A pupsicle!"
  },
  {
    question: "Why did the paper go to the gym?",
    answer: "To get ripped!"
  },
  {
    question: "What do you call a happy mushroom?",
    answer: "A fun-gi!"
  }
];

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentJoke, setCurrentJoke] = useState<{question: string, answer: string} | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showJokeQuestion, setShowJokeQuestion] = useState(false);

  useEffect(() => {
    console.log('Component mounted');
  }, []);

  useEffect(() => {
    if (loading) {
      // Pick a random joke when loading starts
      const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
      setCurrentJoke(randomJoke);
      setShowAnswer(false);
      setShowJokeQuestion(false);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          // Show joke question at 25%
          if (prev >= 25 && !showJokeQuestion) {
            setShowJokeQuestion(true);
          }
          // Show answer at 75%
          if (prev >= 75) {
            setShowAnswer(true);
          }
          
          // More realistic progression for ~25 second API calls
          if (prev < 40) {
            return prev + 5; // 0-40% in ~2.4 seconds (fast start)
          } else if (prev < 70) {
            return prev + 2; // 40-70% in ~4.5 seconds
          } else if (prev < 85) {
            return prev + 0.8; // 70-85% in ~5.6 seconds
          } else if (prev < 95) {
            return prev + 0.4; // 85-95% in ~7.5 seconds
          } else if (prev < 98) {
            return prev + 0.1; // 95-98% in ~9 seconds (very slow)
          }
          return prev; // Stay at 98% until actual completion
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
      setCurrentJoke(null);
      setShowAnswer(false);
      setShowJokeQuestion(false);
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
      
      // Smooth transition to 100%
      setProgress(prev => {
        const steps = 10;
        const increment = (100 - prev) / steps;
        
        for (let i = 1; i <= steps; i++) {
          setTimeout(() => {
            setProgress(current => Math.min(current + increment, 100));
          }, i * 50); // 50ms between each update
        }
        
        return prev; // Return current value for now
      });

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
          { category: 'Coaching Notes', content: data.coachingNotes },
          { category: 'Follow-up Email', content: data.emailBlast }
        ].filter(item => item.content); // Remove any undefined entries


        console.log('Converted results array:', resultsArray);
        setResults(resultsArray);
        setLoading(false);
        console.log('Results set, loading complete');
      }, 800); // Increased delay to allow progress bar to complete smoothly

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
                <div className="relative h-24 w-24">
                  <Image 
                    src="/images/tiger.png" 
                    alt="Loading"
                    width={96}
                    height={96}
                    className="tiger-throb"
                  />
                </div>
              ) : (
                <Image
                  src="/tiger.png"
                  alt="Salem Tiger"
                  width={120}
                  height={120}
                  className="cursor-pointer transition-opacity duration-1000"
                />
              )}
            </button>

            {loading && (
              <div className="mt-3">
                {currentJoke && (
                  <div className="text-center min-h-[60px]">
                    {showJokeQuestion && (
                      <p className="text-lg font-semibold text-gray-800 mb-1 animate-fade-in">
                        {currentJoke.question}
                      </p>
                    )}
                    {showAnswer && (
                      <p className="text-lg text-green-600 animate-fade-in">
                        {currentJoke.answer}
                      </p>
                    )}
                  </div>
                )}
                <div className="w-72 mx-auto bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="h-full transition-all duration-200 ease-out rounded-full relative overflow-hidden"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #00B140 0%, #00D150 50%, #00B140 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s ease-in-out infinite',
                      boxShadow: '0 0 20px rgba(0, 177, 64, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                    }}
                  ></div>
                </div>
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
                setShowAnswer(false);
                setShowJokeQuestion(false);
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