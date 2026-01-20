# Error Logging System

## Overview

تم إنشاء نظام logging شامل لتتبع الأخطاء والمشاكل في التطبيق.

## الملفات

### 1. `lib/utils/logger.ts`
- نظام logging مركزي
- يدعم 4 مستويات: ERROR, WARN, INFO, DEBUG
- يحفظ الـ logs في الذاكرة (آخر 100 log)
- يحفظ الـ logs في ملفات (server-side فقط)

### 2. `app/api/logs/route.ts`
- API endpoint للحصول على الـ logs
- `GET /api/logs` - جميع الـ logs
- `GET /api/logs?level=ERROR` - أخطاء فقط
- `GET /api/logs?recent=10` - آخر 10 أخطاء
- `DELETE /api/logs` - مسح الـ logs

### 3. `app/logs/page.tsx`
- صفحة لعرض الـ logs
- فلترة حسب المستوى
- Auto-refresh كل 5 ثواني
- تصدير JSON

## الاستخدام

### في الكود:

```typescript
import { logError, logWarn, logInfo } from '@/lib/utils/logger';

// Log error
logError('API call failed', error, { endpoint: '/api/test', userId: '123' });

// Log warning
logWarn('Rate limit approaching', { remaining: 10 });

// Log info
logInfo('Analysis started', { filesCount: 100 });
```

## عرض الـ Logs

### 1. في المتصفح:
افتح: `http://localhost:3000/logs`

### 2. في الملفات:
الـ logs تُحفظ في: `logs/error-YYYY-MM-DD.log`

### 3. عبر API:
```bash
# جميع الـ logs
curl http://localhost:3000/api/logs

# أخطاء فقط
curl http://localhost:3000/api/logs?level=ERROR

# آخر 10 أخطاء
curl http://localhost:3000/api/logs?recent=10
```

## الأماكن التي تم إضافة Logging فيها

1. **IssuesList.tsx**
   - ExplainFix failures
   - SmartFix failures
   - ReasoningChain failures
   - Session save errors

2. **useCodeTesting.ts**
   - Analysis failures
   - Testing process errors

3. **repoReader.ts**
   - GitHub API errors
   - Rate limit errors
   - 404 errors

4. **codeAnalyzer.ts**
   - Codebase analysis failures
   - API quota errors

5. **aiHelper.ts**
   - Model failures
   - Fallback attempts

6. **page.tsx**
   - UI errors
   - User-facing errors

## تتبع الأخطاء

عند حدوث خطأ مثل "The model is overloaded":
1. افتح `/logs` في المتصفح
2. ابحث عن الخطأ في القائمة
3. راجع Context و Stack Trace
4. استخدم المعلومات لتحديد السبب

## ملاحظات

- الـ logs في الذاكرة تُمسح عند إعادة تشغيل الـ server
- الـ logs في الملفات تُحفظ بشكل دائم
- الـ logs لا تحتوي على معلومات حساسة (API keys, tokens)
