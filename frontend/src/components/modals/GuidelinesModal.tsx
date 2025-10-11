
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'engineer' | 'owner';
}

const engineerGuidelines = [
  "تأكد من مراجعة المخططات الإنشائية بدقة قبل البدء بأي حسابات.",
  "استخدم معايير السلامة والأكواد الإنشائية المعتمدة في المنطقة.",
  "راعي نسبة الهدر في المواد (عادة 5-10% للباطون و 3-5% للحديد).",
  "تحقق من مواصفات المواد مع الموردين قبل الطلب.",
  "سجل جميع الحسابات والقياسات للرجوع إليها لاحقاً.",
  "راعي ظروف الموقع والعوامل الجوية في التخطيط.",
  "تواصل مع صاحب العمل لتوضيح أي تفاصيل قد تؤثر على التكلفة أو الجدول الزمني."
];

const ownerGuidelines = [
  "تأكد من أن المهندس المعتمد هو من يقوم بالحسابات والتصميم.",
  "اطلب شرحاً مبسطاً للحسابات والكميات المطلوبة.",
  "قارن بين عروض الأسعار من عدة موردين.",
  "تأكد من جودة المواد المستخدمة ومواصفاتها.",
  "احتفظ بنسخة من جميع الحسابات والمستندات.",
  "خطط لمخزن مؤقت للمواد لحمايتها من التلف.",
  "راعي وجود هامش إضافي (10-15%) للطوارئ في الميزانية."
];

const GuidelinesModal = ({ isOpen, onClose, type }: GuidelinesModalProps) => {
  if (!isOpen) return null;

  const title = type === 'engineer' ? 'إرشادات للمهندس' : 'إرشادات لصاحب المبنى';
  const guidelines = type === 'engineer' ? engineerGuidelines : ownerGuidelines;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-content-gradient text-white sm:max-w-lg animate-modal-fade-in custom-dialog-overlay p-6">
        <DialogHeader className="relative">
          <DialogTitle className="text-white text-2xl text-center mb-4">{title}</DialogTitle>
          <DialogClose asChild>
            <ModalCloseButton onClick={() => {}} variant="text" size="sm" position="top-right" className="text-white" />
          </DialogClose>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="py-2 text-right text-white/95 text-base leading-relaxed">
            <ol className="list-decimal list-inside space-y-2.5 pr-4">
              {guidelines.map((guideline, index) => (
                <li key={index}>{guideline}</li>
              ))}
            </ol>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default GuidelinesModal;

