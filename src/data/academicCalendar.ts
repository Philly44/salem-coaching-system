// Academic Calendar Data
// This file contains all important dates and information from Salem University's academic calendar

export interface AcademicTerm {
  name: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  withdrawalDeadline: string;
  holidays: { date: string; name: string }[];
  breaks: { startDate: string; endDate: string; name: string }[];
}

export interface ProgramStartDates {
  programType: string;
  startMonths: string[];
}

export interface CalendarData {
  academicYear: string;
  terms: AcademicTerm[];
  importantDates: {
    date: string;
    description: string;
  }[];
  tuitionInfo: {
    perCreditHour: number;
    paymentPlanOptions: string[];
    financialAidDeadlines: {
      term: string;
      fasaDeadline: string;
      scholarshipDeadline: string;
    }[];
  };
  programStartDates: ProgramStartDates[];
}

// Salem University Academic Calendar Data
// Based on the official academic calendar document
export const ACADEMIC_CALENDAR: CalendarData = {
  academicYear: "2024-2025",
  terms: [
    {
      name: "Fall 2024",
      startDate: "2024-09-01", // September start as per document
      endDate: "2024-12-31", // December end as per document
      registrationDeadline: "2024-08-25", // Week before start
      withdrawalDeadline: "2024-11-15", // Based on standard policy
      holidays: [
        { date: "2024-09-02", name: "Labor Day" },
        { date: "2024-11-28", name: "Thanksgiving Day" },
        { date: "2024-11-29", name: "Day After Thanksgiving" }
      ],
      breaks: [
        { startDate: "2024-11-25", endDate: "2024-11-29", name: "Thanksgiving Break" }
      ]
    },
    {
      name: "Winter 2025",
      startDate: "2025-01-01", // January start as per document
      endDate: "2025-04-30", // April end as per document
      registrationDeadline: "2024-12-20", // Before holidays
      withdrawalDeadline: "2025-03-15", // Based on standard policy
      holidays: [
        { date: "2025-01-20", name: "Martin Luther King Jr. Day" }
      ],
      breaks: [
        { startDate: "2025-03-17", endDate: "2025-03-21", name: "Spring Break" }
      ]
    },
    {
      name: "Summer 2025",
      startDate: "2025-05-01", // May start as per document
      endDate: "2025-08-31", // August end as per document
      registrationDeadline: "2025-04-25", // Week before start
      withdrawalDeadline: "2025-07-15", // Based on standard policy
      holidays: [
        { date: "2025-05-26", name: "Memorial Day" },
        { date: "2025-07-04", name: "Independence Day" }
      ],
      breaks: []
    }
  ],
  importantDates: [
    { date: "2024-08-15", description: "New Student Orientation" },
    { date: "2024-12-14", description: "Fall Commencement" },
    { date: "2025-05-03", description: "Spring Commencement" },
    { date: "2025-01-01", description: "Winter Term Begins" },
    { date: "2025-05-01", description: "Summer Term Begins" }
  ],
  tuitionInfo: {
    perCreditHour: 350, // Standard rate - update with actual amount
    paymentPlanOptions: [
      "Pay in full",
      "Monthly payment plan (no interest)",
      "Employer deferred billing",
      "Payment plans starting at $100/month"
    ],
    financialAidDeadlines: [
      {
        term: "Fall 2024",
        fasaDeadline: "2024-07-01",
        scholarshipDeadline: "2024-08-01"
      },
      {
        term: "Winter 2025",
        fasaDeadline: "2024-11-15",
        scholarshipDeadline: "2024-12-01"
      },
      {
        term: "Summer 2025",
        fasaDeadline: "2025-03-15",
        scholarshipDeadline: "2025-04-01"
      }
    ]
  },
  programStartDates: [
    {
      programType: "RN-BSN/MSN, DBA, HHP & IHI",
      startMonths: ["January", "March", "May", "July", "September", "November"]
    },
    {
      programType: "ASN Program & National 2+1 BSN – Year 2 Cohorts",
      startMonths: ["January", "May", "September"]
    },
    {
      programType: "BIO, BUS, CJ, CS, EDU, IT & Pre-Health/Pre-ASN",
      startMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    {
      programType: "Enrichment Courses and Non-Degree Seeking",
      startMonths: ["January", "February", "May", "June", "September", "October"]
    }
  ]
};

// Helper functions to query calendar data
export function getNextStartDate(fromDate: Date = new Date()): { term: string; date: string } | null {
  const terms = ACADEMIC_CALENDAR.terms;
  
  for (const term of terms) {
    const startDate = new Date(term.startDate);
    if (startDate > fromDate) {
      return { term: term.name, date: term.startDate };
    }
  }
  
  return null;
}

export function getTermByDate(date: Date): AcademicTerm | null {
  return ACADEMIC_CALENDAR.terms.find(term => {
    const start = new Date(term.startDate);
    const end = new Date(term.endDate);
    return date >= start && date <= end;
  }) || null;
}

export function getRegistrationDeadline(termName: string): string | null {
  const term = ACADEMIC_CALENDAR.terms.find(t => t.name === termName);
  return term ? term.registrationDeadline : null;
}

export function getFinancialAidDeadline(termName: string): { fafsa: string; scholarship: string } | null {
  const deadline = ACADEMIC_CALENDAR.tuitionInfo.financialAidDeadlines.find(d => d.term === termName);
  return deadline ? { fafsa: deadline.fasaDeadline, scholarship: deadline.scholarshipDeadline } : null;
}

export function getProgramStartMonths(programType: string): string[] {
  // Map common program names to their categories
  const programMappings: { [key: string]: string } = {
    'nursing': 'RN-BSN/MSN, DBA, HHP & IHI',
    'rn-bsn': 'RN-BSN/MSN, DBA, HHP & IHI',
    'msn': 'RN-BSN/MSN, DBA, HHP & IHI',
    'dba': 'RN-BSN/MSN, DBA, HHP & IHI',
    'business': 'BIO, BUS, CJ, CS, EDU, IT & Pre-Health/Pre-ASN',
    'criminal justice': 'BIO, BUS, CJ, CS, EDU, IT & Pre-Health/Pre-ASN',
    'education': 'BIO, BUS, CJ, CS, EDU, IT & Pre-Health/Pre-ASN',
    'it': 'BIO, BUS, CJ, CS, EDU, IT & Pre-Health/Pre-ASN',
    'computer science': 'BIO, BUS, CJ, CS, EDU, IT & Pre-Health/Pre-ASN',
    'biology': 'BIO, BUS, CJ, CS, EDU, IT & Pre-Health/Pre-ASN',
    'asn': 'ASN Program & National 2+1 BSN – Year 2 Cohorts',
    'associate nursing': 'ASN Program & National 2+1 BSN – Year 2 Cohorts'
  };
  
  const programLower = programType.toLowerCase();
  let category = null;
  
  // Find matching category
  for (const [key, value] of Object.entries(programMappings)) {
    if (programLower.includes(key)) {
      category = value;
      break;
    }
  }
  
  // If no match found, default to monthly starts
  if (!category) {
    category = 'BIO, BUS, CJ, CS, EDU, IT & Pre-Health/Pre-ASN';
  }
  
  const programData = ACADEMIC_CALENDAR.programStartDates.find(p => p.programType === category);
  return programData ? programData.startMonths : ['January', 'May', 'September'];
}