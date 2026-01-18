import { View, ActivityIndicator, Platform, useWindowDimensions } from "react-native";
import { FlashList, FlashListRef, ListRenderItem } from "@shopify/flash-list";
import Animated from "react-native-reanimated";
import {
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactElement,
} from "react";
import { RecipeCard, RecipeCardSkeleton } from "../recipe/RecipeCard";
import type { Recipe } from "@/types/recipe";

// Layout constants
const GRID_PADDING = 10;

// Create Reanimated-wrapped FlashList for scroll animations
const ReanimatedFlashList = Animated.createAnimatedComponent(FlashList as React.ComponentType<any>);

export interface MasonryGridRef {
  scrollToTop: (animated?: boolean) => void;
  scrollToOffset: (offset: number, animated?: boolean) => void;
}

export interface MasonryGridProps {
  recipes: Recipe[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  showLoadingFooter?: boolean;
  onScroll?: any;
  ListEmptyComponent?: ReactElement;
  ListHeaderComponent?: ReactElement;
  /** Custom loading component shown while initial data loads. Defaults to ActivityIndicator. */
  ListLoadingComponent?: ReactElement;
  contentContainerStyle?: any;
  /** Custom key extractor for recipes. Defaults to recipe.id */
  keyExtractor?: (recipe: Recipe) => string;
  /** Custom render function for recipe cards. Defaults to RecipeCard */
  renderRecipeCard?: (recipe: Recipe, index: number) => ReactElement;
  /** Content inset for scroll view */
  contentInset?: { top?: number; left?: number; bottom?: number; right?: number };
  /** Initial content offset */
  contentOffset?: { x: number; y: number };
  /** Scroll indicator insets */
  scrollIndicatorInsets?: { top?: number; left?: number; bottom?: number; right?: number };
  /** Progress view offset for refresh control */
  progressViewOffset?: number;
}

export const MasonryGrid = forwardRef<MasonryGridRef, MasonryGridProps>(function MasonryGrid(
  {
    recipes,
    loading = false,
    refreshing = false,
    onRefresh,
    onEndReached,
    onEndReachedThreshold = 0.5,
    showLoadingFooter = false,
    onScroll,
    ListEmptyComponent,
    ListHeaderComponent,
    ListLoadingComponent,
    contentContainerStyle,
    keyExtractor = (recipe) => recipe.id,
    renderRecipeCard,
    contentInset,
    contentOffset,
    scrollIndicatorInsets,
    progressViewOffset,
  },
  ref
) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlashListRef<Recipe>>(null);

  // Expose scroll methods via ref
  useImperativeHandle(
    ref,
    () => ({
      scrollToTop: (animated = true) => {
        listRef.current?.scrollToOffset({ offset: 0, animated });
      },
      scrollToOffset: (offset: number, animated = true) => {
        listRef.current?.scrollToOffset({ offset, animated });
      },
    }),
    []
  );

  // Calculate number of columns based on device type and screen width
  const numColumns = useMemo(() => {
    const isTablet = Platform.OS === "ios" && Platform.isPad;

    if (!isTablet) {
      // iPhone/iPod: always 2 columns
      return 2;
    }

    // iPad: calculate based on width (max 5 columns)
    // Assuming minimum column width of ~250px for good UX
    const minColumnWidth = 250;
    const padding = 32; // Account for horizontal padding
    const gap = 8; // Gap between columns

    const availableWidth = width - padding;
    const calculatedColumns = Math.floor((availableWidth + gap) / (minColumnWidth + gap));

    return Math.min(Math.max(calculatedColumns, 2), 5);
  }, [width]);

  // Render item function - memoized for performance
  // Wrap in View with padding for horizontal gaps between columns
  const renderItem: ListRenderItem<Recipe> = useCallback(
    ({ item, index }) => (
      <View
        style={{
          paddingBottom: 8,
          paddingHorizontal: 8,
        }}
      >
        {renderRecipeCard ? (
          renderRecipeCard(item, index)
        ) : (
          <RecipeCard recipe={item} index={index} />
        )}
      </View>
    ),
    [renderRecipeCard]
  );

  // Key extractor wrapped in useCallback
  const getItemKey = useCallback((item: Recipe) => keyExtractor(item), [keyExtractor]);

  // Calculate skeleton card width based on screen width and columns
  const skeletonCardWidth = useMemo(() => {
    const horizontalPadding = 10; // 10px on each side from contentContainerStyle
    const itemPadding = 10; // 8px on each side per item
    const availableWidth = width - horizontalPadding;
    return availableWidth / numColumns - itemPadding;
  }, [width, numColumns]);

  // Simple skeleton grid for loading state
  const SkeletonGrid = useMemo(
    () => (
      <View style={{ flexDirection: "row", flexWrap: "wrap", width: width }}>
        {Array.from({ length: numColumns * 3 }).map((_, i) => (
          <View
            key={i}
            style={{ width: width / numColumns, paddingHorizontal: 10, paddingBottom: 10 }}
          >
            <RecipeCardSkeleton width={skeletonCardWidth} imageHeight={180} />
          </View>
        ))}
      </View>
    ),
    [width, numColumns, skeletonCardWidth]
  );

  // Loading footer component - show when fetching next page OR initial loading with header
  const ListFooterComponent = useMemo(() => {
    // Show skeleton grid when loading initial data (with header visible)
    if (loading && recipes.length === 0 && ListHeaderComponent) {
      return ListLoadingComponent ?? SkeletonGrid;
    }
    // Show small loader for pagination
    if (!showLoadingFooter) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#334d43" />
      </View>
    );
  }, [
    showLoadingFooter,
    loading,
    recipes.length,
    ListHeaderComponent,
    ListLoadingComponent,
    SkeletonGrid,
  ]);

  // Show loading state only when there's no header to show
  if (loading && recipes.length === 0 && !ListHeaderComponent) {
    return (
      <View className="flex-1" style={{ paddingHorizontal: GRID_PADDING }}>
        {ListLoadingComponent ?? SkeletonGrid}
      </View>
    );
  }

  // Show empty state only when not loading, no header, and we have an empty component
  // (When we have a header, FlashList handles the empty state via ListEmptyComponent)
  if (!loading && recipes.length === 0 && ListEmptyComponent && !ListHeaderComponent) {
    return <View className="flex-1">{ListEmptyComponent}</View>;
  }

  return (
    <ReanimatedFlashList
      ref={listRef}
      data={recipes}
      renderItem={renderItem}
      keyExtractor={getItemKey}
      numColumns={numColumns}
      masonry
      optimizeItemArrangement
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: 10,
        ...contentContainerStyle,
      }}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListHeaderComponentStyle={{
        marginHorizontal: -10, // Counteract contentContainerStyle padding
      }}
      ListEmptyComponent={!loading ? ListEmptyComponent : undefined}
      ListFooterComponent={ListFooterComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentInset={contentInset}
      contentOffset={contentOffset}
      scrollIndicatorInsets={scrollIndicatorInsets}
      progressViewOffset={progressViewOffset}
    />
  );
});
