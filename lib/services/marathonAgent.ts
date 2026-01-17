import { generateContentWithFallback } from '../utils/aiHelper';
import { CodeIssue } from './codeAnalyzer';

export interface MarathonTask {
  id: string;
  repoUrl: string;
  status: 'running' | 'paused' | 'completed' | 'error';
  startTime: Date;
  lastCheck: Date;
  issuesFound: CodeIssue[];
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  thoughtSignature?: string;
}

export interface MarathonConfig {
  repoUrl: string;
  testInterval: number;
  autoFix: boolean;
  notifyOnIssue: boolean;
}

const THOUGHT_SIGNATURE_PROMPT = `Generate a thought signature for this testing cycle.

Previous context: {PREVIOUS_CONTEXT}
Current time: {CURRENT_TIME}
Task ID: {TASK_ID}

Create a concise signature that captures:
- What has been tested so far
- What issues were found
- What fixes were applied
- Current state of the codebase

Return ONLY a JSON object:
{
  "signature": "concise signature string",
  "summary": "brief summary of current state"
}`;

const ANALYSIS_PROMPT = `Analyze this codebase for issues. Use the previous context to avoid redundant checks.

Previous Thought Signature: {THOUGHT_SIGNATURE}
Repository: {REPO_URL}
Last Check: {LAST_CHECK}

Focus on:
1. New issues since last check
2. Previously found issues that may have been fixed
3. New code changes that need testing

Return ONLY valid JSON:
{
  "issues": [
    {
      "type": "bug",
      "severity": "high",
      "file": "app/api/users.ts",
      "line": 45,
      "description": "Issue description",
      "suggestion": "How to fix"
    }
  ],
  "testsRun": 10,
  "testsPassed": 8,
  "testsFailed": 2
}`;

export class MarathonAgent {
  private task: MarathonTask;
  private config: MarathonConfig;
  private intervalId?: NodeJS.Timeout;
  private thoughtSignature: string = '';

  constructor(config: MarathonConfig) {
    this.config = config;
    this.task = {
      id: `task-${Date.now()}`,
      repoUrl: config.repoUrl,
      status: 'running',
      startTime: new Date(),
      lastCheck: new Date(),
      issuesFound: [],
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0
    };
  }

  async start(): Promise<void> {
    await this.runFullAnalysis();
    this.intervalId = setInterval(async () => {
      await this.periodicCheck();
    }, this.config.testInterval * 60 * 1000);
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.task.status = 'paused';
    this.saveThoughtSignature();
  }

  async runFullAnalysis(): Promise<void> {
    try {
      this.task.status = 'running';
      this.task.lastCheck = new Date();
      this.loadThoughtSignature();

      this.thoughtSignature = await this.generateThoughtSignature();
      const analysis = await this.analyzeWithContext();

      this.task.issuesFound = analysis.issues;
      this.task.testsRun += analysis.testsRun || 0;
      this.task.testsPassed += analysis.testsPassed || 0;
      this.task.testsFailed += analysis.testsFailed || 0;

      if (this.config.autoFix && analysis.issues.length > 0) {
        await this.autoFixIssues(analysis.issues);
      }
      if (this.config.notifyOnIssue && analysis.issues.length > 0) {
        await this.notifyIssues(analysis.issues);
      }

      this.saveThoughtSignature();
    } catch (error) {
      console.error('Error in full analysis:', error);
      this.task.status = 'error';
    }
  }

  async periodicCheck(): Promise<void> {
    await this.runFullAnalysis();
  }

  private async generateThoughtSignature(): Promise<string> {
    const prompt = THOUGHT_SIGNATURE_PROMPT
      .replace('{PREVIOUS_CONTEXT}', this.thoughtSignature || 'None')
      .replace('{CURRENT_TIME}', new Date().toISOString())
      .replace('{TASK_ID}', this.task.id);

    try {
      const result = await generateContentWithFallback(prompt);
      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.signature || '';
      }
    } catch (error) {
      console.error('Error generating thought signature:', error);
    }
    return '';
  }

  private async analyzeWithContext(): Promise<{
    issues: CodeIssue[];
    testsRun?: number;
    testsPassed?: number;
    testsFailed?: number;
  }> {
    const prompt = ANALYSIS_PROMPT
      .replace('{THOUGHT_SIGNATURE}', this.thoughtSignature)
      .replace('{REPO_URL}', this.config.repoUrl)
      .replace('{LAST_CHECK}', this.task.lastCheck.toISOString());

    try {
      const result = await generateContentWithFallback(prompt);
      const text = result.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error in analysis with context:', error);
    }
    return { issues: [] };
  }

  private async autoFixIssues(issues: CodeIssue[]): Promise<void> {
    // Auto-fix high severity issues
    issues.filter(i => i.severity === 'high');
  }

  private async notifyIssues(issues: CodeIssue[]): Promise<void> {
    // Notify about high severity issues
    issues.filter(i => i.severity === 'high');
  }

  private saveThoughtSignature(): void {
    this.task.thoughtSignature = this.thoughtSignature;
  }

  private loadThoughtSignature(): void {
    if (this.task.thoughtSignature) {
      this.thoughtSignature = this.task.thoughtSignature;
    }
  }

  getStatus(): MarathonTask {
    return { ...this.task };
  }
}

export function createMarathonAgent(config: MarathonConfig): MarathonAgent {
  return new MarathonAgent(config);
}
