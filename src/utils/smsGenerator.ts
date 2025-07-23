interface SMSData {
  studentName: string;
  program: string;
  keyMotivation: string;
  urgencyFactor?: string;
  advisorName?: string;
  specificGoal?: string;
  experience?: string;
}

export function generateSMSFromResults(
  emailContent: string,
  impactfulStatement: string,
  title: string
): string {
  // Extract student name - prioritize title for full first name
  const nameFromTitle = title.match(/Student:\s*([A-Z][a-z]+)/i);
  const nameFromEmail = emailContent.match(/(?:Hi|Dear|Hello)\s+([A-Z][a-z]*)/i);
  const studentName = nameFromTitle?.[1] || nameFromEmail?.[1] || 'there';
  
  // Extract program from title (format: "Program: Nursing |")
  const titleProgramMatch = title.match(/Program:\s*([^|]+)/i);
  const emailProgramMatch = emailContent.match(/(?:your|the)\s+(.+?)\s+(?:program|degree|studies|major)/i);
  const program = titleProgramMatch?.[1]?.trim() || emailProgramMatch?.[1]?.trim() || 'goals';
  
  // Extract key motivation from impactful statement
  const motivationMatch = impactfulStatement.match(/"([^"]+)"/);
  const motivation = motivationMatch?.[1] || '';
  
  // Generate SMS based on available data
  return createSMSMessage({ studentName, program, keyMotivation: motivation });
}

export function generateThreePartSMS(
  emailContent: string,
  impactfulStatement: string,
  title: string
): string[] {
  // Extract all relevant data - prioritize title for full first name
  const nameFromTitle = title.match(/Student:\s*([A-Z][a-z]+)/i);
  const nameFromEmail = emailContent.match(/(?:Hi|Dear|Hello)\s+([A-Z][a-z]*)/i);
  const studentName = nameFromTitle?.[1] || nameFromEmail?.[1] || 'there';
  
  // Extract program from title (format: "Program: Nursing |")
  const titleProgramMatch = title.match(/Program:\s*([^|]+)/i);
  const emailProgramMatch = emailContent.match(/(?:your|the)\s+(.+?)\s+(?:program|degree|studies|major)/i);
  const program = titleProgramMatch?.[1]?.trim() || emailProgramMatch?.[1]?.trim() || 'program';
  
  const motivationMatch = impactfulStatement.match(/"([^"]+)"/);
  const motivation = motivationMatch?.[1] || '';
  
  // Extract advisor name from email signature or title
  const titleAdvisorMatch = title.match(/Advisor:\s*([^|]+)/i);
  const emailAdvisorMatch = emailContent.match(/\n([A-Z][a-z]+)(?:\s+[A-Z]\.)?[\s\n]+Admissions Advisor/i);
  const advisorName = titleAdvisorMatch?.[1]?.trim().split(' ')[0] || 
                      emailAdvisorMatch?.[1] || 
                      'Your advisor';
  
  // Extract specific goals or experiences from email content
  const goalMatch = emailContent.match(/(?:your\s+)?(?:goal|dream|vision|aspiration)s?\s+(?:of|to|for)\s+([^.,!]+)/i);
  const specificGoal = goalMatch?.[1]?.trim() || '';
  
  const experienceMatch = emailContent.match(/(?:your\s+)?(?:experience|background|work|career)\s+(?:in|with|as|at)\s+([^.,!]+)/i);
  const experience = experienceMatch?.[1]?.trim() || '';
  
  // Create 3 messages
  const messages: string[] = [];
  
  // Message 1: Personal connection + reminder (160 chars max)
  if (studentName !== 'there' && motivation) {
    // Shorten long quotes intelligently
    let shortMotivation = motivation;
    if (motivation.length > 40) {
      // Extract the most meaningful part
      const keyPhrases = motivation.match(/(?:love|passion|want|dream|goal|help|care).{0,20}/i);
      shortMotivation = keyPhrases ? keyPhrases[0].trim() : motivation.substring(0, 30) + '...';
    }
    messages.push(
      trimToSMSLength(`Hi ${studentName}! When you said "${shortMotivation}" I knew ${program} was perfect for you.`)
    );
  } else if (studentName !== 'there') {
    messages.push(
      trimToSMSLength(`Hi ${studentName}! Great talking about your ${program} goals today. Your enthusiasm really stood out.`)
    );
  } else {
    messages.push(
      trimToSMSLength(`Hi! Loved our conversation about your educational journey. Your passion really came through.`)
    );
  }
  
  // Message 2: Specific benefits + urgency (160 chars max)
  if (specificGoal && experience) {
    // Shorten if needed
    const shortGoal = specificGoal.length > 30 ? specificGoal.substring(0, 27) + '...' : specificGoal;
    const shortExp = experience.length > 20 ? experience.substring(0, 17) + '...' : experience;
    messages.push(
      trimToSMSLength(`With your ${shortExp} background, you're ready! Classes start soon - let's make ${shortGoal} happen.`)
    );
  } else if (specificGoal) {
    const shortGoal = specificGoal.length > 40 ? specificGoal.substring(0, 37) + '...' : specificGoal;
    messages.push(
      trimToSMSLength(`Your goal: ${shortGoal}? Absolutely achievable! Our program fits perfectly. Classes filling fast!`)
    );
  } else if (program !== 'educational goals') {
    messages.push(
      trimToSMSLength(`Our ${program} program = perfect fit for you. Flexible schedule + expert faculty. Don't wait!`)
    );
  } else {
    messages.push(
      trimToSMSLength(`The program we discussed fits your goals perfectly. Flexible options available. Seats filling fast!`)
    );
  }
  
  // Message 3: Clear CTA + support (160 chars max)
  messages.push(
    trimToSMSLength(`Ready? 🎯 Apply now: salemu.edu/apply (just 10 min). Questions? Text me back! -${advisorName}`)
  );
  
  return messages;
}

