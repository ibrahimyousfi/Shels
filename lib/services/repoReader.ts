import { CodeFile } from './codeAnalyzer';
import { logError, logWarn } from '@/lib/utils/logger';

/**
 * Read files from uploaded files (FormData)
 */
export async function readFilesFromUpload(formData: FormData): Promise<CodeFile[]> {
  const files: CodeFile[] = [];
  const fileEntries = Array.from(formData.entries());

  for (const [key, value] of fileEntries) {
    if (value instanceof File) {
      const content = await value.text();
      const path = value.webkitRelativePath || value.name;
      
      files.push({
        path,
        content,
        language: detectLanguage(path)
      });
    }
  }

  return files;
}

/**
 * Count all files in GitHub repository (including non-code files)
 */
export async function countAllFilesFromGitHub(repoUrl: string): Promise<number> {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }

    const [, owner, repo] = match;
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    
    const count = { value: 0 };
    await countFilesRecursive(baseUrl, owner, repo, count);
    return count.value;
  } catch (error) {
    logError('Error counting files from GitHub', error);
    return 0;
  }
}

async function countFilesRecursive(
  url: string,
  owner: string,
  repo: string,
  count: { value: number }
): Promise<void> {
  try {
    // Add GitHub token if available
    const githubToken = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Shels-Code-Analyzer'
    };
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const response = await fetch(url, { headers });
    if (!response.ok) return;
    
    const items = await response.json();
    const itemsArray = Array.isArray(items) ? items : [items];
    
    for (const item of itemsArray) {
      if (item.type === 'dir') {
        const subUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`;
        await countFilesRecursive(subUrl, owner, repo, count);
      } else if (item.type === 'file') {
        count.value++;
      }
    }
  } catch (error) {
    logError(`Error counting files in ${url}`, error);
  }
}

/**
 * Read files from GitHub repository using Contents API
 */
export async function readFilesFromGitHub(repoUrl: string): Promise<CodeFile[]> {
  try {
    // Extract owner and repo from URL
    // Support formats: https://github.com/owner/repo or github.com/owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git|\/|$)/);
    if (!match) {
      throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo');
    }

    const [, owner, repo] = match;
    
    // Use GitHub Contents API (better than Git Trees API)
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    
    // Read files recursively starting from root
    const files = await readDirectoryRecursive(baseUrl, owner, repo);
    
    if (files.length === 0) {
      throw new Error('No code files found. Repository may be empty, private, or rate limited. Add GITHUB_TOKEN to fix rate limits.');
    }
    
    return files;
  } catch (error: any) {
    logError('Error reading from GitHub', error);
    
    // Provide more helpful error messages
    if (error.message?.includes('403') || error.message?.includes('rate limit')) {
      throw new Error('GitHub API rate limit exceeded. Please add GITHUB_TOKEN to your .env.local file for higher limits (5000/hour). Get token from: https://github.com/settings/tokens');
    }
    
    if (error.message?.includes('404')) {
      throw new Error('Repository not found. Make sure the repository is public and the URL is correct.');
    }
    
    throw error;
  }
}

/**
 * Read directory recursively using GitHub Contents API
 */
async function readDirectoryRecursive(
  url: string,
  owner: string,
  repo: string,
  basePath: string = ''
): Promise<CodeFile[]> {
  const files: CodeFile[] = [];
  
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Shels-Code-Analyzer'
    };
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 403) {
        logError('GitHub API rate limit', new Error('403 Forbidden'), { url, owner, repo });
        throw new Error('GitHub API rate limit exceeded. Add GITHUB_TOKEN to .env.local');
      }
      if (response.status === 404) {
        logWarn('GitHub API 404', { url, owner, repo });
        return [];
      }
      logError('GitHub API error', new Error(`Status ${response.status}`), { url, owner, repo });
      return [];
    }

    const items = await response.json();
    const itemsArray = Array.isArray(items) ? items : [items];
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.vue', '.svelte'];
    
    for (const item of itemsArray) {
      if (item.type === 'dir') {
        const subUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`;
        const subFiles = await readDirectoryRecursive(subUrl, owner, repo, item.path);
        files.push(...subFiles);
      } else if (item.type === 'file' && codeExtensions.some(ext => item.name.endsWith(ext))) {
        try {
          if (item.download_url) {
            const fileResponse = await fetch(item.download_url);
            if (fileResponse.ok) {
              const content = await fileResponse.text();
              files.push({
                path: item.path,
                content,
                language: detectLanguage(item.name)
              });
            }
          } else if (item.content) {
            const content = Buffer.from(item.content, 'base64').toString('utf-8');
            files.push({
              path: item.path,
              content,
              language: detectLanguage(item.name)
            });
          }
        } catch (error) {
          // Skip file if error
        }
      }
    }
  } catch (error) {
    // Return empty array on error
  }
  
  return files;
}

/**
 * Detect programming language from file path
 */
function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin'
  };

  return languageMap[ext || ''] || 'unknown';
}

/**
 * Filter code files (exclude node_modules, .git, etc.)
 */
export function filterCodeFiles(files: CodeFile[]): CodeFile[] {
  const excludePatterns = [
    /node_modules/,
    /\.git/,
    /\.next/,
    /dist/,
    /build/,
    /\.env/,
    /package-lock\.json/,
    /yarn\.lock/,
    /\.log$/
  ];

  return files.filter(file => {
    return !excludePatterns.some(pattern => pattern.test(file.path));
  });
}
