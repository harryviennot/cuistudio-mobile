import "@/global.css";
import { View, Text, Pressable, TextInput, ScrollView, useWindowDimensions } from "react-native";
import { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useDeviceType } from "@/hooks/useDeviceType";
import { ShadowItem } from "@/components/ShadowedSection";
import { PremiumBottomSheet } from "@/components/ui/PremiumBottomSheet";
import {
  useSubmitContentReport,
  useSubmitExtractionFeedback,
  useReportReasons,
  useFeedbackCategories,
} from "@/hooks/useReportRecipe";
import {
  ContentReportReason,
  ExtractionFeedbackCategory,
  type ContentReportRequest,
  type ExtractionFeedbackRequest,
} from "@/types/report";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ReportStep = "select" | "content" | "extraction";

interface ReportBottomSheetProps {
  visible: boolean;
  recipeId: string;
  recipeTitle: string;
  extractionJobId?: string;
  onClose: () => void;
}

export function ReportBottomSheet({
  visible,
  recipeId,
  recipeTitle,
  extractionJobId,
  onClose,
}: ReportBottomSheetProps) {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { isTablet } = useDeviceType();
  const { height: screenHeight } = useWindowDimensions();
  // Max scroll height: 50% of screen minus safe area, gives room for header + buttons
  const maxScrollHeight = (screenHeight - top) * 0.65;

  const [step, setStep] = useState<ReportStep>("select");
  const [selectedReason, setSelectedReason] = useState<ContentReportReason | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExtractionFeedbackCategory | null>(null);
  const [description, setDescription] = useState("");

  // Queries
  const { data: reportReasonsData } = useReportReasons();
  const { data: feedbackCategoriesData } = useFeedbackCategories();

  // Mutations
  const submitContentReport = useSubmitContentReport();
  const submitExtractionFeedback = useSubmitExtractionFeedback();

  const isSubmitting = submitContentReport.isPending || submitExtractionFeedback.isPending;

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    // Reset state
    setStep("select");
    setSelectedReason(null);
    setSelectedCategory(null);
    setDescription("");
    onClose();
  }, [onClose]);

  const handleSubmitContentReport = useCallback(async () => {
    if (!selectedReason) return;

    const data: ContentReportRequest = {
      recipe_id: recipeId,
      reason: selectedReason,
      description: description.trim() || undefined,
    };

    submitContentReport.mutate(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  }, [recipeId, selectedReason, description, submitContentReport, handleClose]);

  const handleSubmitExtractionFeedback = useCallback(async () => {
    if (!selectedCategory) return;

    const data: ExtractionFeedbackRequest = {
      recipe_id: recipeId,
      category: selectedCategory,
      description: description.trim() || undefined,
      extraction_job_id: extractionJobId,
    };

    submitExtractionFeedback.mutate(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  }, [
    recipeId,
    selectedCategory,
    description,
    extractionJobId,
    submitExtractionFeedback,
    handleClose,
  ]);

  const renderSelectStep = () => (
    <View className={`${isTablet ? "px-10" : "px-6"} gap-4`}>
      <Pressable
        onPress={() => setStep("content")}
        className="flex-row items-center gap-4 rounded-2xl border border-border bg-surface-elevated p-5 active:bg-surface"
      >
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-state-error/15">
          <Ionicons name="warning-outline" size={24} color="#c65d47" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-medium text-foreground-heading">
            {t("report.content.title", "Report Content")}
          </Text>
          <Text className="text-sm text-foreground-muted mt-0.5">
            {t("report.content.subtitle", "Inappropriate, offensive, or policy violation")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
      </Pressable>

      <Pressable
        onPress={() => setStep("extraction")}
        className="flex-row items-center gap-4 rounded-2xl border border-border bg-surface-elevated p-5 active:bg-surface"
      >
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-state-warning/30">
          <Ionicons name="construct-outline" size={24} color="#b8942d" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-medium text-foreground-heading">
            {t("report.extraction.title", "Report Extraction Issue")}
          </Text>
          <Text className="text-sm text-foreground-muted mt-0.5">
            {t("report.extraction.subtitle", "Wrong ingredients, missing steps, AI errors")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#a8a29e" />
      </Pressable>
    </View>
  );

  const getReportReasons = () => {
    const values = reportReasonsData?.reasons?.map((r) => r.value) || defaultReportReasonValues;
    return values.map((value) => ({
      value,
      label: t(`report.reasons.${value}.label` as never) as string,
      description: t(`report.reasons.${value}.description` as never) as string,
    }));
  };

  const getFeedbackCategories = () => {
    const values =
      feedbackCategoriesData?.categories?.map((c) => c.value) || defaultFeedbackCategoryValues;
    return values.map((value) => ({
      value,
      label: t(`report.feedback.${value}.label` as never) as string,
      description: t(`report.feedback.${value}.description` as never) as string,
    }));
  };

  const renderContentReportStep = () => (
    <View className={`${isTablet ? "px-10" : "px-6"}`}>
      <ScrollView style={{ maxHeight: maxScrollHeight }} showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-medium text-foreground-heading mb-2">
          {t("report.additionalDetails", "Additional details (optional)")}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t("report.descriptionPlaceholder", "Describe the issue...")}
          placeholderTextColor="#a8a29e"
          multiline
          numberOfLines={4}
          className="rounded-xl border border-border bg-surface-elevated p-4 mb-4 text-foreground-body min-h-[100px]"
          textAlignVertical="top"
        />
        <View className="gap-2 ">
          {getReportReasons().map((reason) => (
            <Pressable
              key={reason.value}
              onPress={() => setSelectedReason(reason.value as ContentReportReason)}
              className={`flex-row items-center gap-3 rounded-xl border p-4 ${
                selectedReason === reason.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-elevated"
              }`}
            >
              <View
                className={`h-5 w-5 rounded-full border-2 items-center justify-center ${
                  selectedReason === reason.value ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {selectedReason === reason.value && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground-heading">
                  {reason.label}
                </Text>
                <Text className="text-sm text-foreground-muted">{reason.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className={`flex-row gap-4 mt-6`}>
        <ShadowItem
          onPress={() => setStep("select")}
          className="flex-1 rounded-xl py-4 bg-white border-border-dark items-center"
        >
          <Text className="text-base font-semibold text-foreground-heading">
            {t("common.back", "Back")}
          </Text>
        </ShadowItem>

        <ShadowItem
          onPress={handleSubmitContentReport}
          disabled={!selectedReason || isSubmitting}
          className={`flex-1 py-4 rounded-xl ${!selectedReason ? "opacity-50" : ""}`}
          variant="primary"
        >
          <Text className="text-base font-semibold text-white text-center">
            {isSubmitting ? t("common.submitting", "Submitting...") : t("common.submit", "Submit")}
          </Text>
        </ShadowItem>
      </View>
    </View>
  );

  const renderExtractionFeedbackStep = () => (
    <View className={`${isTablet ? "px-10" : "px-6"}`}>
      <ScrollView style={{ maxHeight: maxScrollHeight }} showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-medium text-foreground-heading mb-2">
          {t("report.additionalDetails", "Additional details (optional)")}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t("report.feedbackPlaceholder", "What's wrong with the extraction?")}
          placeholderTextColor="#a8a29e"
          multiline
          numberOfLines={4}
          className="rounded-xl border border-border bg-surface-elevated p-4 mb-4 text-foreground-body min-h-[100px]"
          textAlignVertical="top"
        />
        <View className="gap-2 ">
          {getFeedbackCategories().map((category) => (
            <Pressable
              key={category.value}
              onPress={() => setSelectedCategory(category.value as ExtractionFeedbackCategory)}
              className={`flex-row items-center gap-3 rounded-xl border p-4 ${
                selectedCategory === category.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-elevated"
              }`}
            >
              <View
                className={`h-5 w-5 rounded-full border-2 items-center justify-center ${
                  selectedCategory === category.value
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {selectedCategory === category.value && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground-heading">
                  {category.label}
                </Text>
                <Text className="text-sm text-foreground-muted">{category.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className={`flex-row gap-4 mt-6`}>
        <ShadowItem
          onPress={() => setStep("select")}
          className="flex-1 rounded-xl py-4 bg-white border-border-dark items-center"
        >
          <Text className="text-base font-semibold text-foreground-heading">
            {t("common.back", "Back")}
          </Text>
        </ShadowItem>

        <ShadowItem
          onPress={handleSubmitExtractionFeedback}
          disabled={!selectedCategory || isSubmitting}
          className={`flex-1 py-4 rounded-xl ${!selectedCategory ? "opacity-50" : ""}`}
          variant="primary"
        >
          <Text className="text-base font-semibold text-white text-center">
            {isSubmitting ? t("common.submitting", "Submitting...") : t("common.submit", "Submit")}
          </Text>
        </ShadowItem>
      </View>
    </View>
  );

  const getTitle = () => {
    switch (step) {
      case "content":
        return t("report.content.title", "Report Content");
      case "extraction":
        return t("report.extraction.title", "Report Extraction Issue");
      default:
        return t("report.title", "Report Recipe");
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case "content":
        return t("report.content.description", "What's wrong with this content?");
      case "extraction":
        return t("report.extraction.description", "What's wrong with the extraction?");
      default:
        return recipeTitle;
    }
  };

  return (
    <PremiumBottomSheet
      ref={bottomSheetModalRef}
      title={getTitle()}
      subtitle={getSubtitle()}
      onClose={handleClose}
      onDismiss={handleClose}
    >
      {step === "select" && renderSelectStep()}
      {step === "content" && renderContentReportStep()}
      {step === "extraction" && renderExtractionFeedbackStep()}
    </PremiumBottomSheet>
  );
}

// Default options for offline/loading state - values only, labels come from translations
const defaultReportReasonValues = [
  "inappropriate_content",
  "hate_speech",
  "copyright_violation",
  "spam_advertising",
  "misinformation",
  "other",
] as const;

const defaultFeedbackCategoryValues = [
  "wrong_ingredients",
  "missing_steps",
  "incorrect_steps",
  "bad_formatting",
  "wrong_measurements",
  "ai_hallucination",
  "other",
] as const;
