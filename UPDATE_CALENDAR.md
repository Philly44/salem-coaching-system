# How to Update the Academic Calendar

## Quick Steps:

1. Open the file: `src/data/academicCalendar.ts`

2. Replace the sample data in `ACADEMIC_CALENDAR` with your actual calendar information

3. The format should follow this structure:

```typescript
export const ACADEMIC_CALENDAR: CalendarData = {
  academicYear: "2024-2025",
  terms: [
    {
      name: "Fall 2024",
      startDate: "2024-08-26",         // Format: YYYY-MM-DD
      endDate: "2024-12-13",
      registrationDeadline: "2024-08-23",
      withdrawalDeadline: "2024-11-15",
      holidays: [
        { date: "2024-09-02", name: "Labor Day" },
        // Add more holidays...
      ],
      breaks: [
        { startDate: "2024-11-25", endDate: "2024-11-29", name: "Thanksgiving Break" }
        // Add more breaks...
      ]
    },
    // Add more terms...
  ],
  importantDates: [
    { date: "2024-08-15", description: "New Student Orientation" },
    // Add more important dates...
  ],
  tuitionInfo: {
    perCreditHour: 350,  // Replace with actual cost
    paymentPlanOptions: [
      "Pay in full",
      "Monthly payment plan (no interest)",
      // Add more options...
    ],
    financialAidDeadlines: [
      {
        term: "Fall 2024",
        fasaDeadline: "2024-07-01",
        scholarshipDeadline: "2024-08-01"
      },
      // Add more deadline info...
    ]
  }
};
```

## What Information to Include:

### For Each Term:
- Term name (e.g., "Fall 2024", "Spring 2025")
- Start and end dates
- Registration deadline
- Withdrawal deadline
- All holidays during that term
- All break periods

### Financial Information:
- Cost per credit hour
- Available payment plan options
- FAFSA deadlines for each term
- Scholarship deadlines for each term

### Important Dates:
- Orientation dates
- Commencement dates
- Any other significant academic events

## The FAQ System Will Automatically:

1. **Generate accurate start dates** - "You can start Fall 2024 on August 26!"
2. **Show real deadlines** - "Submit FAFSA by July 1 for Fall term"
3. **Include break schedules** - "Thanksgiving Break runs from November 25-29"
4. **Calculate days until start** - "With 45 days until Fall term starts..."
5. **Provide payment deadlines** - "Tuition is due by August 23"
6. **Show course duration** - "Each course runs for 8 weeks"

## Example Calendar Entry from Your Document:

If your academic calendar shows:
- Fall 2024: Aug 26 - Dec 13
- Registration Deadline: Aug 23
- FAFSA Deadline: July 1
- Thanksgiving Break: Nov 25-29

Update the `academicCalendar.ts` file with these exact dates, and the FAQ will automatically use them!