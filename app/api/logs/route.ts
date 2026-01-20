import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

/**
 * API endpoint to get logs
 * GET /api/logs - Get all logs
 * GET /api/logs?level=ERROR - Get errors only
 * GET /api/logs?recent=10 - Get recent errors
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');
    const recent = searchParams.get('recent');

    if (recent) {
      const count = parseInt(recent, 10) || 10;
      const errors = logger.getRecentErrors(count);
      return NextResponse.json({ success: true, logs: errors });
    }

    if (level) {
      const logs = logger.getLogs(level as any);
      return NextResponse.json({ success: true, logs });
    }

    const allLogs = logger.getLogs();
    return NextResponse.json({ success: true, logs: allLogs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Add log entry (from client-side)
 * POST /api/logs
 */
export async function POST(request: NextRequest) {
  try {
    const entry = await request.json();
    
    // Add to logger
    if (entry.level === 'ERROR') {
      logger.error(entry.message, entry.error ? new Error(entry.error) : undefined, entry.context);
    } else if (entry.level === 'WARN') {
      logger.warn(entry.message, entry.context);
    } else if (entry.level === 'INFO') {
      logger.info(entry.message, entry.context);
    } else if (entry.level === 'DEBUG') {
      logger.debug(entry.message, entry.context);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Clear logs
 * DELETE /api/logs
 */
export async function DELETE() {
  try {
    logger.clear();
    return NextResponse.json({ success: true, message: 'Logs cleared' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
