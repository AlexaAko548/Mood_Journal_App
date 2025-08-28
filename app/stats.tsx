import React, { useContext, useMemo } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { EntriesContext } from '../src/context/EntriesContext';
import { BarChart } from 'react-native-chart-kit';

const BarChartAny: any = BarChart;
const windowWidth = Dimensions.get('window').width - 32;
const MOOD_LABELS = ['😡', '😢', '😕', '😐', '🙂', '😄'];

export default function StatsScreen() {
  const { entries } = useContext(EntriesContext);

  const counts = useMemo(() => {
    const map = MOOD_LABELS.reduce((acc: Record<string, number>, m) => {
      acc[m] = 0;
      return acc;
    }, {});
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);

    entries.forEach(e => {
      const d = new Date(e.date);
      if (d >= cutoff && map[e.mood] !== undefined) {
        map[e.mood]++;
      }
    });

    return MOOD_LABELS.map(m => map[m] || 0);
  }, [entries]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood counts (last 7 days)</Text>

      <BarChartAny
        data={{ labels: MOOD_LABELS, datasets: [{ data: counts }] }}
        width={windowWidth}
        height={220}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        labelColor: () => '#333',
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, // <-- add this line
        style: { borderRadius: 8 },
        propsForBackgroundLines: { strokeWidth: 0.3, stroke: '#eee' },
        }}
        style={{ borderRadius: 8 }}
      />

      <Text style={{ marginTop: 14, color: '#666' }}>Total entries: {entries.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
});
