import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user, isLoading, isAuthenticated, isAnonymous } = useAuth();

  return (
    <ScrollView className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="flex-1 items-center justify-center gap-6 p-6">
        <Text className="text-2xl font-bold text-foreground-heading">{t("app.title")}</Text>
        <Text className="text-center text-foreground-secondary">{t("app.description")}</Text>
        <Text className="text-lg text-foreground">{t("common.welcome")}!</Text>

        {/* Authentication Status */}
        <View className="w-full rounded-lg bg-surface-elevated p-4 gap-3">
          <Text className="text-xl font-semibold text-foreground-heading">
            Authentication Status
          </Text>

          {isLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" />
              <Text className="mt-2 text-foreground-secondary">Loading...</Text>
            </View>
          ) : user ? (
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-foreground-secondary">Status:</Text>
                <View
                  className={`rounded-full px-3 py-1 ${isAnonymous ? "bg-yellow-500/20" : "bg-green-500/20"}`}
                >
                  <Text
                    className={`font-medium ${isAnonymous ? "text-yellow-700" : "text-green-700"}`}
                  >
                    {isAnonymous ? "Anonymous" : "Authenticated"}
                  </Text>
                </View>
              </View>

              <View className="gap-1">
                <Text className="text-foreground-secondary">User ID:</Text>
                <Text className="font-mono text-xs text-foreground">{user.id}</Text>
              </View>

              {user.email && (
                <View className="gap-1">
                  <Text className="text-foreground-secondary">Email:</Text>
                  <Text className="text-foreground">{user.email}</Text>
                </View>
              )}

              {user.phone && (
                <View className="gap-1">
                  <Text className="text-foreground-secondary">Phone:</Text>
                  <Text className="text-foreground">{user.phone}</Text>
                </View>
              )}

              <View className="gap-1">
                <Text className="text-foreground-secondary">Created At:</Text>
                <Text className="text-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>

              {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
                <View className="gap-1">
                  <Text className="text-foreground-secondary">Metadata:</Text>
                  <Text className="font-mono text-xs text-foreground">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text className="text-foreground-secondary">Not authenticated</Text>
          )}
        </View>

        <LanguageSwitcher />
      </View>
    </ScrollView>
  );
}
