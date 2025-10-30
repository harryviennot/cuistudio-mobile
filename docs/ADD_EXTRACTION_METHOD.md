# How to Add a New Recipe Extraction Method

This guide explains how to add a new recipe extraction method (URL, voice, paste, etc.) to the Cuistudio mobile app.

## Architecture Overview

The extraction system is built with modularity in mind:

```
Configuration (extractionMethods.ts)
         ↓
    Flow Hook (useXExtractionFlow.ts)
         ↓
Confirmation View (XConfirmationView.tsx)
         ↓
  Bottom Sheet (renders your view)
         ↓
    Home Screen (wires everything together)
```

## Step-by-Step Guide

### 1. Define Your Method Configuration

**File:** `src/config/extractionMethods.ts`

Add your extraction method configuration:

```typescript
// Example: URL extraction
export const URL_EXTRACTION_METHODS: ExtractionMethodConfig[] = [
  {
    id: "url",
    type: "url",
    label: "Paste Recipe URL",
    icon: null, // Will be set in component
  },
];

export const URL_EXTRACTION_CONFIG = {
  maxItems: 1, // Only one URL at a time
  allowMultiple: false,
  requiresConfirmation: true, // Show confirmation view?
};
```

**Types available:**
- `ExtractionMethodType`: "image" | "video" | "url" | "voice" | "paste"
- `ExtractionSourceType`: "camera" | "gallery" | "url" | "voice" | "paste"

---

### 2. Create a Flow Hook

**File:** `src/hooks/useUrlExtractionFlow.ts`

This hook encapsulates your extraction logic:

```typescript
import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { extractionService } from "@/api/services/extraction.service";
import type { ExtractionSourceType } from "@/config/extractionMethods";

interface UseUrlExtractionFlowReturn {
  url: string;
  isSubmitting: boolean;
  handleSelectMethod: (method: ExtractionSourceType) => Promise<void>;
  handleConfirm: (url: string) => Promise<void>;
  setUrl: (url: string) => void;
  resetSelection: () => void;
}

export function useUrlExtractionFlow(): UseUrlExtractionFlowReturn {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectMethod = async (method: ExtractionSourceType) => {
    // For URL, we don't need to do anything on method selection
    // The confirmation view will handle URL input
    console.log("URL method selected:", method);
  };

  const handleConfirm = async (urlToSubmit: string) => {
    if (!urlToSubmit.trim()) {
      Alert.alert("Error", "Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting URL for extraction...", urlToSubmit);

      // Call your API endpoint
      const response = await extractionService.submitUrl(urlToSubmit);

      console.log("Extraction response:", response);

      if (response?.job_id) {
        // Navigate to extraction progress screen
        router.push({
          pathname: "/extraction/[jobId]",
          params: { jobId: response.job_id },
        });
        // Reset after successful submission
        setUrl("");
      } else {
        Alert.alert("Error", "Failed to submit URL. Please try again.");
      }
    } catch (error) {
      console.error("URL extraction error:", error);
      Alert.alert("Error", "Failed to submit URL. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSelection = () => {
    setUrl("");
  };

  return {
    url,
    isSubmitting,
    handleSelectMethod,
    handleConfirm,
    setUrl,
    resetSelection,
  };
}
```

**Hook requirements:**
- Must return `handleSelectMethod` function
- Must return `handleConfirm` function
- Should handle API submission
- Should handle navigation to extraction progress screen
- Should manage loading/error states

---

### 3. Create a Confirmation View Component

**File:** `src/components/extraction/confirmation/UrlConfirmationView.tsx`

This component renders your custom confirmation UI:

