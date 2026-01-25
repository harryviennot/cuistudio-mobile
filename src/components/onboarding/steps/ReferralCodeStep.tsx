/**
 * Referral Code Step
 *
 * Allows new users to enter a referral code during onboarding.
 * Both the referrer and referee get 5 bonus credits.
 */
import { useState, useCallback, useEffect } from "react";
import { View, Text, ActivityIndicator, TextInput, Keyboard } from "react-native";
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { GiftIcon, CheckCircleIcon, XCircleIcon } from "phosphor-react-native";

import { referralsService } from "@/api/services/referrals.service";
import { cn } from "@/utils/cn";

interface ReferralCodeStepProps {
  referralCode: string;
  onReferralCodeChange: (code: string) => void;
  onValidationChange: (isValid: boolean, referrerName?: string) => void;
}

export function ReferralCodeStep({
  referralCode,
  onReferralCodeChange,
  onValidationChange,
}: ReferralCodeStepProps) {
  const { t } = useTranslation();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidatedCode, setLastValidatedCode] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    referrerName?: string;
  } | null>(null);

  // Validate when code reaches 8 characters and is different from last check
  useEffect(() => {
    // Reset validation if code changes and doesn't match last validated
    if (referralCode !== lastValidatedCode) {
      setValidationResult(null);
    }

    // Empty or partial code is valid (optional field)
    if (referralCode.length < 8) {
      onValidationChange(true);
      return;
    }

    // Skip if we already validated this exact code
    if (referralCode === lastValidatedCode) {
      return;
    }

    const validate = async () => {
      setIsValidating(true);
      setLastValidatedCode(referralCode);
      try {
        const result = await referralsService.validate(referralCode);
        setValidationResult({
          isValid: result.is_valid,
          message: result.message,
          referrerName: result.referrer_name ?? undefined,
        });
        onValidationChange(result.is_valid, result.referrer_name ?? undefined);
        if (result.is_valid) {
          Keyboard.dismiss();
        }
      } catch (error) {
        console.error("[ReferralCodeStep] Validation error:", error);
        setValidationResult({
          isValid: false,
          message: "validation_error",
        });
        onValidationChange(true); // Don't block on network errors
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [referralCode, lastValidatedCode, onValidationChange]);

  const handleCodeChange = useCallback(
    (text: string) => {
      // Uppercase and remove spaces
      const cleanedCode = text.toUpperCase().replaceAll(/\s/g, "");
      onReferralCodeChange(cleanedCode);
    },
    [onReferralCodeChange]
  );

  const getValidationMessage = () => {
    if (!validationResult) return null;

    if (validationResult.isValid) {
      return t("onboarding.referral.validCode", {
        name: validationResult.referrerName || t("onboarding.referral.friend"),
      });
    }

    switch (validationResult.message) {
      case "code_not_found":
        return t("onboarding.referral.codeNotFound");
      case "cannot_use_own_code":
        return t("onboarding.referral.cannotUseOwnCode");
      case "already_used_referral":
        return t("onboarding.referral.alreadyUsedReferral");
      case "invalid_code_format":
        return t("onboarding.referral.invalidFormat");
      default:
        return t("onboarding.referral.validationError");
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ padding: 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Icon */}
      {/* <View className="mb-4 ">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <GiftIcon size={32} color="#2D5A27" weight="duotone" />
        </View>
      </View> */}

      {/* Title */}
      <Text
        className="mb-2  text-3xl text-foreground-heading"
        style={{ fontFamily: "PlayfairDisplay_700Bold" }}
      >
        {t("onboarding.referral.title")}
      </Text>
      <Text className="mb-8  text-base text-foreground-muted">
        {t("onboarding.referral.subtitle")}
      </Text>

      {/* Input */}
      <View className="mb-2">
        <View className="relative">
          <TextInput
            className={cn(
              "border-2",
              validationResult?.isValid
                ? "border-state-success"
                : validationResult && !validationResult.isValid
                  ? "border-state-error"
                  : "border-border"
            )}
            style={{
              backgroundColor: "white",
              borderRadius: 12,

              padding: 16,
              textAlign: "left",
              fontSize: 16,
              fontWeight: "normal",
              letterSpacing: 2,
            }}
            placeholder={t("onboarding.referral.placeholder")}
            placeholderTextColor="#a8a29e"
            value={referralCode}
            onChangeText={handleCodeChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
          />
          {isValidating && (
            <View className="absolute right-4 top-1/2 -translate-y-1/2">
              <ActivityIndicator size="small" color="#2D5A27" />
            </View>
          )}
          {!isValidating && validationResult && (
            <View className="absolute right-4 top-1/2 -translate-y-1/2">
              {validationResult.isValid ? (
                <CheckCircleIcon size={24} color="#16a34a" weight="fill" />
              ) : (
                <XCircleIcon size={24} color="#dc2626" weight="fill" />
              )}
            </View>
          )}
        </View>
      </View>

      {/* Validation message */}
      {validationResult && (
        <Text
          className={cn(
            "text-sm",
            validationResult.isValid ? "text-state-success" : "text-state-error"
          )}
        >
          {getValidationMessage()}
        </Text>
      )}

      {/* Skip hint
      <Text className="mt-4 text-sm text-foreground-muted">
        {t("onboarding.referral.skipHint")}
      </Text> */}

      {/* Bonus info */}
      <View className="mt-6 rounded-2xl bg-primary/5 p-4">
        <Text className=" text-sm text-foreground-secondary">
          {t("onboarding.referral.bonusInfo")}
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
}
