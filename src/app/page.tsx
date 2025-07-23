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
    // Component mounted
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
    if (!transcript.trim()) {
      return;
    }
    setLoading(true);
    setError('');
    setProgress(0);
    setResults([]); // Clear previous results

    try {
      // Try streaming endpoint first
      let response = await fetch('/api/evaluate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      // Check response status
      
      // If streaming endpoint fails, fall back to regular endpoint
      if (response.status === 404) {
        // Streaming endpoint not found, fall back to regular API
        response = await fetch('/api/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript }),
        });
        
        // Handle non-streaming response
        if (!response.ok) {
          throw new Error('Failed to evaluate transcript');
        }
        
        const data = await response.json();
        
        // Array of creative phrases for the impactful statement
        const impactfulPhrases = [
          "We Both Stopped and Said \"That Was Incredible\"",
          "The Moment We Looked at Each Other Like \"Did You Hear That?\"",
          "When We Were Both Blown Away by What You Said",
          "That Part Where We Literally High-Fived About Your Response",
          "The Moment We Both Knew You Absolutely Crushed It",
          "When We Texted Each Other \"This Advisor Gets It!\"",
          "That Exchange That Made Us So Proud of You",
          "The Part Where We Were Like \"Yes! This Is Why They're Amazing\"",
          "When We Both Agreed This Was Pure Gold",
          "The Moment We Wanted to Call You Right Away to Say \"Wow\"",
          "That Time We Both Said \"Now THAT'S How It's Done\"",
          "When We Couldn't Stop Talking About How Good This Was",
          "The Part That Made Us Remember Why We Love What You Do",
          "That Beautiful Moment When We Were Just So Impressed",
          "When We Both Felt Lucky to Have You on the Team",
          "The Exchange That Had Us Taking Notes for Others",
          "That Part Where We Were Like \"Everyone Needs to Hear This\"",
          "When We Both Agreed You Just Set the Bar Higher",
          "The Moment We Knew We Had to Share This With Everyone",
          "That Time You Made Us Both Believers in What's Possible",
          "When We Replayed This Part Three Times Because It Was So Good",
          "The Moment We Both Said \"This Is Exactly What We Train For\"",
          "That Part Where We Wanted to Use This as a Training Example",
          "When We Both Felt That Electric Moment of Connection",
          "The Exchange Where We Saw Your Natural Talent Shine Through",
          "That Time We Were Like \"Did They Really Just Say That? Amazing!\"",
          "When We Both Recognized This as a Masterclass Moment",
          "The Part That Made Us Want to Celebrate Your Win",
          "That Moment We Knew the Student's Life Just Changed",
          "When We Both Saw You Turn Everything Around",
          "The Part Where We Were Genuinely Moved by Your Approach",
          "That Exchange That Reminded Us Why This Work Matters",
          "When We Both Said \"That's the Kind of Advisor We Need\"",
          "The Moment We Realized You Just Taught Us Something",
          "That Part Where Your Authenticity Just Radiated Through",
          "When We Were Like \"This Is Why They're One of Our Best\"",
          "The Exchange That Made Us Want to Clone You",
          "That Time You Made Complex Things Sound So Simple",
          "When We Both Noticed How Naturally You Built Trust",
          "The Part Where We Saw Years of Experience Pay Off",
          "That Moment When Everything Just Clicked Perfectly",
          "When We Both Felt the Energy Shift in the Best Way",
          "The Exchange Where You Turned Nervous Into Excited",
          "That Part That Had Us Nodding Along With You",
          "When We Recognized This as Your Signature Move",
          "The Moment We Knew This Student Was in Perfect Hands",
          "That Time You Made Us Remember Our Own Why",
          "When We Both Said \"That Right There Is the Magic\"",
          "The Part Where Your Confidence Became Their Confidence",
          "That Beautiful Exchange Where Everything Just Flowed"
        ];
        
        // Select a random phrase for this evaluation
        const randomPhrase = impactfulPhrases[Math.floor(Math.random() * impactfulPhrases.length)];
        
        // Convert to streaming-like updates
        console.log('Raw evaluation data:', data);
        
        const resultsArray = [
          { category: 'Title', content: data.title },
          { category: randomPhrase, content: data.impactfulStatement },
          { category: 'Interview Scorecard', content: data.scorecard },
          { category: 'Enrollment Likelihood', content: data.enrollmentLikelihood },
          { category: 'Talk/Listen Ratio Analysis', content: data.talkListenRatio },
          { category: 'Application Invitation Assessment', content: data.applicationInvitation },
          { category: 'Weekly Growth Plan', content: data.growthPlan },
          { category: 'Coaching Notes', content: data.coachingNotes },
          { category: 'Email After Interview, Same Day', content: data.emailBlast }
        ];
        
        console.log('Results before filtering:', resultsArray);
        console.log('Email content:', data.emailBlast);
        
        // Only filter out truly empty content (not just whitespace)
        const filteredResults = resultsArray.filter(item => {
          // Keep items that have content or error messages
          if (!item.content) return false;
          if (typeof item.content !== 'string') return true;
          // Keep error messages
          if (item.content.startsWith('Error:')) return true;
          // Keep non-empty content
          return item.content.trim().length > 0;
        });
        
        console.log('Results after filtering:', filteredResults);
        
        // CRITICAL: Log if we're missing expected sections
        const expectedSections = ['Coaching Notes', 'Email After Interview, Same Day'];
        for (const section of expectedSections) {
          const found = filteredResults.some(r => r.category === section);
          if (!found) {
            console.error(`WARNING: Missing section "${section}" after filtering!`);
          }
        }
        
        // Simulate streaming updates
        for (let i = 0; i < filteredResults.length; i++) {
          setResults(prev => [...prev, filteredResults[i]]);
          setProgress(((i + 1) / resultsArray.length) * 100);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to evaluate transcript');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep incomplete message in buffer
        
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const data = JSON.parse(message.slice(6));
              
              if (data.type === 'progress') {
                // Update progress based on actual completion
                const progressPercent = (data.completed / data.total) * 100;
                setProgress(progressPercent);
              } else if (data.type === 'result') {
                // Store result at its correct index to maintain order
                setResults(prev => {
                  // Create array with 9 slots if empty (we have 9 evaluations now)
                  const newResults = prev.length === 0 ? new Array(9).fill(null) : [...prev];
                  
                  // Use the index from the API to maintain correct order
                  if (data.index !== undefined && data.index < 9) {
                    newResults[data.index] = {
                      category: data.category,
                      content: data.content
                    };
                    
                    // Log email section specifically
                    if (data.key === 'emailBlast' || data.category === 'Email After Interview, Same Day') {
                      console.log(`EMAIL SECTION RECEIVED: index=${data.index}, content length=${data.content?.length}`);
                    }
                  }
                  
                  // Return array maintaining all positions
                  return newResults;
                });
                
                // Update progress
                const progressPercent = (data.completed / data.total) * 100;
                setProgress(progressPercent);
                
                // Show joke answer at 75% progress
                if (progressPercent >= 75 && !showAnswer) {
                  setShowAnswer(true);
                }
              } else if (data.type === 'error') {
                // Error in evaluation category - log it and potentially show placeholder
                console.error('Evaluation error:', data);
                
                // If it's the email section, add a placeholder
                if (data.key === 'emailBlast' && data.index !== undefined) {
                  setResults(prev => {
                    const newResults = prev.length === 0 ? new Array(9).fill(null) : [...prev];
                    newResults[data.index] = {
                      category: data.category || 'Email After Interview, Same Day',
                      content: `Error: ${data.error || 'Failed to generate content'}`
                    };
                    return newResults;
                  });
                }
              } else if (data.type === 'complete') {
                // Evaluation complete
                setProgress(100);
                
                // Log completion details
                if (data.missingKeys && data.missingKeys.length > 0) {
                  console.error('WARNING: Missing sections after completion:', data.missingKeys);
                }
                
                // Clean up any null entries after completion
                setResults(prev => {
                  const filtered = prev.filter(Boolean);
                  console.log('Final results after completion:', filtered.map(r => ({ 
                    category: r.category, 
                    hasContent: !!r.content 
                  })));
                  return filtered;
                });
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Error parsing SSE message - continue
            }
          }
        }
      }

      setLoading(false);

    } catch (err) {
      // Handle evaluation error
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Salem Coaching System</h1>
          <p className="text-gray-600">Salem University</p>
        </div>

        {!results.length && !loading && (
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
            <div className="mb-6">
              <textarea
                id="interview-transcript"
                name="interview-transcript"
                aria-label="Interview transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your interview transcript here..."
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
              <Image
                src="/tiger.png"
                alt="Salem Tiger"
                width={120}
                height={120}
                style={{ width: 'auto', height: 'auto' }}
                className="cursor-pointer transition-opacity duration-1000"
              />
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 mb-4">
                <Image 
                  src="/images/tiger.png" 
                  alt="Loading"
                  width={96}
                  height={96}
                  style={{ width: 'auto', height: 'auto' }}
                  className="tiger-throb"
                />
              </div>
              
              {currentJoke && (
                <div className="text-center min-h-[60px] mb-4">
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
          </div>
        )}


        {results.length > 0 && (
          <>
            {!loading && (
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
            )}
            <EvaluationResults results={results} transcript={transcript} />
          </>
        )}
      </div>
    </main>
  );
}