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
    question: "I asked if I could major in dad jokes.",
    answer: "My advisor said, 'We'll humor you.'"
  },
  {
    question: "I asked if I could pay my fees in pennies.",
    answer: "The advisor said, 'That makes no cents.'"
  },
  {
    question: "I asked if my application looked good.",
    answer: "The advisor said, 'With open enrollment, they all look good to us!'"
  },
  {
    question: "I asked if my dog could attend classes with me.",
    answer: "The advisor said, 'Sorry, no pets allowed—we already have too many eager puppies in freshman year!'"
  },
  {
    question: "I asked if there was a dress code.",
    answer: "My advisor said, 'Yes, clothes are generally required.'"
  },
  {
    question: "I asked if there was a shortcut to graduation.",
    answer: "My advisor said, 'Yes, it's called attending classes.'"
  },
  {
    question: "I asked my advisor for the secret to college success.",
    answer: "They whispered, 'Attending class,' like it was classified information."
  },
  {
    question: "I asked my advisor if college would be hard.",
    answer: "They said, 'It's not about hard or easy—it's about finding what works for you.' I said, 'That's exactly what my hairstylist said.'"
  },
  {
    question: "I asked my advisor if I needed test scores for admission.",
    answer: "They said, 'With open enrollment, the only test is showing up!'"
  },
  {
    question: "I asked my advisor if I needed to be smart to succeed.",
    answer: "They said, 'No, just smart enough to ask for help when you need it.'"
  },
  {
    question: "I asked my advisor if they liked puns.",
    answer: "They said, 'Only if they're class-y.'"
  },
  {
    question: "I told my advisor I wanted to take a class on ice cream making.",
    answer: "They said that was a sweet choice!"
  },
  {
    question: "I told my advisor I was anxious about starting college.",
    answer: "They said, 'Don't worry, that feeling is universally accepted.'"
  },
  {
    question: "I told my advisor I was worried about making friends.",
    answer: "They said, 'Don't worry, you're already friendly with financial aid.'"
  },
  {
    question: "I tried to make a joke about financial aid,",
    answer: "but my advisor said that wasn't very fund-ny."
  },
  {
    question: "My advisor asked what interests me.",
    answer: "I said, 'Low tuition rates,' and they high-fived me."
  },
  {
    question: "My advisor asked why I applied.",
    answer: "I said, 'College seemed like a bright idea—now I'm en-light-ened.'"
  },
  {
    question: "My advisor congratulated me on being accepted.",
    answer: "I said, 'That's the first time my procrastination has been rewarded.'"
  },
  {
    question: "My advisor said college is about finding yourself.",
    answer: "I asked, 'What if I prefer the old me?'"
  },
  {
    question: "My advisor said I was now part of the college family.",
    answer: "I asked, 'Does that mean I can borrow money without returning it?'"
  },
  {
    question: "My advisor said my future looks bright.",
    answer: "I asked if they could tone down the optimism—I forgot my sunglasses."
  },
  {
    question: "My advisor said to prepare for my future.",
    answer: "I said, 'I can barely prepare breakfast.'"
  },
  {
    question: "My advisor said, 'Congratulations on enrolling!'",
    answer: "I said, 'Thanks, I really applied myself.'"
  },
  {
    question: "My advisor told me college would open doors.",
    answer: "I asked if I needed to bring my own doorstop."
  },
  {
    question: "My advisor told me to follow my passion.",
    answer: "I said, 'My passion is napping, so I'm heading to the library.'"
  },
  {
    question: "My advisor told me to pace myself.",
    answer: "I said, 'I'm more of a sprinter than a marathon runner.'"
  },
  {
    question: "My advisor told me to think outside the box.",
    answer: "I said, 'Is that why the dorm rooms are so small?'"
  },
  {
    question: "The admissions advisor tried to tell me a joke about enrollment statistics,",
    answer: "but there was no point."
  },
  {
    question: "The advisor asked about my career goals.",
    answer: "I said, 'To make enough money to pay off the career I'm about to start.'"
  },
  {
    question: "The advisor asked what motivated me to pursue education.",
    answer: "I said, 'My mom found my Xbox.'"
  },
  {
    question: "The advisor said I should focus on my strengths.",
    answer: "I told them I could lift a couch by myself, and they said, 'Maybe focus on academic strengths.'"
  },
  {
    question: "The advisor said I'd need a student ID.",
    answer: "I asked if they'd accept my 'World's Best Napper' certificate instead."
  },
  {
    question: "The advisor said, 'College is a time of discovery.'",
    answer: "I replied, 'I hope I discover where all my tuition money went.'"
  },
  {
    question: "The advisor said, 'Welcome to college!'",
    answer: "I said, 'That's the most accepting thing anyone's ever said to me.'"
  },
  {
    question: "The advisor said, 'Your academic future is in your hands.'",
    answer: "I replied, 'That explains the sweaty palms.'"
  },
  {
    question: "The advisor said, 'Your educational journey begins now!'",
    answer: "I said, 'That's a relief. The parking journey was exhausting.'"
  },
  {
    question: "The advisor told me open enrollment means everyone gets in.",
    answer: "I said, 'That's the most inclusive thing I've heard since my group hug attempt failed.'"
  },
  {
    question: "The advisor told me open enrollment was as easy as ABC.",
    answer: "I said, 'That's the most basic thing I've heard all day.'"
  },
  {
    question: "What did the advisor call the enrollment process?",
    answer: "A formality, not a for-manatee—those are completely different!"
  },
  {
    question: "What did the advisor say about choosing classes?",
    answer: "'Choose wisely—unlike your Netflix decisions at 2 AM.'"
  },
  {
    question: "What did the advisor say about student orientation?",
    answer: "'It's where we help you get your degree... of comfort on campus!'"
  },
  {
    question: "What did the advisor say to the indecisive student?",
    answer: "'Don't worry, our door is always open... literally, it's open enrollment!'"
  },
  {
    question: "What did the advisor say when I asked about classroom sizes?",
    answer: "'They're just right—not too big, not too small, just like Goldilocks' perfect porridge!'"
  },
  {
    question: "What did the advisor say when I couldn't decide on a major?",
    answer: "'Don't worry, un-decision is the first step to the right decision.'"
  },
  {
    question: "What did the advisor say when I finished my application?",
    answer: "'Con-grad-ulations on taking the first step!'"
  },
  {
    question: "What did the advisor say when I submitted my form?",
    answer: "'This is a form-idable start to your education!'"
  },
  {
    question: "What do admissions advisors eat for breakfast?",
    answer: "Enrollment O's!"
  },
  {
    question: "What do you call an admissions advisor on a bicycle?",
    answer: "A cycle-logical supporter!"
  },
  {
    question: "What do you call an admissions advisor who loves coffee?",
    answer: "A brew-tiful helper!"
  },
  {
    question: "What do you call an admissions advisor with a cold?",
    answer: "Full of good ad-vice!"
  },
  {
    question: "What's an advisor's favorite kind of music?",
    answer: "Enroll and rock!"
  },
  {
    question: "What's an advisor's favorite movie genre?",
    answer: "Coming-of-age stories with happy endings!"
  },
  {
    question: "What's an advisor's favorite part of the job?",
    answer: "Watching students succeed—no joke there, just truth!"
  },
  {
    question: "What's an advisor's favorite season?",
    answer: "Fall... and spring, and summer enrollment!"
  },
  {
    question: "What's the difference between an advisor and a GPS?",
    answer: "The advisor cares if you reach your destination!"
  },
  {
    question: "Why are admissions advisors so good at math?",
    answer: "They're always calculating student success!"
  },
  {
    question: "Why did the admissions advisor become a meteorologist?",
    answer: "They were already experts at predicting bright futures!"
  },
  {
    question: "Why did the advisor always carry a map?",
    answer: "To help students find their way to class and through life!"
  },
  {
    question: "Why did the advisor always smile?",
    answer: "It's impossible to frown when you're helping dreams come true!"
  },
  {
    question: "Why did the advisor become a gardener?",
    answer: "They enjoyed watching students grow!"
  },
  {
    question: "Why did the advisor bring a ladder to the enrollment fair?",
    answer: "To help students reach their highest potential!"
  },
  {
    question: "Why did the advisor bring a ladder to work?",
    answer: "To help students climb the ladder of success!"
  },
  {
    question: "Why did the advisor bring a mirror to work?",
    answer: "To help students reflect on their goals!"
  },
  {
    question: "Why did the advisor bring seeds to orientation?",
    answer: "To plant the idea that education helps you grow!"
  },
  {
    question: "Why did the advisor carry a compass?",
    answer: "To help students find their true north!"
  },
  {
    question: "Why did the advisor carry a flashlight?",
    answer: "To spotlight student potential!"
  },
  {
    question: "Why did the advisor carry a pencil?",
    answer: "To help students draft their futures!"
  },
  {
    question: "Why did the advisor wear a cape?",
    answer: "They're super at helping students!"
  },
  {
    question: "Why did the advisor win an award?",
    answer: "They really raised the bar for student support!"
  },
  {
    question: "Why did the transcript get a job as a comedian?",
    answer: "It had a lot of class!"
  },
  {
    question: "Why do advisors make great comedians?",
    answer: "They know how to deliver life-changing punchlines!"
  },
  {
    question: "Why do advisors make great DJs?",
    answer: "They know how to drop knowledge!"
  },
  {
    question: "Why don't admissions advisors ever get angry?",
    answer: "They practice acceptance daily!"
  },
  {
    question: "Why don't admissions advisors ever get lost?",
    answer: "They're always giving directions to others!"
  },
  {
    question: "Why don't admissions advisors use GPS?",
    answer: "They already know all the paths to success!"
  },
  {
    question: "Why don't advisors tell scary stories?",
    answer: "They're too busy creating happy endings!"
  },
  {
    question: "Why was the admissions advisor so good at gardening?",
    answer: "They specialized in helping students plant their futures!"
  },
  {
    question: "Why was the advisor so good at social media?",
    answer: "They were always helping students follow their dreams!"
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

  useEffect(() => {
    console.log('Component mounted');
  }, []);

  useEffect(() => {
    if (loading) {
      // Pick a random joke when loading starts
      const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
      setCurrentJoke(randomJoke);
      setShowAnswer(false);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          // Show answer at 90%
          if (prev >= 90) {
            setShowAnswer(true);
          }
          
          // Smooth progression: faster at start, slower near end
          if (prev < 60) {
            return prev + 3; // 3% every 300ms until 60%
          } else if (prev < 80) {
            return prev + 2; // 2% every 300ms until 80%
          } else if (prev < 95) {
            return prev + 1; // 1% every 300ms until 95%
          } else if (prev < 99) {
            return prev + 0.5; // 0.5% every 300ms until 99%
          }
          return prev; // Stay at 99% until actual completion
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
      setCurrentJoke(null);
      setShowAnswer(false);
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
                {currentJoke && (
                  <div className="mb-4 text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      {currentJoke.question}
                    </p>
                    {showAnswer && (
                      <p className="text-lg text-green-600 animate-fade-in">
                        {currentJoke.answer}
                      </p>
                    )}
                  </div>
                )}
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