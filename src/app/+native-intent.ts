/**
 * Native Intent Handler
 *
 * Intercepts deep links before Expo Router processes them.
 * This is needed for expo-share-intent which uses deep links
 * to pass shared content to the app.
 *
 * When a share intent comes in, it arrives as a URL like:
 * cuistudiomobile://dataUrl=...
 *
 * We intercept this and redirect to the home route, letting
 * the ShareIntentHandler hook process the actual content.
 */

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  // Log for debugging
  console.log("[NativeIntent] Received path:", path, "initial:", initial);

  // Share intent deep links contain dataUrl or other share-specific params
  // Redirect them to the home screen - the ShareIntentHandler will process the content
  if (
    path.includes("dataUrl") ||
    path.includes("share-intent") ||
    path.includes("ShareMedia")
  ) {
    console.log("[NativeIntent] Redirecting share intent to home");
    // Return empty string or "/" to go to the default route
    return "/";
  }

  // For all other paths, let Expo Router handle normally
  return path;
}