```typescript
import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Check, ArrowLeft, Link } from "phosphor-react-native";

interface UrlConfirmationViewProps {
  url: string;
  onUrlChange: (url: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function UrlConfirmationView({
  url,
  onUrlChange,
  onConfirm,
  onBack,
  isSubmitting,
}: UrlConfirmationViewProps) {
  const isValidUrl = url.trim().length > 0;

  return (
    <View className="max-h-[80vh] bg-surface-elevated px-6 pt-4 pb-4">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        {!isSubmitting && (
          <Pressable onPress={onBack} className="p-1">
            <ArrowLeft size={24} color="#6b5d4a" weight="regular" />
          </Pressable>
        )}
        <Text className="flex-1 text-center text-base font-medium text-foreground-secondary">
          Paste Recipe URL
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* URL Input */}
      <View className="mb-6">
        <View className="mb-2 flex-row items-center gap-2">
          <Link size={20} color="#6b5d4a" weight="regular" />
          <Text className="text-sm font-medium text-foreground-secondary">
            Recipe URL
          </Text>
        </View>
        <TextInput
          value={url}
          onChangeText={onUrlChange}
          placeholder="https://example.com/recipe"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          editable={!isSubmitting}
          className="rounded-2xl border-2 border-border bg-surface px-4 py-3 text-base text-foreground"
        />
      </View>

      {/* Confirm Button */}
      <View>
        {isSubmitting ? (
          <View className="flex-row items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4">
            <ActivityIndicator color="#fefdfb" />
            <Text className="text-base font-semibold text-surface-elevated">
              Extracting recipe...
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onConfirm}
            disabled={!isValidUrl}
            className={`flex-row items-center justify-center gap-2 rounded-2xl px-6 py-4 ${
              !isValidUrl
                ? "bg-interactive-muted opacity-50"
                : "bg-primary active:bg-primary-dark"
            }`}
          >
            <Check size={20} color="#fefdfb" weight="bold" />
            <Text className="text-base font-semibold text-surface-elevated">
              Extract Recipe
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
```

**Component requirements:**
- Must accept props from `ConfirmationRenderProps` (see bottom sheet interface)
- Should handle user input for your extraction method
- Should show loading state during submission
- Should validate input before allowing confirmation
- Use NativeWind/Tailwind with design tokens

---

### 4. Add API Service Method (Backend Integration)

**File:** `src/api/services/extraction.service.ts`

Add your API endpoint:

```typescript
/**
 * Submit URL for recipe extraction
 */
async submitUrl(url: string): Promise<UrlExtractionResponse> {
  const response = await apiClient.post<UrlExtractionResponse>(
    "/api/v1/extraction/submit",
    {
      source_type: "url",
      source_url: url,
    }
  );
  return response.data;
}
```

**Backend endpoint:** `POST /api/v1/extraction/submit`
- Should accept your extraction source data
- Should return a `job_id` for progress tracking
- Already exists in the backend for multiple source types

---

### 5. Wire Everything Together in Home Screen

**File:** `src/app/index.tsx`

Add your extraction method to the home screen:

```typescript
import { Link } from "phosphor-react-native";
import { UrlConfirmationView } from "@/components/extraction/confirmation/UrlConfirmationView";
import { useUrlExtractionFlow } from "@/hooks/useUrlExtractionFlow";
import {
  URL_EXTRACTION_METHODS,
  URL_EXTRACTION_CONFIG,
} from "@/config/extractionMethods";

// Inside component:
const urlFlow = useUrlExtractionFlow();

// Add icons to methods
const urlMethodsWithIcons = URL_EXTRACTION_METHODS.map((method) => ({
  ...method,
  icon: <Link size={32} color="#334d43" weight="duotone" />,
}));

// Render bottom sheet
<ExtractionMethodBottomSheet
  ref={bottomSheetRef}
  methods={urlMethodsWithIcons}
  title="Add Recipe from URL"
  onSelectMethod={urlFlow.handleSelectMethod}
  onConfirm={() => urlFlow.handleConfirm(urlFlow.url)}
  renderConfirmation={(props) => (
    <UrlConfirmationView
      url={urlFlow.url}
      onUrlChange={urlFlow.setUrl}
      onConfirm={() => urlFlow.handleConfirm(urlFlow.url)}
      onBack={props.onBack}
      isSubmitting={urlFlow.isSubmitting}
    />
  )}
/>
```

---

## Supporting Multiple Methods in One Bottom Sheet

You can combine multiple extraction methods in a single bottom sheet:

