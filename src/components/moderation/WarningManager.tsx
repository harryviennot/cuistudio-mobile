import React, { useRef, useEffect, useState, useCallback } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { WarningModal } from "./WarningModal";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/api/services/auth.service";
import type { UserWarning } from "@/types/auth";

/**
 * WarningManager component
 *
 * Monitors the user's unacknowledged warnings and displays them
 * as blocking modals that must be acknowledged before proceeding.
 *
 * Place this component inside the AuthProvider and BottomSheetModalProvider
 * in the root layout.
 */
export function WarningManager() {
  const { user, refreshUser, authStatus } = useAuth();
  const modalRef = useRef<BottomSheetModal>(null);
  const [currentWarning, setCurrentWarning] = useState<UserWarning | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const hasPresented = useRef(false);

  // Get the first unacknowledged warning (if any)
  useEffect(() => {
    // Only show warnings for fully authenticated users (not during onboarding)
    if (authStatus === "authenticated" && user?.unacknowledged_warnings?.length) {
      setCurrentWarning(user.unacknowledged_warnings[0]);
    } else {
      setCurrentWarning(null);
      hasPresented.current = false;
    }
  }, [user?.unacknowledged_warnings, authStatus]);

  // Present modal when there's a warning to show
  useEffect(() => {
    if (currentWarning && !hasPresented.current) {
      // Small delay to ensure the modal provider is ready
      const timer = setTimeout(() => {
        modalRef.current?.present();
        hasPresented.current = true;
      }, 100);
      return () => clearTimeout(timer);
    } else if (!currentWarning) {
      modalRef.current?.dismiss();
      hasPresented.current = false;
    }
  }, [currentWarning]);

  const handleAcknowledge = useCallback(async () => {
    if (!currentWarning) return;

    setIsAcknowledging(true);
    try {
      await authService.acknowledgeWarning(currentWarning.id);
      // Refresh user to get updated warnings list
      await refreshUser();
    } catch (error) {
      console.error("Failed to acknowledge warning:", error);
      // Still try to refresh user state even on error
      try {
        await refreshUser();
      } catch {
        // Ignore refresh errors
      }
    } finally {
      setIsAcknowledging(false);
    }
  }, [currentWarning, refreshUser]);

  // Don't render anything if there's no warning
  if (!currentWarning) {
    return null;
  }

  return (
    <WarningModal
      ref={modalRef}
      warning={currentWarning}
      onAcknowledge={handleAcknowledge}
      isLoading={isAcknowledging}
    />
  );
}
