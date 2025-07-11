import { ACADEMIC_CALENDAR, getNextStartDate, getRegistrationDeadline, getFinancialAidDeadline, getProgramStartMonths } from '../data/academicCalendar';
import { generateDeterministicFAQs, validateFAQInputs, FAQGenerationData, ScorecardData } from './deterministicFaqGenerator';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

// Generate an inspiring quote based on what the student mentioned
export function generateMotivationalQuote(transcript: string, studentName: string, programInterest: string): string {
  const firstName = studentName.split(' ')[0];
  
  // Look for key phrases in transcript
  const transcriptLower = transcript.toLowerCase();
  
  // Parent-related quotes
  if (transcriptLower.includes('kids') || transcriptLower.includes('children') || transcriptLower.includes('parent')) {
    if (transcriptLower.includes('role model')) {
      return `${firstName}, your children are watching you chase your dreams - and that's the greatest lesson you can teach them.`;
    }
    return `${firstName}, pursuing your education while raising a family shows your children that it's never too late to reach for your dreams.`;
  }
  
  // Career change quotes
  if (transcriptLower.includes('career change') || transcriptLower.includes('new career')) {
    return `${firstName}, your courage to start a new chapter proves that your best days are ahead of you.`;
  }
  
  // Age-related quotes
  if (transcriptLower.includes('my age') || transcriptLower.includes('too old') || transcriptLower.includes('years old')) {
    return `${firstName}, your life experience isn't a barrier - it's your superpower in the classroom.`;
  }
  
  // Dream/goal quotes
  if (transcriptLower.includes('always wanted') || transcriptLower.includes('dream')) {
    return `${firstName}, the dream you've carried all these years is about to become your reality.`;
  }
  
  // Time/schedule quotes
  if (transcriptLower.includes('busy') || transcriptLower.includes('time') || transcriptLower.includes('schedule')) {
    return `${firstName}, you're not finding time for your education - you're making time for your future.`;
  }
  
  // Financial/better life quotes
  if (transcriptLower.includes('better life') || transcriptLower.includes('financial')) {
    return `${firstName}, investing in your education today is building the foundation for your family's tomorrow.`;
  }
  
  // Default inspirational quote based on program
  if (programInterest.toLowerCase().includes('nursing') || programInterest.toLowerCase().includes('healthcare')) {
    return `${firstName}, the world needs compassionate healers like you - your journey starts now.`;
  }
  
  if (programInterest.toLowerCase().includes('business')) {
    return `${firstName}, great leaders aren't born, they're made - and you're in the making.`;
  }
  
  if (programInterest.toLowerCase().includes('criminal justice') || programInterest.toLowerCase().includes('law')) {
    return `${firstName}, your passion for justice is the first step toward making a real difference.`;
  }
  
  // Generic but powerful default
  return `${firstName}, you're not just earning a degree - you're becoming the person you were meant to be.`;
}

