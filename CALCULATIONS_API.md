# Calculations API - Next.js Routes

## التغييرات

تم نقل API endpoints للحسابات (الباطون والحديد) من سيرفر منفصل (بورت 3001) إلى Next.js API Routes التي تعمل على نفس بورت الموقع (3000).

## الملفات الجديدة

تم إنشاء Next.js API Routes في:
- `frontend/src/app/api/calculations/concrete/route.ts` - حساب كميات الباطون
- `frontend/src/app/api/calculations/steel/route.ts` - حساب كميات الحديد
- `frontend/src/app/api/calculations/cost-estimation/route.ts` - تقدير التكلفة
- `frontend/src/app/api/calculations/generate-cost-report/route.ts` - إنشاء تقرير التكلفة
- `frontend/src/app/api/calculations/health/route.ts` - فحص حالة الخادم

## المزايا

1. ✅ **لا حاجة لسيرفر منفصل**: تعمل الحسابات على نفس بورت الموقع (3000)
2. ✅ **أسرع**: لا حاجة للاتصال عبر الشبكة
3. ✅ **أسهل في النشر**: كل شيء في مكان واحد
4. ✅ **أقل تعقيداً**: لا حاجة لإدارة سيرفر منفصل

## الاستخدام

لا حاجة لتغيير أي شيء في الكود! API client (`frontend/src/lib/api.ts`) تم تحديثه تلقائياً لاستخدام المسارات المحلية.

### Endpoints المتاحة:

- `POST /api/calculations/concrete` - حساب كميات الباطون
- `POST /api/calculations/steel` - حساب كميات الحديد
- `POST /api/calculations/cost-estimation` - تقدير التكلفة
- `POST /api/calculations/generate-cost-report` - إنشاء تقرير التكلفة
- `GET /api/calculations/health` - فحص حالة الخادم

## مثال على الاستخدام

```typescript
import { apiClient } from '@/lib/api';

// حساب كميات الباطون
const result = await apiClient.calculateConcrete({
  projectArea: 200,
  floors: 3,
  foundationDepth: 1.5,
  wallThickness: 0.2,
  slabThickness: 0.15
});

// حساب كميات الحديد
const steelResult = await apiClient.calculateSteel({
  concreteVolume: 100,
  steelRatio: 80 // kg/m³
});
```

## ملاحظات

- جميع الحسابات تعمل الآن محلياً على نفس بورت الموقع
- لا حاجة لتشغيل سيرفر منفصل على بورت 3001
- السيرفر القديم (`backend/routes/calculations.js`) لا يزال موجوداً لكن غير مستخدم

## الاختبار

بعد تشغيل الموقع، يمكنك اختبار الـ API:

```bash
# Health check
curl http://localhost:3000/api/calculations/health

# Test concrete calculation
curl -X POST http://localhost:3000/api/calculations/concrete \
  -H "Content-Type: application/json" \
  -d '{"projectArea":200,"floors":3,"foundationDepth":1.5,"wallThickness":0.2,"slabThickness":0.15}'
```

