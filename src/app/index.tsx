import { Text, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Index() {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center gap-6 p-6">
        <Text className="text-2xl font-bold text-foreground-heading">{t("app.title")}</Text>
        <Text className="text-center text-foreground-secondary">{t("app.description")}</Text>
        <Text className="text-lg text-foreground">{t("common.welcome")}!</Text>
        <LanguageSwitcher />
      </View>
    </ScrollView>
  );
}
