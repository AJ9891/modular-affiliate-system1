"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button
} from '@/components/ai/consent-dialog-fixed';

export interface ConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
}

export default function ConsentDialog({ 
  isOpen, 
  onClose, 
  onConsent 
}: ConsentDialogProps) {
  const [hasConsented, setHasConsented] = useState(false);

  const handleConsent = () => {
    setHasConsented(true);
    onConsent();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Generation Consent</DialogTitle>
          <DialogDescription>
            Before we generate content for you, please review and accept our AI generation guidelines:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary">What we'll generate:</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Marketing copy tailored to your selected personality</li>
              <li>• Content suggestions based on your inputs</li>
              <li>• Funnel templates and variations</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary">Your data:</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• We'll process your inputs to generate relevant content</li>
              <li>• No personal data is stored permanently</li>
              <li>• Generated content belongs to you</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary">AI Guidelines:</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Content follows platform personality rules</li>
              <li>• No harmful, illegal, or misleading content</li>
              <li>• Review all generated content before use</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConsent}>
            Accept & Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple Button component (inline for now)
const Button = ({ 
  children, 
  onClick, 
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  [key: string]: any;
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50';
  const variantClasses = {
    default: 'bg-accent text-white hover:bg-accent/90',
    outline: 'border border-accent text-accent hover:bg-accent/10',
    ghost: 'text-text-secondary hover:bg-bg-surface'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Simple Dialog components (inline for now)
const Dialog = ({ 
  open, 
  onOpenChange, 
  children 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  children: React.ReactNode;
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-bg-surface border border-[var(--border-subtle)] rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6">{children}</div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-text-primary">{children}</h2>
);

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-text-secondary text-sm mt-2">{children}</p>
);

interface AIConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "generate" | "replace" | "suggest";
  description: string;
  onConfirm: () => void;
  onManualOverride: () => void;
}

export function AIConsentDialog({ 
  open, 
  onOpenChange, 
  action, 
  description, 
  onConfirm, 
  onManualOverride 
}: AIConsentDialogProps) {
  const actionLabels = {
    generate: "generate new content",
    replace: "replace existing content", 
    suggest: "provide suggestions"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>AI Content Action</DialogTitle>
          <DialogDescription>
            I can help {actionLabels[action]} for: {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            I can help with this, but you have the final say. How would you like to proceed?
          </p>
          
          <div className="flex flex-col gap-2">
            <Button onClick={onConfirm} className="w-full">
              ✨ Let AI Help ({actionLabels[action]})
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onManualOverride} 
              className="w-full"
            >
              ✋ I'll Handle This Manually
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing AI consent
export function useAIConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: "generate" | "replace" | "suggest";
    description: string;
    onConfirm: () => void;
    onManualOverride: () => void;
  } | null>(null);

  const requestConsent = (action: {
    type: "generate" | "replace" | "suggest";
    description: string;
    onConfirm: () => void;
    onManualOverride: () => void;
  }) => {
    // For preview actions, no consent needed
    if (action.type === "suggest") {
      action.onConfirm();
      return;
    }
    
    setCurrentAction(action);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (currentAction) {
      currentAction.onConfirm();
    }
    setIsOpen(false);
    setCurrentAction(null);
  };

  const handleManualOverride = () => {
    if (currentAction) {
      currentAction.onManualOverride();
    }
    setIsOpen(false);
    setCurrentAction(null);
  };

  const ConsentDialog = () => {
    if (!currentAction) return null;
    
    return (
      <AIConsentDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        action={currentAction.type}
        description={currentAction.description}
        onConfirm={handleConfirm}
        onManualOverride={handleManualOverride}
      />
    );
  };

  return {
    requestConsent,
    ConsentDialog
  };
}