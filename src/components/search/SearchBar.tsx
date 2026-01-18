/**
 * SearchBar component for recipe search
 * Beautiful, accessible search input with design tokens
 */
import { useState } from "react";
import { View, TextInput, Pressable, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon, X } from "phosphor-react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onSearch,
  placeholder,
  isLoading = false,
  readOnly = false,
  autoFocus = false,
}: SearchBarProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  // Use translation as default placeholder
  const placeholderText = placeholder || t("search.placeholder");

  const handleClear = () => {
    onChangeText("");
    onSearch(""); // Trigger search with empty query to show all recipes
  };

  return (
    <View
      className={`flex-row items-center px-3 py-3 rounded-full bg-surface-elevated ${isFocused ? "border border-primary/20 bg-background" : "border border-transparent"
        }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isFocused ? 0.08 : 0.03,
        shadowRadius: 8,
        elevation: isFocused ? 2 : 0,
      }}
    >
      {/* Search Icon */}
      <MagnifyingGlassIcon
        size={20}
        color={isFocused ? "#334d43" : "#8b7a66"}
        weight={isFocused ? "bold" : "regular"}
      />

      {/* Text Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholderText}
        placeholderTextColor="#a8a29e"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 ml-3 text-base text-foreground-heading font-medium leading-5"
        style={{ outlineStyle: "none", height: "100%" } as any} // Remove web outline
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        editable={!readOnly}
        autoFocus={autoFocus}
        onSubmitEditing={() => {
          if (value.trim().length > 0) {
            onSearch(value.trim());
          }
        }}
      />

      {/* Clear Button - always reserve space to prevent layout shift */}
      <View style={{ width: 20, height: 20, justifyContent: "center", alignItems: "center" }}>
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className="p-1"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={12} color="#57534e" weight="bold" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
