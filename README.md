# Salem University Coaching Evaluation System

An AI-powered evaluation system that analyzes advisor-student conversations to generate comprehensive coaching reports with consistent, deterministic output.

## Overview

The Salem University Coaching System processes conversation transcripts through 8 specialized evaluation modules to produce standardized coaching guides. The system is designed for zero-variance output - identical transcripts always produce identical evaluations.

### Key Features

- **8-Module Evaluation Engine**: Comprehensive analysis across multiple dimensions
- **Deterministic Output**: 100% consistent results for identical inputs
- **Batch Processing**: Handles multiple API calls efficiently with retry logic
- **Rate Limit Management**: Automatic retry with exponential backoff
- **Clean Output**: Removes AI preambles for professional reports

## Getting Started

### Prerequisites

- Node.js 20.18.0 or higher
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/salem-coaching-system.git
cd salem-coaching-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### WSL Users

If you're using Windows Subsystem for Linux, the project includes a `.npmrc` configuration for proper native module building.

## System Architecture

### Evaluation Modules

1. **Header Generation** - Creates standardized report headers
2. **Great Moment Identification** - Highlights impactful advisor statements
3. **Interview Scorecard** - Comprehensive performance evaluation
4. **Talk/Listen Ratio Analysis** - Conversation balance metrics
5. **Application Invitation Assessment** - Evaluates invitation appropriateness
6. **Weekly Growth Plan** - Generates targeted improvement strategies
7. **Coaching Notes** - Provides developmental guidance
8. **Email Blast** - Creates personalized follow-up emails

### API Endpoint

**POST** `/api/evaluate`

Request body:
```json
{
  "transcript": "Advisor: Hello...\nStudent: Hi..."
}
```

Response:
```json
{
  "title": "...",
  "impactfulStatement": "...",
  "scorecard": "...",
  "talkListenRatio": "...",
  "applicationInvitation": "...",
  "growthPlan": "...",
  "coachingNotes": "...",
  "emailBlast": "..."
}
```

## Prompt Files

All evaluation prompts are stored in the `/prompts` directory:

- `01_title prompt.txt` - Header generation logic
- `02_most impactful statement prompt.txt` - Great moment selection
- `04_interview scorecard prompt.txt` - Performance evaluation criteria
- `05_application invitation assessment prompt.txt` - Invitation analysis
- `06_weekly growth plan prompt.txt` - Growth strategy templates
- `07_coaching notes prompt.txt` - Coaching guidance framework
- `08_email_blast_prompt.txt` - Email generation template
- `09_talk time.txt` - Talk/listen ratio calculation

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── evaluate/
│   │   │       └── route.ts    # Main API endpoint
│   │   ├── page.tsx            # Main UI
│   │   └── layout.tsx          # App layout
│   └── components/
│       └── EvaluationResults.tsx # Results display component
├── prompts/                     # Evaluation prompt files
├── public/                      # Static assets
└── package.json
```

## Error Handling

 The system includes comprehensive error handling:

- **Missing Prompts**: Returns detailed error with file information
- **API Rate Limits**: Automatic retry with exponential backoff
- **Invalid Transcripts**: Validation with helpful error messages
- **API Failures**: Graceful degradation with error details

## Performance Considerations

- Processes evaluations in batches of 2 to avoid rate limits
- Uses Claude Haiku for simple evaluations (faster/cheaper)
- Uses Claude Sonnet for complex evaluations (more capable)
- Implements 3-second delays between batches
- Maximum 5 retries for failed API calls

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

Use the provided `test-api.js` script to test the API:

```bash
node test-api.js
```

This will send a sample transcript and save the response to `test-response.json`.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and improvements.

## License

This project is proprietary to Salem University.

## Support

For issues or questions, please contact the development team.
