"use client";
import { Card } from "@/components/ui/card";
import {
    ClipboardList,
    Users,
    TrendingUp,
    Shield,
    FileText,
    Calculator,
    Camera,
    AlertTriangle,
    CheckCircle,
    Award,
    BookOpen
} from "lucide-react";

export default function EngineeringGuidelinesPage() {
    const guidelines = [
        {
            title: "المهندس المعماري",
            icon: Camera,
            color: "text-indigo-600",
            bgColor: "bg-indigo-100",
            points: [
                "تصميم المخططات بكفاءة واستغلال المساحات وتوزيع الغرف والحمامات والمطبخ",
                "الالتزام بالقوانين والأنظمة المحلية والتنسيق مع التخصصات الأخرى",
                "استخدام مواد مستدامة وتحقيق كفاءة الطاقة في التصميم",
                "مراعاة الإضاءة الطبيعية والتهوية في التصميم",
            ],
            software: ["AutoCAD", "Revit", "SketchUp", "Lumion", "3ds Max + V-Ray"],
        },
        {
            title: "المهندس المدني",
            icon: Shield,
            color: "text-slate-600",
            bgColor: "bg-slate-100",
            points: [
                "دراسة التربة واختيار نظام الأساسات المناسب",
                "تصميم الهيكل الإنشائي لضمان الاستقرار والسلامة",
                "الإشراف على التنفيذ والتأكد من جودة المواد والعزل",
                "متابعة اختبارات الخرسانة والتربة والتأكد من مطابقتها للمواصفات",
            ],
            software: ["SAP2000", "ETABS", "SAFE", "Civil 3D", "Revit Structure", "STAAD.Pro"],
        },
        {
            title: "المهندس الكهربائي",
            icon: TrendingUp,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
            points: [
                "توزيع الأحمال الكهربائية بكفاءة وأمان على جميع الدوائر",
                "تركيب أنظمة الحماية والإنذار والطاقة البديلة (الطاقة الشمسية)",
                "تصميم إضاءة موفرة للطاقة والتأكد من سلامة التوصيلات",
                "التنسيق مع التخصصات الأخرى لتجنب التعارضات في التمديدات",
            ],
            software: ["AutoCAD Electrical", "ETAP", "Dialux", "Ecodial", "Revit MEP"],
        },
        {
            title: "المهندس الميكانيكي",
            icon: Calculator,
            color: "text-teal-600",
            bgColor: "bg-teal-100",
            points: [
                "تصميم أنظمة التكييف والتهوية بكفاءة عالية",
                "تنفيذ أنظمة السباكة والصرف الصحي بشكل صحيح",
                "تركيب أنظمة إطفاء الحريق والسلامة العامة",
                "التأكد من الاستدامة وكفاءة استهلاك الطاقة في الأنظمة",
            ],
            software: ["AutoCAD MEP", "Revit MEP", "HAP", "Elite Chvac", "FluidSIM"],
        },
        {
            title: "إدارة المشروع الفعالة",
            icon: ClipboardList,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            points: [
                "ضع خطة زمنية واقعية ومفصلة لجميع مراحل المشروع",
                "حدد المهام الحرجة وأولوياتها في المسار الزمني",
                "راقب التقدم اليومي وقارنه بالجدول الزمني المخطط",
                "وثق جميع التغييرات والقرارات المهمة في المشروع",
                "عقد اجتماعات دورية مع فريق العمل لمتابعة التقدم",
            ],
        },
        {
            title: "التنسيق بين التخصصات",
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            points: [
                "التنسيق المستمر بين جميع التخصصات الهندسية لتجنب التعارضات",
                "عقد اجتماعات تنسيقية دورية بين المعماري والمدني والكهرباء والميكانيك",
                "مراجعة المخططات المجمعة للتأكد من عدم وجود تداخلات",
                "توثيق جميع القرارات التنسيقية والتعديلات المتفق عليها",
            ],
        },
        {
            title: "التواصل مع المالك",
            icon: BookOpen,
            color: "text-rose-600",
            bgColor: "bg-rose-100",
            points: [
                "قدم تقارير دورية واضحة ومفصلة عن تقدم العمل",
                "اشرح القرارات الفنية بلغة مفهومة للمالك",
                "أبلغ المالك فوراً بأي تأخيرات أو مشاكل محتملة",
                "استشر المالك في القرارات التي تؤثر على الميزانية أو التصميم",
                "احتفظ بسجل موثق لجميع الموافقات والتغييرات",
            ],
        },
        {
            title: "مراقبة الجودة",
            icon: Shield,
            color: "text-red-600",
            bgColor: "bg-red-100",
            points: [
                "تأكد من مطابقة المواد للمواصفات المعتمدة قبل الاستخدام",
                "راجع جودة التنفيذ في كل مرحلة قبل الانتقال للمرحلة التالية",
                "وثق أي عيوب أو مخالفات واطلب تصحيحها فوراً",
                "أجرِ اختبارات الجودة المطلوبة (خرسانة، تربة، عزل، الخ)",
                "لا توافق على إخفاء أي عمل غير مطابق للمواصفات",
            ],
        },
        {
            title: "إدارة التكاليف",
            icon: Calculator,
            color: "text-green-600",
            bgColor: "bg-green-100",
            points: [
                "احتفظ بسجل دقيق لجميع الكميات المنفذة والمواد المستخدمة",
                "راجع فواتير المواد والمقاولين بدقة قبل الموافقة",
                "قارن التكاليف الفعلية بالميزانية المقدرة بانتظام",
                "نبّه المالك مبكراً إذا كانت هناك زيادة محتملة في التكاليف",
                "وثق جميع الأعمال الإضافية واحصل على موافقة المالك",
            ],
        },
        {
            title: "السلامة في الموقع",
            icon: AlertTriangle,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
            points: [
                "تأكد من توفر معدات السلامة الشخصية لجميع العمال",
                "ضع لافتات تحذيرية في المناطق الخطرة",
                "افحص السقالات والمعدات بانتظام للتأكد من سلامتها",
                "تأكد من وجود خطة للطوارئ ومعدات إطفاء الحرائق",
                "أوقف العمل فوراً إذا لاحظت أي خطر على السلامة",
            ],
        },
        {
            title: "التوثيق والتقارير",
            icon: FileText,
            color: "text-cyan-600",
            bgColor: "bg-cyan-100",
            points: [
                "التقط صوراً توثيقية لجميع مراحل العمل قبل وبعد التنفيذ",
                "احتفظ بنسخ من: المخططات، التعديلات، الموافقات، والفواتير",
                "أعد تقارير شهرية شاملة عن التقدم والتكاليف",
                "وثق جميع الاجتماعات والقرارات المتخذة",
                "احتفظ بسجل للطقس والظروف التي أثرت على العمل",
            ],
        },
        {
            title: "التفتيش النهائي والتسليم",
            icon: Award,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            points: [
                "أجرِ تفتيشاً شاملاً لجميع الأعمال قبل التسليم",
                "أعد قائمة بأي نواقص أو أعمال تحتاج تصحيح (Punch List)",
                "تأكد من اكتمال جميع الأعمال الكهربائية والميكانيكية والصحية",
                "اجمع شهادات الاختبارات والضمانات من المقاولين",
                "سلّم المالك كافة المستندات والمخططات النهائية (As-Built)",
            ],
        },
    ];

    const importantNotes = [
        {
            text: "المهنية والأمانة هما أساس نجاحك كمهندس - لا تتساهل في الجودة أبداً",
            type: "warning",
        },
        {
            text: "التنسيق بين التخصصات الهندسية المختلفة ضروري لتجنب التعارضات والمشاكل",
            type: "success",
        },
        {
            text: "التواصل الجيد مع المالك وفريق العمل يمنع معظم المشاكل قبل حدوثها",
            type: "success",
        },
        {
            text: "الالتزام بالمواصفات القياسية وفحص الجودة في كل مرحلة أمر حتمي",
            type: "success",
        },
        {
            text: "وثق كل شيء - التوثيق الجيد يحميك ويحمي المشروع",
            type: "success",
        },
        {
            text: "مراعاة الأمان والاستدامة وكفاءة الطاقة في جميع مراحل التصميم والتنفيذ",
            type: "success",
        },
    ];

    return (
        <div className="space-y-8 text-right">
            {/* Header */}
            <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-xl border-2 border-indigo-200">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-4 bg-indigo-100 rounded-full">
                            <BookOpen className="h-10 w-10 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900">
                                إرشادات المهندس المحترف
                            </h1>
                            <p className="text-lg text-gray-600 mt-2">
                                دليلك الشامل لإدارة المشاريع الإنشائية بنجاح
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Important Notes */}
            <Card className="shadow-lg border-2 border-yellow-200 bg-yellow-50/50">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                        <AlertTriangle className="h-7 w-7 text-yellow-600" />
                        نقاط مهمة جداً
                    </h2>
                    <div className="space-y-4">
                        {importantNotes.map((note, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-4 rounded-lg ${note.type === "warning"
                                    ? "bg-yellow-100 border-2 border-yellow-300"
                                    : "bg-green-100 border-2 border-green-300"
                                    }`}
                            >
                                {note.type === "warning" ? (
                                    <AlertTriangle className="h-6 w-6 text-yellow-700 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <CheckCircle className="h-6 w-6 text-green-700 flex-shrink-0 mt-0.5" />
                                )}
                                <p className="text-gray-800 font-medium leading-relaxed">{note.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Guidelines Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {guidelines.map((section, index) => {
                    const Icon = section.icon;
                    return (
                        <Card
                            key={index}
                            className="shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                        >
                            <div className={`p-4 ${section.bgColor} border-b-2 ${section.color.replace("text", "border")}`}>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-white">
                                        <Icon className={`h-6 w-6 ${section.color}`} />
                                    </div>
                                    {section.title}
                                </h2>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4">
                                    {section.points.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <CheckCircle className={`h-5 w-5 ${section.color} flex-shrink-0 mt-1`} />
                                            <span className="text-gray-700 leading-relaxed">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                                {section.software && (
                                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-700 mb-3">البرامج المستخدمة:</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {section.software.map((soft, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`px-3 py-1 ${section.bgColor} ${section.color} text-sm font-medium rounded-full border ${section.color.replace("text", "border")}`}
                                                >
                                                    {soft}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Footer Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg border-2 border-blue-200">
                <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        🏗️ المهندس الناجح
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
                        المهندس الناجح هو من يجمع بين الخبرة الفنية، والمهنية العالية، والتواصل
                        الفعال. تذكر دائماً أن جودة عملك هي سمعتك، والأمانة في التنفيذ هي ما يميزك
                        كمهندس محترف. استثمر في التعلم المستمر ولا تتوقف عن تطوير مهاراتك.
                    </p>
                    <div className="mt-6 flex justify-center gap-4 flex-wrap">
                        <div className="bg-white px-6 py-3 rounded-full shadow-md">
                            <span className="text-gray-600 font-semibold">✅ احترافية</span>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-full shadow-md">
                            <span className="text-gray-600 font-semibold">✅ أمانة</span>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-full shadow-md">
                            <span className="text-gray-600 font-semibold">✅ جودة</span>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-full shadow-md">
                            <span className="text-gray-600 font-semibold">✅ تواصل</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}