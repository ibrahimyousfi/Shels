# 📚 دليل إعداد GitHub Wiki للوثائق

## 🎯 الهدف

جعل ملفات الوثائق (مثل ARCHITECTURE.md) تظهر كـ **tabs** منفصلة في GitHub.

---

## ✅ الحل 1: GitHub Wiki (الأسهل والأسرع)

### الخطوات:

#### 1. تفعيل Wiki
1. اذهب إلى: `https://github.com/ibrahimyousfi/Shels`
2. اضغط على **Settings** (الإعدادات)
3. في القائمة الجانبية، ابحث عن **Features**
4. فعّل **Wiki** ✅
5. احفظ التغييرات

#### 2. إنشاء صفحات Wiki

بعد التفعيل، ستجد تبويب **Wiki** بجانب Code, Issues, Pull requests.

**أنشئ الصفحات التالية:**

1. **Home** (الصفحة الرئيسية)
   ```
   # 🐚 Shels Documentation
   
   Welcome to the Shels Wiki!
   
   ## 📖 Pages
   - [[Architecture]] - Technical architecture
   - [[Features]] - Feature list
   - [[Installation]] - Setup guide
   - [[Comparison]] - Tool comparisons
   - [[Hackathon]] - Hackathon details
   - [[Use-Cases]] - Use cases
   ```

2. **Architecture**
   - انسخ محتوى `ARCHITECTURE.md` بالكامل

3. **Features**
   - انسخ محتوى `FEATURES.md` بالكامل

4. **Installation**
   - انسخ محتوى `INSTALLATION.md` بالكامل

5. **Comparison**
   - انسخ محتوى `COMPARISON.md` بالكامل

6. **Hackathon**
   - انسخ محتوى `HACKATHON.md` بالكامل

7. **Use-Cases**
   - انسخ محتوى `USE_CASES.md` بالكامل

#### 3. تحديث README

أضف رابط Wiki في README.md:

```markdown
## 📚 Documentation

- **[📖 Wiki](https://github.com/ibrahimyousfi/Shels/wiki)** - Complete documentation with tabs
- **[✨ Features](FEATURES.md)** - Feature list
- ...
```

---

## ✅ الحل 2: GitHub Pages (أكثر احترافية)

### الخطوات:

#### 1. إنشاء مجلد `docs/`
```bash
mkdir docs
```

#### 2. نقل ملفات الوثائق
```bash
mv ARCHITECTURE.md FEATURES.md INSTALLATION.md docs/
```

#### 3. إنشاء `docs/index.md`
```markdown
# Shels Documentation

- [Architecture](ARCHITECTURE.md)
- [Features](FEATURES.md)
- [Installation](INSTALLATION.md)
```

#### 4. تفعيل GitHub Pages
1. Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / `docs`
4. Save

#### 5. النتيجة
- سيظهر tab **"Pages"** تلقائياً
- الوثائق ستكون على: `https://ibrahimyousfi.github.io/Shels/`

---

## 📊 مقارنة الحلول

| الميزة | GitHub Wiki | GitHub Pages |
|--------|-------------|--------------|
| **سهولة الإعداد** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **ظهور Tab** | ✅ نعم | ✅ نعم |
| **منفصل عن الكود** | ✅ نعم | ✅ نعم |
| **يدعم Markdown** | ✅ نعم | ✅ نعم |
| **يدعم HTML/CSS** | ❌ محدود | ✅ كامل |
| **URL منفصل** | ✅ نعم | ✅ نعم |
| **يتطلب إعداد** | تفعيل فقط | إعداد Pages |

---

## 🎯 التوصية

**استخدم GitHub Wiki** لأنه:
- ✅ أسهل وأسرع
- ✅ يعطي tab منفصل
- ✅ منظم وسهل الاستخدام
- ✅ لا يحتاج إعداد معقد

---

## 📝 ملاحظات مهمة

1. **Wiki منفصل عن المستودع**: التعديلات في Wiki لا تظهر في Git history
2. **يمكن ربطه من README**: أضف رابط واضح
3. **يدعم Markdown كامل**: نفس الصيغة المستخدمة في `.md` files
4. **يمكن تحريره مباشرة**: من GitHub بدون clone

---

## 🚀 الخطوات السريعة

1. Settings → Features → Enable Wiki ✅
2. اضغط على tab **Wiki**
3. أنشئ صفحة **Home**
4. انسخ محتوى الملفات إلى صفحات Wiki
5. أضف رابط Wiki في README.md

**بعد 5 دقائق، ستجد tab Wiki بجانب Code! 🎉**
