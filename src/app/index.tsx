import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center gap-6 p-6">
        <Text className="text-2xl font-bold text-foreground-heading">{t("app.title")}</Text>
        <Text className="text-center text-foreground-secondary">{t("app.description")}</Text>
        <Text className="text-lg text-foreground">{t("common.welcome")}!</Text>
        <LanguageSwitcher />
      </View>
    </ScrollView>
  );
}
