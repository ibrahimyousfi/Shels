import { generateContentWithFallback } from '../utils/aiHelper';

export interface CodeFile {
  path: string;
  content: string;
  language?: string;
}

export interface CodeIssue {
  type: 'bug' | 'security' | 'performance' | 'quality' | 'error_handling';
  severity: 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  description: string;
  suggestion?: string;
}

export interface CodeAnalysis {
  totalFiles: number;
  totalLines: number;
  issues: CodeIssue[];
  structure: {
    mainFiles: string[];
    dependencies: string[];
    architecture: string;
  };
  summary: string;
  totalRepoFiles?: number;
  ignoredFiles?: number;
  analysisScope?: {
    analyzedFileTypes: string[];
    ignoredFileTypes: string[];
    focus: string;
  };
}

const ANALYSIS_PROMPT = `You are an expert code analyzer. Analyze this entire codebase and provide a comprehensive analysis.

Codebase:
{CODEBASE}

Analyze and find:
1. **Bugs and Errors**: All programming bugs, logic errors, and potential runtime errors
2. **Security Vulnerabilities**: SQL injection, XSS, authentication issues, authorization problems, insecure data handling
3. **Performance Issues**: Slow algorithms, memory leaks, inefficient database queries, unnecessary re-renders
4. **Code Quality Problems**: Code smells, duplicated code, complex functions, poor naming, missing comments
5. **Missing Error Handling**: Functions without try-catch, missing null checks, unhandled edge cases

For each issue found, provide:
- Type (bug/security/performance/quality/error_handling)
- Severity (high/medium/low)
- File path
- Line number (if applicable)
- Description
- Suggestion for fix

Also analyze:
- Project structure and architecture
- Main files and their purposes
- Dependencies and their usage
- Overall code quality assessment

Return ONLY valid JSON in this exact format:
{
  "issues": [
    {
      "type": "bug",
      "severity": "high",
      "file": "app/api/users.ts",
      "line": 45,
      "description": "Null pointer exception possible when user is null",
      "suggestion": "Add null check before accessing user properties"
    }
  ],
  "structure": {
    "mainFiles": ["app/page.tsx", "lib/api.ts"],
    "dependencies": ["react", "next"],
    "architecture": "Next.js app with API routes"
  },
  "summary": "Overall assessment of the codebase..."
}`;

const FILE_ANALYSIS_PROMPT = `Analyze this code file and find all issues:

File: {FILE_PATH}
Code:
{CODE}

Find all bugs, security issues, performance problems, code quality issues, and missing error handling.

Return ONLY valid JSON array:
[
  {
    "type": "bug",
    "severity": "high",
    "file": "{FILE_PATH}",
    "line": 45,
    "description": "Issue description",
    "suggestion": "How to fix"
  }
]`;

/**
 * Analyze entire codebase using Extended Context (1M tokens)
 */
export async function analyzeCodebase(files: CodeFile[]): Promise<CodeAnalysis> {
  try {
    const codebaseContent = files
      .map(file => `File: ${file.path}\n${file.content}`)
      .join('\n\n---\n\n');

    const prompt = ANALYSIS_PROMPT.replace('{CODEBASE}', codebaseContent);
    const result = await generateContentWithFallback(prompt);
    const text = result.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      totalFiles: files.length,
      totalLines: files.reduce((sum, file) => sum + file.content.split('\n').length, 0),
      issues: data.issues || [],
      structure: data.structure || {
        mainFiles: [],
        dependencies: [],
        architecture: 'Unknown'
      },
      summary: data.summary || 'Analysis completed',
      analysisScope: {
        analyzedFileTypes: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin'],
        ignoredFileTypes: ['HTML', 'CSS', 'Images', 'Config files', 'Git files', 'Documentation'],
        focus: 'Executable code with runtime risks'
      }
    };
  } catch (error: any) {
    console.error('Error analyzing codebase:', error);
    
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      const quotaError = {
        error: {
          code: 429,
          message: 'API quota exceeded. Please wait or use a different API key.',
          status: 'RESOURCE_EXHAUSTED'
        }
      };
      throw new Error(JSON.stringify(quotaError));
    }
    
    throw error;
  }
}

/**
 * Analyze single file
 */
export async function analyzeFile(file: CodeFile): Promise<CodeIssue[]> {
  try {
    const prompt = FILE_ANALYSIS_PROMPT
      .replace('{FILE_PATH}', file.path)
      .replace('{CODE}', file.content);

    const result = await generateContentWithFallback(prompt);
    const text = result.text || '';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing file:', error);
    return [];
  }
}
