import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "language.english" as const },
  { code: "fr", label: "language.french" as const },
] as const;

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  // Get the current language label
  const getCurrentLanguageLabel = () => {
    const lang = languages.find((l) => l.code === currentLanguage);
    return lang ? t(lang.label) : currentLanguage;
  };

  return (
    <View className="gap-4 rounded-lg bg-surface-elevated p-4">
      <Text className="text-lg font-bold text-foreground-heading">
        {t("language.title")}
      </Text>
      <Text className="text-sm text-foreground-secondary">
        {t("language.current")}: {getCurrentLanguageLabel()}
      </Text>
      <View className="flex-row gap-3">
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => changeLanguage(lang.code)}
            className={`rounded-lg border-2 px-6 py-3 ${
              currentLanguage === lang.code
                ? "border-primary bg-primary"
                : "border-border bg-surface"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                currentLanguage === lang.code ? "text-white" : "text-foreground"
              }`}
            >
              {t(lang.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