// Generate calendar-based FAQ questions following the style guide
export function generateCalendarBasedQuestions(programInterest: string, studentContext: any): FAQItem[] {
  const questions: FAQItem[] = [];
  const nextStart = getNextStartDate();
  
  // Style guide: Keep answers conversational, specific, and action-oriented
  // Always include specific dates, deadlines, and next steps
  
  if (nextStart) {
    const startDate = new Date(nextStart.date);
    const registrationDeadline = getRegistrationDeadline(nextStart.term);
    const financialAidDates = getFinancialAidDeadline(nextStart.term);
    
    // Format dates consistently
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    
    // Question 1: Program start date with urgency
    const programMonths = getProgramStartMonths(programInterest);
    const monthsList = programMonths.length > 6 ? 'every month' : programMonths.join(', ');
    questions.push({
      question: `When exactly can I start the ${programInterest} program?`,
      answer: `The ${programInterest} program starts ${monthsList}! The next ${nextStart.term} begins ${formatDate(nextStart.date)}. ${registrationDeadline ? `To secure your spot, complete registration by ${formatDate(registrationDeadline)}.` : ''} We'll help you get everything ready.`
    });
    
    // Question 2: Financial aid with specific deadlines
    if (financialAidDates) {
      questions.push({
        question: 'What financial aid deadlines do I need to know?',
        answer: `For ${nextStart.term}: Submit FAFSA by ${formatDate(financialAidDates.fafsa)} and scholarship applications by ${formatDate(financialAidDates.scholarship)}. Our team will walk you through each step!`
      });
    }
    
    // Question 3: Holiday/break schedule
    const term = ACADEMIC_CALENDAR.terms.find(t => t.name === nextStart.term);
    if (term && term.breaks.length > 0) {
      const breakInfo = term.breaks[0];
      questions.push({
        question: `Are there any breaks during ${nextStart.term}?`,
        answer: `Yes! ${breakInfo.name} runs from ${formatDate(breakInfo.startDate)} to ${formatDate(breakInfo.endDate)}. Perfect time to catch up or get ahead on assignments.`
      });
    }
    
    // Question 4: Payment options with calendar context
    questions.push({
      question: 'When do I need to pay tuition?',
      answer: `Tuition is due by ${registrationDeadline ? formatDate(registrationDeadline) : 'registration deadline'}, but don't worry! We offer interest-free payment plans starting at $100/month. Set up takes just minutes.`
    });
    
    // Question 5: Course schedule format
    questions.push({
      question: `How long is each course in the ${programInterest} program?`,
      answer: `Each course runs for 8 weeks. In ${nextStart.term} (${formatDate(nextStart.date)} - ${formatDate(term?.endDate || nextStart.date)}), you'll complete 2 courses, one at a time. Perfect for balancing life and education!`
    });
    
    // Question 6: Next steps with timeline
    const daysUntilStart = Math.floor((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    questions.push({
      question: 'What should I do right now to get started?',
      answer: `With ${daysUntilStart} days until ${nextStart.term} starts, here's your action plan: 1) Apply today (8 minutes online), 2) Connect with financial aid this week, 3) Register for your first course by ${registrationDeadline ? formatDate(registrationDeadline) : 'the deadline'}. I'll guide you through each step!`
    });
  }
  
  return questions;
}

export function extractQuestionsFromTranscript(
  transcript: string, 
  studentName?: string, 
  programName?: string,
  scorecardData?: ScorecardData
): FAQSection[] {
  const sections: FAQSection[] = [];
  
  // If we have scorecard data, use deterministic FAQ generation
  if (studentName && programName && scorecardData) {
    const faqData: FAQGenerationData = {
      studentName,
      programName,
      transcript,
      scorecardData
    };
    
    // Validate inputs
    const validationError = validateFAQInputs(faqData);
    if (validationError) {
      console.error('FAQ validation error:', validationError);
      // Fall back to original logic
    } else {
      // Generate deterministic FAQs
      const deterministicFAQs = generateDeterministicFAQs(faqData);
      
      // Convert to FAQ sections format
      sections.push({
        title: 'Personalized Questions Based on Your Conversation',
        items: deterministicFAQs
      });
      
      return sections;
    }
  }
  
  // Original logic as fallback
  // First, extract actual questions the student asked
  const studentQuestions: string[] = [];
  const lines = transcript.split('\n');
  
  lines.forEach(line => {
    // Look for lines that are questions (end with ?) and likely from student
    if (line.trim().endsWith('?') && !line.toLowerCase().includes('advisor:')) {
      studentQuestions.push(line.trim());
    }
  });
  
  // Financial Questions Pattern
  const financialPatterns = [
    { regex: /how much|cost|pay|afford|financial aid|tuition|fees/i, category: 'financial' },
    { regex: /scholarship|grant|loan|fafsa/i, category: 'financial' }
  ];
  
  // Schedule Questions Pattern
  const schedulePatterns = [
    { regex: /when.*start|begin|semester|class.*start/i, category: 'schedule' },
    { regex: /online|campus|in-person|hybrid/i, category: 'schedule' },
    { regex: /work.*while|balance.*work|part.*time|full.*time/i, category: 'schedule' }
  ];
  
  // Academic Questions Pattern
  const academicPatterns = [
    { regex: /credit|transfer|previous.*college|transcript/i, category: 'academic' },
    { regex: /prerequisite|requirement|need.*before/i, category: 'academic' },
    { regex: /degree|program|major|certificate/i, category: 'academic' }
  ];
  
  // Support Questions Pattern
  const supportPatterns = [
    { regex: /help|support|tutor|struggle|difficult/i, category: 'support' },
    { regex: /advisor|guidance|mentor/i, category: 'support' }
  ];
  
  // Extract questions based on patterns
  const detectedTopics = new Set<string>();
  
  lines.forEach(line => {
    financialPatterns.forEach(pattern => {
      if (pattern.regex.test(line) && !detectedTopics.has('financial')) {
        detectedTopics.add('financial');
      }
    });
    
    schedulePatterns.forEach(pattern => {
      if (pattern.regex.test(line) && !detectedTopics.has('schedule')) {
        detectedTopics.add('schedule');
      }
    });
    
    academicPatterns.forEach(pattern => {
      if (pattern.regex.test(line) && !detectedTopics.has('academic')) {
        detectedTopics.add('academic');
      }
    });
    
    supportPatterns.forEach(pattern => {
      if (pattern.regex.test(line) && !detectedTopics.has('support')) {
        detectedTopics.add('support');
      }
    });
  });
  
  // Build FAQ sections based on detected topics
  if (detectedTopics.has('financial')) {
    sections.push({
      title: 'Financial Information',
      items: [
        {
          question: 'What financial aid options are available?',
          answer: 'Federal aid (FAFSA), scholarships, payment plans starting at $100/month, and veteran benefits. Our team helps you maximize all available funding.'
        },
        {
          question: 'How do payment plans work?',
          answer: 'Spread tuition over the semester with no interest. Start as low as $100/month. Set up takes just minutes with our financial aid team.'
        }
      ]
    });
  }
  
  if (detectedTopics.has('schedule')) {
    sections.push({
      title: 'Schedule & Format Options',
      items: [
        {
          question: 'Can I work while attending classes?',
          answer: 'Yes! Evening, weekend, and online options fit your work schedule. 70% of our students work full-time while earning their degree.'
        },
        {
          question: 'What class formats are available?',
          answer: 'Online (log in anytime), on-campus evenings, or hybrid. Complete assignments when it works for you - no mandatory login times.'
        }
      ]
    });
  }
  
  if (detectedTopics.has('academic')) {
    sections.push({
      title: 'Academic Requirements',
      items: [
        {
          question: 'Will my previous credits transfer?',
          answer: 'Yes! We accept credits from accredited schools. Free transcript review to maximize your transfers and save time/money.'
        },
        {
          question: 'What are the admission requirements?',
          answer: 'Just a high school diploma or GED. No SAT/ACT needed. Open enrollment means you can start your journey with us!'
        }
      ]
    });
  }
  
  if (detectedTopics.has('support')) {
    sections.push({
      title: 'Student Support Services',
      items: [
        {
          question: 'What support is available if I struggle?',
          answer: 'Free tutoring, writing help, math lab, 24/7 online resources. Your success coach checks in regularly to keep you on track.'
        },
        {
          question: 'How does academic advising work?',
          answer: 'One dedicated advisor from start to graduation. They help with course selection, career planning, and overcoming any challenges.'
        }
      ]
    });
  }
  
  // Add section for actual student questions if any were found
  if (studentQuestions.length > 0) {
    const unansweredItems: FAQItem[] = [];
    
    // Check if each student question was likely addressed
    studentQuestions.forEach(question => {
      const questionLower = question.toLowerCase();
      let wasAddressed = false;
      
      // Check if this question topic was covered in detected topics
      if (questionLower.includes('cost') || questionLower.includes('pay') || questionLower.includes('afford')) {
        wasAddressed = detectedTopics.has('financial');
      } else if (questionLower.includes('when') || questionLower.includes('start') || questionLower.includes('online')) {
        wasAddressed = detectedTopics.has('schedule');
      } else if (questionLower.includes('credit') || questionLower.includes('transfer') || questionLower.includes('requirement')) {
        wasAddressed = detectedTopics.has('academic');
      }
      
      // If not addressed, add to unanswered questions
      if (!wasAddressed && unansweredItems.length < 2) {
        unansweredItems.push({
          question: question,
          answer: 'Great question! Your enrollment advisor will follow up with detailed information about this.'
        });
      }
    });
    
    if (unansweredItems.length > 0) {
      sections.unshift({
        title: 'Your Specific Questions',
        items: unansweredItems
      });
    }
  }
  
  // Check for commonly missed topics
  const commonTopics = ['financial', 'schedule', 'academic', 'support'];
  const missedTopics = commonTopics.filter(topic => !detectedTopics.has(topic));
  
  if (missedTopics.length > 0 && missedTopics.includes('financial')) {
    sections.push({
      title: 'Additional Information',
      items: [{
        question: 'What if I can\'t afford tuition upfront?',
        answer: 'Don\'t worry! We have payment plans starting at $100/month and our financial aid team will help you explore all funding options.'
      }]
    });
  }
  
  // Add Calendar-Based FAQ Section with real dates
  const nextStart = getNextStartDate();
  if (nextStart) {
    const startDate = new Date(nextStart.date);
    const formattedDate = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const deadline = getRegistrationDeadline(nextStart.term);
    const financialAidDates = getFinancialAidDeadline(nextStart.term);
    
    sections.push({
      title: 'Important Dates & Deadlines',
      items: [
        {
          question: `When does the next term (${nextStart.term}) start?`,
          answer: `Classes begin ${formattedDate}. ${deadline ? `Registration deadline is ${new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.` : ''}`
        },
        ...(financialAidDates ? [{
          question: 'What are the financial aid deadlines?',
          answer: `FAFSA deadline: ${new Date(financialAidDates.fafsa).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Scholarship deadline: ${new Date(financialAidDates.scholarship).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`
        }] : [])
      ]
    });
  }
  
  // Always add Next Steps section
  sections.push({
    title: 'Next Steps',
    items: [
      {
        question: 'How do I get started?',
        answer: 'Apply online in 8 minutes at www.salemu.edu/apply-now. We\'ll connect you with financial aid and help register for classes immediately.'
      },
      {
        question: 'When can I start?',
        answer: nextStart 
          ? `Our next term (${nextStart.term}) begins ${new Date(nextStart.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. We also have additional start dates throughout the year.`
          : 'Multiple start dates year-round. Most students begin within 2-4 weeks. Your advisor helps choose the perfect start date for you.'
      }
    ]
  });
  
  return sections;
}

