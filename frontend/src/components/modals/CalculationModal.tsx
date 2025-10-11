
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import ModalCloseButton from '@/components/ui/ModalCloseButton';
import ConcreteForm from '@/components/forms/ConcreteForm';
import SteelForm from '@/components/forms/SteelForm';

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationType: 'concrete' | 'steel';
  category: string;
}

const CalculationModal = ({ isOpen, onClose, calculationType, category }: CalculationModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 sm:max-w-lg custom-dialog-overlay animate-modal-fade-in">
        <div className="relative"> 
          {calculationType === 'concrete' ? (
            <ConcreteForm category={category} />
          ) : (
            <SteelForm category={category} />
          )}
          <DialogClose asChild>
            <ModalCloseButton onClick={onClose} variant="default" size="sm" position="top-right" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalculationModal;

