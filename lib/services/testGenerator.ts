import { generateContentWithFallback } from '../utils/aiHelper';

export interface TestCase {
  name: string;
  type: 'unit' | 'integration' | 'security' | 'performance';
  code: string;
  description: string;
}

export interface GeneratedTests {
  unitTests: TestCase[];
  integrationTests: TestCase[];
  securityTests: TestCase[];
  performanceTests: TestCase[];
  total: number;
}

const UNIT_TEST_PROMPT = `Generate comprehensive unit tests for this codebase.

Codebase:
{CODEBASE}

Generate unit tests for each function/component. Include:
- Happy path tests
- Edge cases
- Error handling
- Boundary conditions
- Null/undefined checks

For each test, provide:
- Test name (descriptive)
- Test code (complete, runnable)
- Description

Return ONLY valid JSON array:
[
  {
    "name": "testCalculateTotalWithValidInput",
    "type": "unit",
    "code": "describe('calculateTotal', () => { ... })",
    "description": "Tests calculateTotal function with valid input"
  }
]`;

const INTEGRATION_TEST_PROMPT = `Generate integration tests for this codebase.

Codebase:
{CODEBASE}

Generate integration tests that test:
- Component interactions
- API endpoints
- Database operations
- Data flow between components
- External service integrations

Return ONLY valid JSON array:
[
  {
    "name": "testUserLoginFlow",
    "type": "integration",
    "code": "describe('User Login Flow', () => { ... })",
    "description": "Tests complete user login flow"
  }
]`;

const SECURITY_TEST_PROMPT = `Generate security tests for this codebase.

Codebase:
{CODEBASE}

Generate security tests for:
- SQL Injection vulnerabilities
- XSS (Cross-Site Scripting) attacks
- Authentication bypass
- Authorization issues
- Input validation
- CSRF protection
- Secure data handling

Return ONLY valid JSON array:
[
  {
    "name": "testSQLInjectionPrevention",
    "type": "security",
    "code": "describe('SQL Injection Prevention', () => { ... })",
    "description": "Tests that SQL injection attacks are prevented"
  }
]`;

const PERFORMANCE_TEST_PROMPT = `Generate performance tests for this codebase.

Codebase:
{CODEBASE}

Generate performance tests for:
- Response time
- Memory usage
- Database query performance
- API endpoint performance
- Component render time
- Load testing scenarios

Return ONLY valid JSON array:
[
  {
    "name": "testApiResponseTime",
    "type": "performance",
    "code": "describe('API Performance', () => { ... })",
    "description": "Tests API response time is under threshold"
  }
]`;

async function generateTestType(codebase: string, prompt: string): Promise<TestCase[]> {
  try {
    const result = await generateContentWithFallback(prompt.replace('{CODEBASE}', codebase));
    const text = result.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating tests:', error);
    return [];
  }
}

/**
 * Generate comprehensive tests for codebase
 */
export async function generateTests(
  files: Array<{ path: string; content: string }>,
  testTypes: ('unit' | 'integration' | 'security' | 'performance')[] = ['unit', 'integration', 'security']
): Promise<GeneratedTests> {
  try {
    const codebaseContent = files
      .map(file => `File: ${file.path}\n${file.content}`)
      .join('\n\n---\n\n');

    const tests: GeneratedTests = {
      unitTests: [],
      integrationTests: [],
      securityTests: [],
      performanceTests: [],
      total: 0
    };

    if (testTypes.includes('unit')) {
      tests.unitTests = await generateTestType(codebaseContent, UNIT_TEST_PROMPT);
    }
    if (testTypes.includes('integration')) {
      tests.integrationTests = await generateTestType(codebaseContent, INTEGRATION_TEST_PROMPT);
    }
    if (testTypes.includes('security')) {
      tests.securityTests = await generateTestType(codebaseContent, SECURITY_TEST_PROMPT);
    }
    if (testTypes.includes('performance')) {
      tests.performanceTests = await generateTestType(codebaseContent, PERFORMANCE_TEST_PROMPT);
    }

    tests.total = tests.unitTests.length + 
                  tests.integrationTests.length + 
                  tests.securityTests.length + 
                  tests.performanceTests.length;

    return tests;
  } catch (error) {
    console.error('Error generating tests:', error);
    throw error;
  }
}