```typescript
const allMethods = [
  ...imageMethodsWithIcons,
  ...urlMethodsWithIcons,
  ...voiceMethodsWithIcons,
];

// Conditionally render confirmation views based on selected method type
<ExtractionMethodBottomSheet
  methods={allMethods}
  title="Add Recipe"
  onSelectMethod={(method) => {
    if (method === "camera" || method === "gallery") {
      imageFlow.handleSelectMethod(method);
    } else if (method === "url") {
      urlFlow.handleSelectMethod(method);
    } else if (method === "voice") {
      voiceFlow.handleSelectMethod(method);
    }
  }}
  renderConfirmation={(props) => {
    // Determine which view to render based on current selection
    if (selectedMethodType === "image") {
      return <ImageConfirmationView {...props} />;
    } else if (selectedMethodType === "url") {
      return <UrlConfirmationView {...props} />;
    }
    // etc...
  }}
/>
```

---

## Complete Examples

### Example: Voice Recording Extraction

**1. Configuration:**
```typescript
export const VOICE_EXTRACTION_METHODS: ExtractionMethodConfig[] = [
  {
    id: "voice",
    type: "voice",
    label: "Record Voice Instructions",
    icon: null,
  },
];
```

**2. Hook:**
```typescript
export function useVoiceExtractionFlow() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string>("");

  const startRecording = async () => {
    // Use expo-av to record audio
  };

  const stopRecording = async () => {
    // Stop and save recording
  };

  const handleConfirm = async (uri: string) => {
    // Upload audio and submit for extraction
  };

  return { recording, audioUri, startRecording, stopRecording, handleConfirm };
}
```

**3. Confirmation View:**
```typescript
export function VoiceConfirmationView({
  recording,
  onStartRecording,
  onStopRecording,
  onConfirm,
  ...
}) {
  return (
    <View>
      {/* Microphone button */}
      {/* Waveform visualization */}
      {/* Playback controls */}
      {/* Confirm button */}
    </View>
  );
}
```

### Example: Paste/Text Extraction

**1. Configuration:**
```typescript
export const PASTE_EXTRACTION_METHODS: ExtractionMethodConfig[] = [
  {
    id: "paste",
    type: "paste",
    label: "Paste Recipe Text",
    icon: null,
  },
];
```

**2. Hook:**
```typescript
export function usePasteExtractionFlow() {
  const [text, setText] = useState("");

  const handleConfirm = async (text: string) => {
    const response = await extractionService.submitText(text);
    // Navigate to job progress
  };

  return { text, setText, handleConfirm };
}
```

**3. Confirmation View:**
```typescript
export function PasteConfirmationView({ text, onTextChange, onConfirm, ... }) {
  return (
    <View>
      <TextInput
        multiline
        numberOfLines={10}
        value={text}
        onChangeText={onTextChange}
        placeholder="Paste your recipe text here..."
      />
      {/* Confirm button */}
    </View>
  );
}
```

---

## Testing Your New Extraction Method

1. **Start the app:** `npm start` in `cuistudio-mobile/`
2. **Tap the FAB** to open the bottom sheet
3. **Select your new method** (it should appear in the list)
4. **Test the confirmation flow** (input validation, loading states)
5. **Verify navigation** to extraction progress screen
6. **Check backend** logs to ensure job is created

---

## Tips & Best Practices

### ✅ Do:
- Keep hooks focused on business logic only
- Keep confirmation views focused on UI only
- Use the same loading/error patterns as image extraction
- Follow NativeWind styling conventions
- Add proper TypeScript types for all props
- Test on both iOS and Android (action sheets differ)

### ❌ Don't:
- Don't put UI code in hooks
- Don't put API calls in confirmation views
- Don't skip the confirmation view (unless method is instant)
- Don't hardcode values - use config files
- Don't modify the bottom sheet component (it's generic!)

---

## File Checklist

When adding a new extraction method, create/modify these files:

- [ ] `src/config/extractionMethods.ts` - Add method config
- [ ] `src/hooks/useXExtractionFlow.ts` - Create flow hook
- [ ] `src/components/extraction/confirmation/XConfirmationView.tsx` - Create UI
- [ ] `src/api/services/extraction.service.ts` - Add API method (if needed)
- [ ] `src/app/index.tsx` - Wire everything together
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator

---

## Need Help?

- **Example to reference:** Check `useImageExtractionFlow.ts` and `ImageConfirmationView.tsx`
- **Bottom sheet types:** See `ExtractionMethodBottomSheet.tsx` interfaces
- **API patterns:** See `extraction.service.ts` and backend docs in CLAUDE.md

Happy coding! 🎉
