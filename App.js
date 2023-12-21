import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable, LogBox, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Title, Paragraph, IconButton } from 'react-native-paper';


LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message

const App = () => {
  const [sound, setSound] = useState(null);
  const [currentStationIndex, setCurrentStationIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleList, setShuffleList] = useState([]);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [nowPlayingText, setNowPlayingText] = useState('');
  const [lastClickedStationIndex, setLastClickedStationIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const stations = [
    'CKDU',
    'CJLO',
    'CFUV',
    'WNYC',
    'WFMU',
    'KEXP',
    // 'KCRW',
    'NTS'
  ];

  const streamURLs = {
    CKDU: "https://archive1.ckdu.ca:9750/ckdu_1_on_air_low.mp3",
    CJLO: "http://rosetta.shoutca.st:8883/stream",
    CFUV: "http://ais-sa1.streamon.fm/7132_64k.aac",
    WNYC: "http://fm939.wnyc.org/wnycfm.aac",
    WFMU: "http://stream0.wfmu.org/do-or-diy",
    KEXP: "http://live-mp3-128.kexp.org/kexp128.mp3",
    // KCRW: "http://kcrw.streamguys1.com/kcrw_192k_mp3_e24_internet_radio",
    NTS:  "http://stream-relay-geo.ntslive.net/stream",
  };

  const stationImageMap = {
    station1: require('./media/ckdu.png'),
    station2: require('./media/cjlo.png'),
    station3: require('./media/cfuv.png'),
    station4: require('./media/wnyc.png'),
    station5: require('./media/wfmu.png'),
    station6: require('./media/kexp.png'),
    // station6: require('./media/kcrw.png'),
    station7: require('./media/nts.png'),
    // Add more stations as needed
  };

  useEffect(() => {
    // Load the blank image on page load
    setLastClickedStationIndex(null);
  }, []);

  const playAudio = async (stationIndex) => {
    const station = stations[stationIndex];
    const streamURL = streamURLs[station];
  
    if (!streamURL) return;
  
    try {
      setLoading(true); // Start loading indicator
  
      if (sound) {
        // If the same station is clicked, toggle play/pause
        if (currentStationIndex === stationIndex) {
          if (isPlaying) {
            await sound.pauseAsync();
          } else {
            await sound.playAsync();
          }
          setIsPlaying(!isPlaying);
        } else {
          // If a different station is clicked, stop current and play new
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
          const newSound = new Audio.Sound();
          await newSound.loadAsync({ uri: streamURL });
          setSound(newSound);
          setCurrentStationIndex(stationIndex);
          setIsPlaying(true);
          setNowPlayingText(station);
          setLastClickedStationIndex(stationIndex);
          await newSound.playAsync();
        }
      } else {
        // If there is no sound, load and play
        const newSound = new Audio.Sound();
        await newSound.loadAsync({ uri: streamURL });
        setSound(newSound);
        setCurrentStationIndex(stationIndex);
        setIsPlaying(true);
        setNowPlayingText(station);
        setLastClickedStationIndex(stationIndex);
        await newSound.playAsync();
      }
    } catch (error) {
      console.error('Error playing/pausing sound:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const stopAudio = async () => {
    if (sound) {
      setIsPlaying(false);
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const previousAudio = () => {
    const prevIndex = (currentStationIndex - 1 + stations.length) % stations.length;
    stopAudio();
    playAudio(prevIndex);
  };

  const nextAudio = () => {
    const nextIndex = (currentStationIndex + 1) % stations.length;
    stopAudio();
    playAudio(nextIndex);
  };

  const shuffle = () => {
    const currentIndex = shuffleList.length > 0 ? shuffleList[shuffleList.length - 1] : currentStationIndex;
    let newIndex = currentIndex;

    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * stations.length);
    }

    setShuffleList([...shuffleList, newIndex]);
    setShuffleIndex(shuffleIndex + 1);
    stopAudio();
    playAudio(newIndex);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
  <View style={{ position: 'relative', alignItems: 'center' }}>
    {/* Image component */}
    <Image
      source={
        lastClickedStationIndex !== null && stations[lastClickedStationIndex]
          ? require(`./media/${stations[lastClickedStationIndex].toLowerCase()}.png`)
          : require('./media/blank.png')
      }
      style={styles.stationImage}
    />
{/* 
<Image
  source={
    lastClickedStationIndex !== null &&
    stations[lastClickedStationIndex] &&
    stationImageMap[stations[lastClickedStationIndex].toLowerCase()]
      ? stationImageMap[stations[lastClickedStationIndex].toLowerCase()]
      : require('./media/blank.png')
  }
  style={styles.stationImage}
/> */}
    
    {/* ActivityIndicator component */}
    {loading && (
      <ActivityIndicator
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
        size="large"
        color="#CCCCCC"
        animating={loading}
      />
    )}

    {/* Other content */}
    {/* <Title>Now playing</Title>
    <Paragraph style={styles.nowPlayingText}>
      {lastClickedStationIndex !== null
        ? stations[lastClickedStationIndex]
        : 'Select a station'}
    </Paragraph> */}
  </View>
</Card.Content>
<Card.Actions style={styles.transportButtonsContainer}>
  <IconButton icon="skip-previous" onPress={previousAudio} style={styles.transportButton} />
  <IconButton
    icon={isPlaying ? 'pause' : 'play'}
    onPress={() => playAudio(currentStationIndex)}
    style={styles.transportButton}
  />
  <IconButton icon="skip-next" onPress={nextAudio} style={styles.transportButton} />
</Card.Actions>
      </Card>

      {stations.map((station, index) => (
        <Pressable
          key={index}
          style={styles.stationButton}
          onPress={() => playAudio(index)}
        >
          <Text style={styles.stationButtonText}>{station}</Text>
        </Pressable>
      ))}
    </View> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgb(24,24,24)',
    backgroundColor: 'rgb(14,14,14)',
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'rgb(58,58,58)',
    backgroundColor: 'rgb(24,24,24)',

  },
  stationImage: {
    width: '100%',
    maxWidth: 400, // Set the maximum width
    minHeight: 175,
    resizeMode: 'cover',
  },
  // stationButton: {
  //   backgroundColor: 'darkgrey',
  //   width: '100%',
  //   minHeight: 45,
  //   marginBottom: 5, // Reduced marginBottom
  //   borderRadius: 8,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  stationButton: {
    flex: 1,
    backgroundColor: 'rgb(58,58,58)',
    backgroundColor: 'rgb(24,24,24)',
    width: '100%',
    minHeight: 45,
    marginBottom: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  nowPlayingText: {
    fontSize: 24,
    marginTop: 10, // Adjusted marginTop
    fontWeight: 'bold',
  },
  transportButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  transportButton: {
    backgroundColor: 'rgb(231, 224, 236)',
    backgroundColor: 'rgb(24,24,24)',
    width: 90,
    height: 60,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: 'rgb(121, 116, 126)',
    marginHorizontal: 5, // Adjust horizontal margin as needed
    overflow: 'hidden', // Ensure content does not overflow
  },

  audioInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the start (left)
  },
  
  textContainer: {
    marginLeft: 10,
    alignSelf: 'flex-start', // Align self to the start (left)
  },
  
  transportButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the buttons horizontally
    marginTop: 10, // Add some margin to the top
    alignSelf: 'center',
  },
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     marginTop: 40,
//     paddingHorizontal: 20,
//   },
//   card: {
//     marginBottom: 10,
//   },
//   stationImage: {
//     width: '100%',
//     height: 200,
//     resizeMode: 'cover',
//   },
//   stationButton: {
//     backgroundColor: 'darkgrey',
//     width: '100%',
//     height: 60,
//     marginBottom: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   stationButtonText: {
//     fontSize: 20,
//     color: '#ffffff',
//   },
//   nowPlayingText: {
//     fontSize: 24,
//     marginTop: 20,
//     fontWeight: 'bold',
//   },
// });

export default App;

