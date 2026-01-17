import { NextRequest } from 'next/server';
import { createMarathonAgent, MarathonConfig } from '@/lib/services/marathonAgent';
import { createApiResponse, createErrorResponse, parseJsonBody } from '@/lib/utils/apiHelper';

const activeAgents = new Map<string, ReturnType<typeof createMarathonAgent>>();

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return createErrorResponse('Invalid JSON body', 400);

    const { action, taskId, config } = body;

    if (action === 'start') {
      const marathonConfig: MarathonConfig = {
        repoUrl: config.repoUrl,
        testInterval: config.testInterval || 60,
        autoFix: config.autoFix || false,
        notifyOnIssue: config.notifyOnIssue || false
      };
      const agent = createMarathonAgent(marathonConfig);
      await agent.start();
      activeAgents.set(agent.getStatus().id, agent);
      return createApiResponse(true, { taskId: agent.getStatus().id, status: agent.getStatus() });
    }

    if (action === 'stop') {
      const agent = activeAgents.get(taskId);
      if (!agent) return createErrorResponse('Agent not found', 404);
      agent.stop();
      activeAgents.delete(taskId);
      return createApiResponse(true, { message: 'Marathon agent stopped' });
    }

    if (action === 'status') {
      const agent = activeAgents.get(taskId);
      if (!agent) return createErrorResponse('Agent not found', 404);
      return createApiResponse(true, { status: agent.getStatus() });
    }

    return createErrorResponse('Invalid action', 400);
  } catch (error: any) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal server error');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      const agent = activeAgents.get(taskId);
      if (!agent) return createErrorResponse('Agent not found', 404);
      return createApiResponse(true, { status: agent.getStatus() });
    }

    const agents = Array.from(activeAgents.values()).map(agent => agent.getStatus());
    return createApiResponse(true, { agents });
  } catch (error: any) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Internal server error');
  }
}
