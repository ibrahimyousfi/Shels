import { NextRequest } from 'next/server';
import { readFilesFromUpload, readFilesFromGitHub, filterCodeFiles, countAllFilesFromGitHub } from '@/lib/services/repoReader';
import { analyzeCodebase } from '@/lib/services/codeAnalyzer';
import { createApiResponse, createErrorResponse } from '@/lib/utils/apiHelper';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const repoUrl = formData.get('repoUrl') as string;
    const files = formData.getAll('files') as File[];

    let codeFiles, totalRepoFiles = 0;

    if (repoUrl) {
      totalRepoFiles = await countAllFilesFromGitHub(repoUrl);
      codeFiles = await readFilesFromGitHub(repoUrl);
    } else if (files.length > 0) {
      const formDataObj = new FormData();
      files.forEach(file => formDataObj.append('file', file));
      codeFiles = await readFilesFromUpload(formDataObj);
      totalRepoFiles = files.length;
    } else {
      return createErrorResponse('Either repoUrl or files must be provided', 400);
    }

    const filteredFiles = filterCodeFiles(codeFiles);
    if (!filteredFiles.length) {
      return createErrorResponse('No code files found', 400);
    }

    const analysis = await analyzeCodebase(filteredFiles);
    analysis.totalRepoFiles = totalRepoFiles;
    analysis.ignoredFiles = totalRepoFiles - filteredFiles.length;

    return createApiResponse(true, { analysis, files: filteredFiles });
  } catch (error: any) {
    console.error('API Error:', error);
    const errorMessage = error.message || 'Internal server error';
    const statusCode = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED') ? 429 : 500;
    return createErrorResponse(errorMessage, statusCode);
  }
}
