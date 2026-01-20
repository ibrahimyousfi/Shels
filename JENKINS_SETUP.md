# Jenkins CI/CD Setup Guide for Shels

دليل شامل لإعداد Jenkins CI/CD pipeline لمشروع Shels.

## 📋 المتطلبات

### 1. تثبيت Jenkins

```bash
# على Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins

# على macOS
brew install jenkins-lts

# على Windows
# تحميل Jenkins من https://www.jenkins.io/download/
```

### 2. تثبيت Node.js

```bash
# تثبيت Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# أو باستخدام nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### 3. تثبيت Vercel CLI

```bash
npm install -g vercel@latest
```

## 🔧 إعداد Jenkins

### الخطوة 1: فتح Jenkins

1. افتح المتصفح واذهب إلى: `http://localhost:8080`
2. أدخل كلمة المرور الأولية (موجودة في `/var/lib/jenkins/secrets/initialAdminPassword`)
3. قم بتثبيت الـ plugins الموصى بها

### الخطوة 2: تثبيت Plugins المطلوبة

اذهب إلى **Manage Jenkins** → **Manage Plugins** وقم بتثبيت:

- ✅ **Pipeline** (مدمج عادة)
- ✅ **Git Plugin**
- ✅ **NodeJS Plugin**
- ✅ **HTML Publisher Plugin** (لـ ESLint reports)
- ✅ **Credentials Binding Plugin**

### الخطوة 3: إعداد Node.js في Jenkins

1. اذهب إلى **Manage Jenkins** → **Global Tool Configuration**
2. في قسم **NodeJS**:
   - Name: `NodeJS-20`
   - Version: اختر `20.x` أو أحدث
   - اضغط **Save**

### الخطوة 4: إضافة Credentials

اذهب إلى **Manage Jenkins** → **Manage Credentials** → **System** → **Global credentials**:

#### 1. Vercel Token
- **Kind**: Secret text
- **ID**: `vercel-token`
- **Secret**: [Vercel Token من حسابك]
- **Description**: Vercel deployment token

#### 2. Vercel Org ID
- **Kind**: Secret text
- **ID**: `vercel-org-id`
- **Secret**: [Vercel Organization ID]
- **Description**: Vercel organization ID

#### 3. Vercel Project ID
- **Kind**: Secret text
- **ID**: `vercel-project-id`
- **Secret**: [Vercel Project ID]
- **Description**: Vercel project ID

#### 4. Gemini API Key
- **Kind**: Secret text
- **ID**: `gemini-api-key`
- **Secret**: [Gemini API Key]
- **Description**: Google Gemini API key

> **ملاحظة**: للحصول على Vercel credentials:
> ```bash
> vercel login
> vercel link
> # سيعطيك Org ID و Project ID
> ```

## 🚀 إنشاء Pipeline

### الطريقة 1: من Jenkinsfile (موصى بها)

1. اذهب إلى **New Item**
2. أدخل اسم المشروع: `Shels-CI-CD`
3. اختر **Pipeline**
4. اضغط **OK**
5. في **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/ibrahimyousfi/Shels.git`
   - **Credentials**: أضف GitHub credentials إذا كان private
   - **Branch**: `*/main` أو `*/master`
   - **Script Path**: `react.wieps/Jenkinsfile`
6. اضغط **Save**

### الطريقة 2: Pipeline Script مباشر

انسخ محتوى `Jenkinsfile` والصقه في **Pipeline Script** section.

## 🔄 تشغيل Pipeline

### يدوياً:
1. اذهب إلى مشروع Jenkins
2. اضغط **Build Now**

### تلقائياً:
- عند push إلى `main` branch
- عند فتح Pull Request
- حسب الجدولة المحددة

## 📊 مراحل Pipeline

### 1. Checkout
- سحب الكود من GitHub

### 2. Install Dependencies
- تثبيت `node_modules` باستخدام `npm ci`

### 3. Lint
- تشغيل ESLint للتحقق من جودة الكود

### 4. Type Check
- فحص أنواع TypeScript

### 5. Build
- بناء Next.js application
- حفظ artifacts

### 6. Test
- تشغيل الاختبارات (عند إضافتها)

### 7. Deploy to Vercel
- النشر على Vercel production
- فقط على `main` أو `master` branch

## 🎯 إعدادات متقدمة

### إضافة Notifications

في `Jenkinsfile`، أضف في `post` section:

```groovy
post {
    success {
        slackSend(
            channel: '#deployments',
            color: 'good',
            message: "✅ Deployment successful: ${env.BUILD_URL}"
        )
    }
    failure {
        slackSend(
            channel: '#deployments',
            color: 'danger',
            message: "❌ Deployment failed: ${env.BUILD_URL}"
        )
    }
}
```

### إضافة Environment Variables

في Jenkins Job:
1. **Configure** → **Build Environment**
2. ✅ **Use secret text(s) or file(s)**
3. أضف variables:
   - `GEMINI_API_KEY` → `gemini-api-key`
   - `NEXT_PUBLIC_VERCEL_URL` → قيمة ثابتة

### إضافة Webhooks من GitHub

1. في GitHub repository:
   - **Settings** → **Webhooks** → **Add webhook**
   - **Payload URL**: `http://your-jenkins-url/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: اختر `Just the push event`
   - **Active**: ✅

2. في Jenkins:
   - **Configure** → **Build Triggers**
   - ✅ **GitHub hook trigger for GITScm polling**

## 🐛 Troubleshooting

### مشكلة: Node.js غير موجود
```bash
# تأكد من تثبيت Node.js plugin في Jenkins
# وأضف Node.js في Global Tool Configuration
```

### مشكلة: Vercel deployment فشل
```bash
# تأكد من:
# 1. Vercel CLI مثبت: npm install -g vercel
# 2. Credentials صحيحة
# 3. Vercel project linked
```

### مشكلة: Build فشل
```bash
# تحقق من:
# 1. Node.js version (يجب أن يكون 20+)
# 2. npm ci يعمل بشكل صحيح
# 3. Environment variables موجودة
```

## 📝 ملفات إضافية

### `.env.example` للـ Jenkins

أنشئ ملف `.env.jenkins`:

```env
NODE_ENV=production
GEMINI_API_KEY=your-key-here
NEXT_PUBLIC_VERCEL_URL=https://shels.vercel.app
```

## ✅ Checklist

- [ ] Jenkins مثبت ويعمل
- [ ] Node.js plugin مثبت
- [ ] Credentials مضافة (Vercel, Gemini)
- [ ] Jenkinsfile موجود في المشروع
- [ ] Pipeline يعمل بنجاح
- [ ] Deployment إلى Vercel يعمل
- [ ] Webhooks من GitHub تعمل

## 🔗 روابط مفيدة

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**جاهز للاستخدام! 🚀**
