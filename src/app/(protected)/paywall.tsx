/**
 * Paywall Route
 *
 * Full-screen modal for premium subscription upgrade.
 * Presented from credits bottom sheet or other upgrade CTAs.
 */
import { useLocalSearchParams } from "expo-router";
import { PaywallScreen } from "@/components/paywall";
import type { PaywallViewedProperties } from "@/lib/posthog";

export default function PaywallRoute() {
  const { trigger } = useLocalSearchParams<{ trigger?: PaywallViewedProperties["trigger"] }>();
  return <PaywallScreen trigger={trigger} />;
}
