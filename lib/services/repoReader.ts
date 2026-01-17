import { CodeFile } from './codeAnalyzer';

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
    console.error('Error counting files from GitHub:', error);
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
    const response = await fetch(url);
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
    console.error(`Error counting files in ${url}:`, error);
  }
}

/**
 * Read files from GitHub repository using Contents API
 */
export async function readFilesFromGitHub(repoUrl: string): Promise<CodeFile[]> {
  try {
    // Extract owner and repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }

    const [, owner, repo] = match;
    
    // Use GitHub Contents API (better than Git Trees API)
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    
    // Read files recursively starting from root
    const files = await readDirectoryRecursive(baseUrl, owner, repo);
    
    return files;
  } catch (error) {
    console.error('Error reading from GitHub:', error);
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
    const response = await fetch(url);
    if (!response.ok) {
      // If rate limited or not found, return empty array
      if (response.status === 403 || response.status === 404) {
        console.warn(`GitHub API error: ${response.statusText}. Rate limit may be exceeded.`);
        return [];
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const items = await response.json();
    
    // Handle both single file and array of items
    const itemsArray = Array.isArray(items) ? items : [items];
    
    // Filter only code files
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.vue', '.svelte'];
    
    for (const item of itemsArray) {
      // Skip if it's a directory marker or not a code file
      if (item.type === 'dir') {
        // Recursively read subdirectory
        const subUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`;
        const subFiles = await readDirectoryRecursive(subUrl, owner, repo, item.path);
        files.push(...subFiles);
      } else if (item.type === 'file' && codeExtensions.some(ext => item.name.endsWith(ext))) {
        try {
          // Use download_url for direct file content (faster)
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
            // Fallback: decode base64 content
            const content = Buffer.from(item.content, 'base64').toString('utf-8');
            
            files.push({
              path: item.path,
              content,
              language: detectLanguage(item.name)
            });
          }
        } catch (error) {
          console.error(`Error reading file ${item.path}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${url}:`, error);
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
