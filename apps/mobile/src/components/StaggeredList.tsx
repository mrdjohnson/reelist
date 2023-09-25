import React, { useState } from 'react'
import { IScrollViewProps, ScrollView, View } from 'native-base'

import { StyleSheet } from 'react-native'

import type { MutableRefObject } from 'react'
import type { RefreshControlProps, StyleProp, ViewStyle, NativeScrollEvent } from 'react-native'

export type AnimationType =
  | 'FADE_IN_FAST'
  | 'SLIDE_LEFT'
  | 'SLIDE_DOWN'
  | 'EFFECTIVE'
  | 'FLIPPED'
  | 'NONE'

export type ListRenderItem<T> = (info: ListRenderItemInfo<T>) => React.ReactElement

export interface ListRenderItemInfo<T> {
  item: T
  i: number
}

export interface StaggeredListELement extends StaggeredListStyles {
  LoadingView?: React.ComponentType<any> | React.ReactElement | null
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null
}

export interface StaggeredListStyles {
  style?: StyleProp<ViewStyle>
  ListHeaderComponentStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
}

export interface StaggeredListStyles {
  style?: StyleProp<ViewStyle>
  ListHeaderComponentStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
}

export interface StaggeredListProps<T>
  extends Omit<IScrollViewProps, 'refreshControl' | 'onScroll'>,
    StaggeredListELement {
  innerRef?: MutableRefObject<IScrollViewProps>
  refreshing?: RefreshControlProps['refreshing']
  onEndReachedThreshold?: number
  loading?: boolean
  keyPrefix?: string
  numColumns?: number
  horizontal?: boolean
  onEndReached?: () => void
  onRefresh?: RefreshControlProps['onRefresh']
  renderItem: ListRenderItem<T>
  data: ReadonlyArray<T> | null | undefined
}
export const stageredStyles = (
  horizontal: boolean | undefined | null,
  numColumns: number | undefined,
) => {
  return {
    stageredViewStyles: StyleSheet.create({
      container: {
        // flex: 1,
        // display: 'flex',
        flexDirection: horizontal ? 'column' : 'row',
        justifyContent: 'center',
        // alignItems: 'center',
      },
      list: {
        // flex: 1 / (numColumns ?? 2),
        flexDirection: horizontal ? 'row' : 'column',
        // alignItems: 'center',
      },
      scrollView: {
        // flex: 1,
        // alignSelf: 'stretch',
      },
    }),
  }
}

export function useStaggeredView<T>(props: StaggeredListProps<T>) {
  const {
    animationType = 'NONE',
    keyPrefix,
    refreshing,
    data,
    innerRef,
    ListHeaderComponent,
    ListEmptyComponent,
    ListFooterComponent,
    ListHeaderComponentStyle,
    containerStyle,
    contentContainerStyle,
    renderItem,
    onEndReachedThreshold,
    onEndReached,
    loading,
    LoadingView,
    numColumns = 2,
    style,
  } = props

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const { stageredViewStyles } = stageredStyles(props.horizontal, props.numColumns)

  const isCloseToBottom = (
    { layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent,
    onEndReachedThre: number,
  ): boolean => {
    const paddingToBottom = contentSize.height * onEndReachedThre

    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
  }

  const onRefresh = () => {
    setIsRefreshing(true)
    props.onRefresh?.()
    setIsRefreshing(false)
  }

  return {
    animationType,
    containerStyle,
    contentContainerStyle,
    data,
    isRefreshing,
    isCloseToBottom,
    innerRef,
    keyPrefix,
    loading,
    LoadingView,
    ListHeaderComponent,
    ListEmptyComponent,
    ListFooterComponent,
    ListHeaderComponentStyle,
    numColumns,
    onEndReachedThreshold,
    onEndReached,
    onRefresh,
    stageredViewStyles,
    style,
    refreshing,
    renderItem,
  }
}

const StaggeredList = <T,>(props: StaggeredListProps<T>) => {
  const { ...propsWithoutStyle } = props
  const {
    containerStyle,
    contentContainerStyle,
    data,
    isRefreshing,
    isCloseToBottom,
    innerRef,
    keyPrefix,
    loading,
    LoadingView,
    ListHeaderComponent,
    ListEmptyComponent,
    ListFooterComponent,
    ListHeaderComponentStyle,
    numColumns = 2,
    onEndReachedThreshold,
    onEndReached,
    onRefresh,
    stageredViewStyles,
    style,
    refreshing,
    renderItem,
  } = useStaggeredView(props)

  return (
    <ScrollView
      {...propsWithoutStyle}
      ref={innerRef}
      style={[stageredViewStyles.scrollView, containerStyle]}
      contentContainerStyle={contentContainerStyle}
      removeClippedSubviews={true}
      // refreshControl={
      //   <RefreshControl refreshing={!!(refreshing || isRefreshing)} onRefresh={onRefresh} />
      // }
      scrollEventThrottle={16}
      onScroll={({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
        if (isCloseToBottom(nativeEvent, onEndReachedThreshold || 0.1)) {
          onEndReached?.()
        }
      }}
    >
      {/* {propsWithoutStyle.ListHeaderComponent} */}
      <View style={ListHeaderComponentStyle}>{ListHeaderComponent}</View>
      {data?.length === 0 && ListEmptyComponent ? (
        React.isValidElement(ListEmptyComponent) ? (
          ListEmptyComponent
        ) : (
          <ListEmptyComponent />
        )
      ) : (
        <View style={[stageredViewStyles.container, style]}>
          {Array.from(Array(numColumns), (_, num) => {
            return (
              <View key={`${keyPrefix}-${num.toString()}`} style={[stageredViewStyles.list, style]}>
                {data
                  ?.map((el, index) => {
                    if (index % numColumns === num) {
                      return renderItem({ item: el, i: index })
                    }

                    return null
                  })
                  .filter(e => !!e)}
              </View>
            )
          })}
        </View>
      )}
      {loading && LoadingView}
      {ListFooterComponent}
    </ScrollView>
  )
}

export default StaggeredList
