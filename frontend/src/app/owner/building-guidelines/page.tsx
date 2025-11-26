"use client";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ClipboardList,
    Gavel,
    Users,
    Hammer,
    ClipboardCheck,
    Home,
    Award,
    CheckCircle,
    Languages,
    Download
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function BuildingGuidelinesPage() {
    const [currentLang, setCurrentLang] = useState<'ar' | 'en'>('ar');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        displayNotification('مرحباً بك في دليل البناء الاحترافي');
    }, []);

    const displayNotification = (message: string) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const toggleLanguage = () => {
        if (currentLang === 'ar') {
            setCurrentLang('en');
            displayNotification('Language changed to English');
        } else {
            setCurrentLang('ar');
            displayNotification('تم تغيير اللغة إلى العربية');
        }
    };

    const downloadAsPDF = async () => {
        if (!contentRef.current) return;

        setIsGeneratingPdf(true);
        displayNotification(currentLang === 'ar' ? 'جاري إنشاء ملف PDF...' : 'Generating PDF file...');

        try {
            // استهداف المحتوى فقط (بدون الأزرار والإشعارات)
            const element = contentRef.current;

            // إعداد حجم الصفحة بناءً على اللغة
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // التقاط صورة للمحتوى
            const canvas = await html2canvas(element, {
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // عرض A4 بالـ mm
            const pageHeight = 295; // ارتفاع A4 بالـ mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // إضافة الصفحة الأولى
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // إضافة صفحات إضافية إذا لزم الأمر
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // حفظ الملف باسم مختلف حسب اللغة
            const fileName = currentLang === 'ar'
                ? 'ارشادات_صاحب_المبنى.pdf'
                : 'Building_Owner_Guidelines.pdf';

            pdf.save(fileName);
            displayNotification(currentLang === 'ar'
                ? 'تم تنزيل ملف PDF بنجاح'
                : 'PDF downloaded successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            displayNotification(currentLang === 'ar'
                ? 'حدث خطأ أثناء إنشاء ملف PDF'
                : 'Error occurred while generating PDF');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const content = {
        ar: {
            pageTitle: "إرشادات صاحب المبنى",
            langButton: "English",
            downloadButton: "تحميل PDF",
            cards: [
                {
                    icon: ClipboardList,
                    title: "التخطيط المبدئي",
                    items: [
                        "تحديد الميزانية: حساب التكاليف المتوقعة، بما في ذلك الأرض، المواد، العمالة، التراخيص، والتكاليف الإضافية.",
                        "اختيار الموقع: تحديد موقع مناسب بناءً على قربه من الخدمات، جودة التربة، وتوافر المرافق الأساسية.",
                        "وضع المخطط الهندسي: التعاون مع مهندس معماري أو مصمم لإنشاء مخطط يناسب احتياجاتك المستقبلية."
                    ]
                },
                {
                    icon: Gavel,
                    title: "الإجراءات القانونية والتراخيص",
                    items: [
                        "الحصول على التصاريح: التأكد من استخراج جميع التصاريح والتراخيص اللازمة من الجهات المختصة.",
                        "مراعاة قوانين البناء: التأكد من أن التصميم يلتزم بقوانين البلدية ومعايير البناء المحلية."
                    ]
                },
                {
                    icon: Users,
                    title: "اختيار فريق العمل",
                    items: [
                        "التعاقد مع مهندس معماري ومهندس إنشائي: لضمان تصميم مستدام وقوي.",
                        "اختيار مقاول موثوق: التحقق من سمعته، مشاريعه السابقة، والتزامه بالمواعيد.",
                        "التعاقد مع فنيين متخصصين: مثل السباكين، الكهربائيين، وعمال التشطيب."
                    ]
                },
                {
                    icon: Hammer,
                    title: "تنفيذ البناء",
                    items: [
                        "إعداد الأساسات: عمل فحوصات التربة ووضع الأساسات بشكل سليم لتجنب المشاكل المستقبلية.",
                        "بناء الهيكل: يشمل الجدران، الأعمدة، السقف، والنوافذ باستخدام مواد ذات جودة عالية.",
                        "التمديدات الكهربائية والسباكة: تنفيذ الأعمال الأساسية قبل إغلاق الجدران.",
                        "العزل: استخدام مواد عازلة للحرارة والرطوبة لتوفير الراحة وتقليل استهلاك الطاقة.",
                        "التشطيبات الداخلية والخارجية: مثل الدهانات، الأرضيات، الأبواب، والنوافذ."
                    ]
                },
                {
                    icon: ClipboardCheck,
                    title: "التفتيش والتسليم",
                    items: [
                        "إجراء فحص نهائي: التحقق من سلامة الهيكل والتمديدات وجودة التشطيبات.",
                        "التأكد من مطابقة المخطط: التأكد من أن كل شيء تم وفق المخططات والتصميمات المتفق عليها.",
                        "إعداد قائمة بالملاحظات (إن وجدت): طلب من المقاول تصحيح أي أخطاء قبل الاستلام النهائي."
                    ]
                },
                {
                    icon: Home,
                    title: "السكن والصيانة",
                    items: [
                        "تجهيز الأثاث والمرافق: فرش المنزل وتزويده بجميع المستلزمات الأساسية.",
                        "وضع خطة صيانة دورية: تفقد أنظمة السباكة والكهرباء والتكييف بانتظام لضمان عدم حدوث مشاكل مستقبلية."
                    ]
                }
            ],
            licensing: {
                title: "الترخيص",
                sectionA: {
                    title: "أ- إصدار الترخيص:",
                    steps: [
                        "إعداد مخطط المساحة بواسطة مساح مرخص.",
                        "موافقة الجيران على المخطط.",
                        "إضافة الارتداد في قسم الترخيص بالبلدية.",
                        {
                            text: "تصديق المخطط من الجهات المختصة:",
                            subItems: [
                                "دائرة التنظيم والبناء",
                                "سلطة الأراضي",
                                "دائرة الآثار",
                                "حارس أملاك الغائبين والمغتربين"
                            ]
                        }
                    ]
                },
                sectionB: {
                    title: "ب- فحص التربة:",
                    text: "يتم في مختبر متخصص إذا لزم الأمر."
                },
                sectionC: {
                    title: "ت- تجهيز المخططات الهندسية:",
                    intro: "إعداد المخططات بواسطة:",
                    engineers: [
                        "مهندس معماري",
                        "مهندس مدني",
                        "مهندس ميكانيكي",
                        "مهندس كهرباء"
                    ],
                    note: "تحديد مخطط البناء وتوزيع الغرف حسب مساحة البناء وإسقاطه على مخطط المساحة."
                }
            }
        },
        en: {
            pageTitle: "Building Owner Guidelines",
            langButton: "العربية",
            downloadButton: "Download PDF",
            cards: [
                {
                    icon: ClipboardList,
                    title: "Initial Planning",
                    items: [
                        "Budgeting: Estimate all costs, including land, materials, labor, permits, and additional expenses.",
                        "Site Selection: Choose a suitable location based on proximity to services, soil quality, and availability of utilities.",
                        "Architectural Planning: Collaborate with an architect or designer to create a plan that fits your future needs."
                    ]
                },
                {
                    icon: Gavel,
                    title: "Legal Procedures and Permits",
                    items: [
                        "Obtaining Permits: Ensure all necessary permits and approvals are obtained from relevant authorities.",
                        "Compliance with Building Codes: Make sure design adheres to local building codes and regulations."
                    ]
                },
                {
                    icon: Users,
                    title: "Hiring Team",
                    items: [
                        "Hire an Architect and Civil Engineer: To ensure a sustainable and strong design.",
                        "Select a Reliable Contractor: Check their reputation, previous projects, and adherence to deadlines.",
                        "Hire Specialized Technicians: Such as plumbers, electricians, and finishing workers."
                    ]
                },
                {
                    icon: Hammer,
                    title: "Construction Execution",
                    items: [
                        "Foundation Work: Conduct soil tests and lay foundations properly to avoid future problems.",
                        "Building Structure: Construct walls, columns, roof, and windows using high-quality materials.",
                        "Electrical and Plumbing Installations: Complete these before closing walls.",
                        "Insulation: Use thermal and moisture-insulating materials to improve comfort and energy efficiency.",
                        "Interior and Exterior Finishes: Including paint, flooring, doors, and windows."
                    ]
                },
                {
                    icon: ClipboardCheck,
                    title: "Inspection and Handover",
                    items: [
                        "Final Inspection: Check structural safety, installations, and finishing quality.",
                        "Ensure Plan Compliance: Confirm that all work follows agreed-upon plans and designs.",
                        "Prepare Punch List (if any): Ask contractor to fix any issues before final handover."
                    ]
                },
                {
                    icon: Home,
                    title: "Occupancy and Maintenance",
                    items: [
                        "Furnishing and Amenities: Set up house and provide essential utilities.",
                        "Periodic Maintenance Plan: Regularly check plumbing, electrical, and HVAC systems to prevent future problems."
                    ]
                }
            ],
            licensing: {
                title: "Licensing",
                sectionA: {
                    title: "A- Issuing the License:",
                    steps: [
                        "Prepare the plot plan by a licensed surveyor.",
                        "Obtain neighbors' approval.",
                        "Add setbacks at the municipality's licensing department.",
                        {
                            text: "Get the plan approved by relevant authorities:",
                            subItems: [
                                "Planning and Building Department",
                                "Land Authority",
                                "Antiquities Department",
                                "Custodian of Absent and Expatriate Properties"
                            ]
                        }
                    ]
                },
                sectionB: {
                    title: "B- Soil Testing:",
                    text: "Conducted in specialized labs if required."
                },
                sectionC: {
                    title: "C- Preparing Engineering Plans:",
                    intro: "Prepared by:",
                    engineers: [
                        "Architect",
                        "Civil Engineer",
                        "Mechanical Engineer",
                        "Electrical Engineer"
                    ],
                    note: "The building plan and room layout are determined according to the required building area and projected on the plot plan."
                }
            }
        }
    };

    const currentContent = content[currentLang];

    return (
        <div className="space-y-8 text-right" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header with Language Toggle and Download Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-extrabold text-gray-900">
                    {currentContent.pageTitle}
                </h1>
                <div className="flex gap-3">
                    <Button
                        onClick={downloadAsPDF}
                        disabled={isGeneratingPdf}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg disabled:opacity-70"
                    >
                        {isGeneratingPdf ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                {currentLang === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5" />
                                {currentContent.downloadButton}
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={toggleLanguage}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
                    >
                        <Languages className="h-5 w-5" />
                        {currentContent.langButton}
                    </Button>
                </div>
            </div>

            {/* Content to be exported to PDF */}
            <div ref={contentRef} className="space-y-8">
                {/* Main Cards */}
                {currentContent.cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4 pb-3 border-b-2 border-gray-200">
                                    <Icon className="h-8 w-8 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-gray-800">{card.title}</h2>
                                </div>
                                <ul className="space-y-3">
                                    {card.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                                            <span className="text-gray-700 leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    );
                })}

                {/* Licensing Section */}
                <Card className="shadow-lg">
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6 pb-3 border-b-2 border-gray-200">
                            <Award className="h-8 w-8 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-800">{currentContent.licensing.title}</h2>
                        </div>

                        {/* Section A */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                {currentContent.licensing.sectionA.title}
                            </h3>
                            <ol className="space-y-3" style={{ counterReset: 'step-counter' }}>
                                {currentContent.licensing.sectionA.steps.map((step, idx) => (
                                    <li
                                        key={idx}
                                        className="relative"
                                        style={{
                                            counterIncrement: 'step-counter',
                                            paddingLeft: currentLang === 'ar' ? '0' : '2.5rem',
                                            paddingRight: currentLang === 'ar' ? '2.5rem' : '0'
                                        }}
                                    >
                                        <span
                                            className="absolute top-0 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                                            style={{
                                                left: currentLang === 'ar' ? 'auto' : '0',
                                                right: currentLang === 'ar' ? '0' : 'auto'
                                            }}
                                        >
                                            {idx + 1}
                                        </span>
                                        {typeof step === 'string' ? (
                                            <span className="text-gray-700">{step}</span>
                                        ) : (
                                            <>
                                                <span className="text-gray-700">{step.text}</span>
                                                <ul className="mt-2 mr-4 space-y-1">
                                                    {step.subItems?.map((subItem, subIdx) => (
                                                        <li key={subIdx} className="flex items-start gap-2 text-gray-600">
                                                            <span className="text-blue-600 font-bold">•</span>
                                                            {subItem}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Section B */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {currentContent.licensing.sectionB.title}
                            </h3>
                            <p className="text-gray-700">{currentContent.licensing.sectionB.text}</p>
                        </div>

                        {/* Section C */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {currentContent.licensing.sectionC.title}
                            </h3>
                            <p className="text-gray-700 mb-3">{currentContent.licensing.sectionC.intro}</p>
                            <ol className="space-y-2 mb-3" style={{ counterReset: 'eng-counter' }}>
                                {currentContent.licensing.sectionC.engineers.map((engineer, idx) => (
                                    <li
                                        key={idx}
                                        className="relative"
                                        style={{
                                            counterIncrement: 'eng-counter',
                                            paddingLeft: currentLang === 'ar' ? '0' : '2.5rem',
                                            paddingRight: currentLang === 'ar' ? '2.5rem' : '0'
                                        }}
                                    >
                                        <span
                                            className="absolute top-0 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                                            style={{
                                                left: currentLang === 'ar' ? 'auto' : '0',
                                                right: currentLang === 'ar' ? '0' : 'auto'
                                            }}
                                        >
                                            {idx + 1}
                                        </span>
                                        <span className="text-gray-700">{engineer}</span>
                                    </li>
                                ))}
                            </ol>
                            <p className="text-gray-700 italic">{currentContent.licensing.sectionC.note}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Notification */}
            {showNotification && (
                <div
                    className={`fixed bottom-5 ${currentLang === 'ar' ? 'left-5' : 'right-5'} bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-10`}
                >
                    {notificationMessage}
                </div>
            )}
        </div>
    );
}