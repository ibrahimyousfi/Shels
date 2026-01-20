# GitHub API Setup Guide

## المشكلة

GitHub API بدون authentication له حدود منخفضة:
- **60 requests/hour** بدون token
- **5000 requests/hour** مع token

هذا قد يسبب مشاكل عند تحليل repositories كبيرة.

## الحل: إضافة GitHub Token

### الخطوة 1: إنشاء GitHub Token

1. اذهب إلى: https://github.com/settings/tokens
2. اضغط **Generate new token** → **Generate new token (classic)**
3. أعطِ الـ token اسم: `Shels Code Analyzer`
4. اختر الصلاحيات:
   - ✅ `public_repo` (لقراءة public repositories)
5. اضغط **Generate token**
6. **انسخ الـ token** (لن تراه مرة أخرى!)

### الخطوة 2: إضافة Token إلى المشروع

#### للـ Local Development:

أنشئ ملف `.env.local` في `react.wieps/`:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token_here
```

#### للـ Vercel Deployment:

1. اذهب إلى Vercel Dashboard
2. اختر مشروع Shels
3. **Settings** → **Environment Variables**
4. أضف:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: [GitHub token]
   - **Environment**: Production, Preview, Development
5. اضغط **Save**

### الخطوة 3: إعادة تشغيل

```bash
# Local
npm run dev

# Vercel - سيعيد النشر تلقائياً
```

## التحقق من العمل

بعد إضافة الـ token، جرب تحليل repository:

```
https://github.com/ibrahimyousfi/shopify-microservice-react
```

يجب أن يعمل بدون مشاكل rate limiting.

## Troubleshooting

### المشكلة: لا يزال يعطي rate limit error

**الحل:**
1. تأكد من أن الـ token موجود في `.env.local`
2. تأكد من أن الـ token صحيح (يبدأ بـ `ghp_`)
3. أعد تشغيل الـ dev server
4. للـ Vercel: تأكد من إضافة الـ variable في جميع البيئات

### المشكلة: Repository not found

**الحل:**
1. تأكد من أن الـ repository **public**
2. تأكد من صحة الـ URL
3. تأكد من أن الـ token له صلاحية `public_repo`

### المشكلة: Token expired

**الحل:**
1. أنشئ token جديد
2. حدث الـ `.env.local` أو Vercel variables

## الأمان

⚠️ **مهم:**
- لا تضع الـ token في الكود
- لا ترفع `.env.local` إلى GitHub
- استخدم Vercel Environment Variables للـ production

## الفوائد

بعد إضافة الـ token:
- ✅ **5000 requests/hour** بدلاً من 60
- ✅ تحليل repositories كبيرة بدون مشاكل
- ✅ تجربة مستخدم أفضل
- ✅ Marathon Agent يعمل بشكل مستمر

---

**جاهز! الآن جرب تحليل الـ repository مرة أخرى.** 🚀
