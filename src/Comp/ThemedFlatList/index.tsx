import React, {useState } from 'react';
import { Animated, ListRenderItem, NativeScrollEvent, NativeSyntheticEvent, ViewStyle } from 'react-native';

interface ThemedViewProps {
    indicatorOpacity?:number
    style?: ViewStyle;
    containerStyle?: ViewStyle;
    indicatorStyle?: ViewStyle;
    data: Animated.WithAnimatedObject<ArrayLike<never>> | null | undefined;
    numColumns: number;
    key: string;
    keyExtractor?: ((item: never, index: number) => string) | undefined;
    renderItem: ListRenderItem<never> | null | undefined;
    onEndReachedThreshold?: number | Animated.Value | Animated.AnimatedInterpolation<string | number> | null | undefined
    onMomentumScrollBegin?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void)| undefined;
    onMomentumScrollEnd?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined;
    onScroll?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined;
    scrollEventThrottle?: number | Animated.Value | Animated.AnimatedInterpolation<string | number> | undefined
}

const ThemedFlatList: React.FC<ThemedViewProps> = ({indicatorOpacity, onMomentumScrollBegin, onMomentumScrollEnd, onScroll, scrollEventThrottle, onEndReachedThreshold, data, renderItem, keyExtractor, numColumns, key, containerStyle, style, indicatorStyle }) => {


    const [indicator] = useState(new Animated.Value(0));
    const [wholeHeight, setWholeHeight] = useState(1);
    const [visibleHeight, setVisibleHeight] = useState(0);
    const [opacityOfIndicator] = useState(new Animated.Value(0));

    const indicatorSize = React.useMemo(() => {
        return wholeHeight > visibleHeight ? visibleHeight * visibleHeight / wholeHeight : visibleHeight;
    }, [wholeHeight, visibleHeight]);

    const difference = React.useMemo(() => {
        return visibleHeight > indicatorSize ? visibleHeight - indicatorSize : 1;
    }, [visibleHeight, indicatorSize]);

    const handleContentSizeChange = (width: number, height: number) => {
        setWholeHeight(height);
    };

    const setVisibitlty = (status:boolean) => {
        Animated.timing(opacityOfIndicator, {
            toValue: status? (indicatorOpacity ?? 0.4) :0,
            duration: status ? 10:500, // Adjust the duration as needed
            useNativeDriver: true, // For better performance
          }).start();
    };

    const handleLayout = (event: { nativeEvent: { layout: { height: any; }; }; }) => {
        const {height} = event.nativeEvent.layout;
        setVisibleHeight(height);
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: indicator } } }], {useNativeDriver: false}
    );

    return (
        <Animated.View
            style={[{
                overflow: 'hidden',
                flex: 1,
                ...containerStyle,
            }]}>
            <Animated.FlatList
                data={data}
                renderItem={renderItem}
                numColumns={numColumns}
                keyExtractor={keyExtractor}
                onEndReachedThreshold={onEndReachedThreshold}
                style={style}
                key={key}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={handleContentSizeChange}
                onLayout={handleLayout}
                scrollEventThrottle={scrollEventThrottle ?? 16}
                onScroll={handleScroll}
                onMomentumScrollBegin={(event) => { 
                    // onMomentumScrollBegin ? onMomentumScrollBegin(event) : null;
                    setVisibitlty(true) 
                }}
                onMomentumScrollEnd={() => { setVisibitlty(false)  }}
            />
            <Animated.View style={[
                {
                    position: "absolute",
                    width: 3,
                    top: 2,
                    right: 0,
                    bottom: 2,
                    opacity: opacityOfIndicator,
                    borderRadius: 3,

                }, {
                    height: indicatorSize,
                    transform: [{
                        translateY: Animated.multiply(indicator, visibleHeight / wholeHeight).interpolate({
                            inputRange: [0, difference],
                            outputRange: [0, difference],
                            extrapolate: 'extend'
                        })
                    },
                    ]
                },
                indicatorStyle
            ]} />
        </Animated.View>
    );
};

export default ThemedFlatList;

/*

            <ThemedFlatList
              indicatorStyle={{backgroundColor:brandGreenColor,}}
              data={[d1, d2, d3]}
              renderItem={renderItemView}
              numColumns={gridView ? 3 : 1}
              keyExtractor={(_, index) => index.toString()}
              onEndReachedThreshold={0.5}
              style={{marginBottom: 0, width: '100%', paddingLeft:10,paddingRight:10}}
              key={gridView ? 'grid' : 'list'}
              showsVerticalScrollIndicator={true}
            />


*/