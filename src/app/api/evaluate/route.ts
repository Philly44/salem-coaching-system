// src/app/api/evaluate/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    console.log('Received transcript length:', transcript?.length || 0);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variable INSIDE the function
    const API_KEY = process.env.ANTHROPIC_API_KEY;
    
    // Check if API key is configured
    if (!API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      console.error('Environment variables:', Object.keys(process.env).filter(key => key.includes('ANTHROPIC')));
      return NextResponse.json(
        { error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Initialize Anthropic with API key INSIDE the function
    const anthropic = new Anthropic({
      apiKey: API_KEY,
    });

    // Load all prompts - REMOVED INTERVIEW OVERVIEW PROMPT
    const promptFiles = [
      '01_title prompt.txt',
      '02_most impactful statement prompt.txt',
      '04_interview scorecard prompt.txt',
      '09_talk time.txt',
      '05_application invitation assessment prompt.txt',
      '06_weekly growth plan prompt.txt',
      '07_coaching notes prompt.txt',
      '',  // Email blast - missing, will skip
    ];

    console.log('Loading prompts...');
    const prompts = [];
    for (let i = 0; i < promptFiles.length; i++) {
      const file = promptFiles[i];
      
      // Skip empty filename (missing email blast)
      if (!file) {
        prompts.push('No email blast prompt available');
        console.log(`Prompt ${i + 1}: Skipped (file missing)`);
        continue;
      }
      
      try {
        const filePath = join(process.cwd(), 'prompts', file);
        const content = readFileSync(filePath, 'utf-8');
        console.log(`Loaded prompt ${i + 1}: ${file} (${content.length} chars)`);
        prompts.push(content);
      } catch (error) {
        console.error(`Error loading prompt ${file}:`, error);
        prompts.push(`Error loading ${file}`);
      }
    }

    // Define which prompts use Haiku (faster/cheaper) vs Sonnet
    const haikuIndices = [0, 4]; // title, application invitation

    // Create all evaluation promises
    const evaluationPromises = prompts.map((prompt, index) => {
      const isHaiku = haikuIndices.includes(index);
      const model = isHaiku
        ? 'claude-3-haiku-20240307'
        : 'claude-3-5-sonnet-20241022';
      
      // Use appropriate max_tokens based on model
      const maxTokens = isHaiku ? 4096 : 8192;
      
      console.log(`Creating request ${index + 1} with model: ${model} (max_tokens: ${maxTokens})`);
      
      return anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nTranscript:\n${transcript}`
          }
        ]
      });
    });

    // Execute all evaluations in parallel
    console.log('Starting parallel evaluation of 7 prompts...');
    console.log('Models: 2 Haiku (title, app invitation), 5 Sonnet (rest)');
    const startTime = Date.now();
    const responses = await Promise.all(evaluationPromises);
    const endTime = Date.now();
    console.log(`Evaluation completed in ${(endTime - startTime) / 1000}s`);

    // Extract content from responses - REMOVED OVERVIEW
    const results = {
      title: '',
      impactfulStatement: '',
      scorecard: '',
      talkListenRatio: '',
      applicationInvitation: '',
      growthPlan: '',
      coachingNotes: '',
      emailBlast: '',
    };

    // Map responses to correct keys - REMOVED OVERVIEW
    const responseMapping = [
      'title',
      'impactfulStatement',
      'scorecard',
      'talkListenRatio',
      'applicationInvitation',
      'growthPlan',
      'coachingNotes',
      'emailBlast'
    ];

    responses.forEach((response, index) => {
      const key = responseMapping[index];
      if (response.content && response.content[0] && response.content[0].type === 'text') {
        results[key as keyof typeof results] = response.content[0].text;
        console.log(`Result ${index + 1} (${key}): ${response.content[0].text.substring(0, 100)}...`);
      } else {
        console.error(`No text content in response ${index + 1} (${key})`);
      }
    });

    console.log('Sending results back to client');
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error in evaluation:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Failed to process evaluation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}