function trimToSMSLength(message: string): string {
  if (message.length <= 160) {
    return message;
  }
  
  // Trim to last complete word
  const trimmed = message.substring(0, 157);
  const lastSpace = trimmed.lastIndexOf(' ');
  
  if (lastSpace > 100) {
    return trimmed.substring(0, lastSpace) + '...';
  }
  
  return trimmed + '...';
}

function createSMSMessage(data: SMSData): string {
  const { studentName, program, keyMotivation } = data;
  
  // Templates based on available information
  const templates = [
    // Full personalization
    {
      condition: () => studentName !== 'there' && program !== 'goals' && keyMotivation,
      message: () => `Hi ${studentName}! Your "${keyMotivation}" really inspired me. Ready to start ${program}? 🚀 Apply now: salemu.edu/apply (10 min)`
    },
    // Name and program
    {
      condition: () => studentName !== 'there' && program !== 'goals',
      message: () => `Hi ${studentName}! Let's make your ${program} dream happen ✨ Quick 10-min application: salemu.edu/apply Questions? Text back!`
    },
    // Just name
    {
      condition: () => studentName !== 'there',
      message: () => `Hi ${studentName}! Great talking today about your future. Ready to take the next step? Apply: salemu.edu/apply (just 10 min!)`
    },
    // Generic but effective
    {
      condition: () => true,
      message: () => `Hi! Loved our conversation about your educational goals. Let's keep the momentum going: salemu.edu/apply Quick 10-min application!`
    }
  ];
  
  // Find the best matching template
  const template = templates.find(t => t.condition()) || templates[templates.length - 1];
  let message = template.message();
  
  // Ensure it fits in 160 characters
  if (message.length > 160) {
    // Trim the motivation quote if needed
    message = message.replace(/Your "[^"]+"/, 'What you shared');
    // Trim to last complete word under 160 chars
    if (message.length > 160) {
      message = message.substring(0, 157);
      const lastSpace = message.lastIndexOf(' ');
      if (lastSpace > 100) {
        message = message.substring(0, lastSpace) + '...';
      } else {
        message = message + '...';
      }
    }
  }
  
  return message;
}

