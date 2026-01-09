"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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