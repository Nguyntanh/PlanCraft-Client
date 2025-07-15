import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import config from '../config/config';

// Theme for consistent styling
const theme = {
  colors: {
    primary: '#007AFF',
    background: '#F5F5F5',
    text: '#333',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    overdue: '#FF3B30',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
};

// Types
type Task = {
  id: string;
  title: string;
  status: string;
  dueDate: string;
};

type GoalStats = {
  total: number;
  completed: number;
  progress: number;
};

type TaskStatistics = {
  completed: number;
  pending: number;
  overdue: number;
};

// Chart configuration
const screenWidth = Dimensions.get('window').width;
const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
};

const DashboardScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goalStats, setGoalStats] = useState<GoalStats | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Validate API response for GoalStats
  const isGoalStats = (data: any): data is GoalStats =>
    data &&
    typeof data.total === 'number' &&
    typeof data.completed === 'number' &&
    typeof data.progress === 'number' &&
    data.total >= data.completed &&
    data.progress >= 0 &&
    data.progress <= 100;

  // Validate API response for TaskStatistics
  const isTaskStats = (data: any): data is TaskStatistics =>
    data &&
    typeof data.completed === 'number' &&
    typeof data.pending === 'number' &&
    typeof data.overdue === 'number' &&
    data.completed >= 0 &&
    data.pending >= 0 &&
    data.overdue >= 0;

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTasks([]);
      // Uncomment for actual API call:
      // const tasksResponse = await axios.get(`${config.URI_API}/api/tasks/today`);
      // if (Array.isArray(tasksResponse.data)) {
      //   setTasks(tasksResponse.data);
      // } else {
      //   throw new Error('Invalid tasks data');
      // }

      // Fetch goal statistics
      // const goalsResponse = await axios.get(`${config.URI_API}/api/goals/stats`);
      // if (isGoalStats(goalsResponse.data)) {
      //   setGoalStats(goalsResponse.data);
      // } else {
      //   throw new Error('Invalid goal stats data');
      // }

      // Fetch task statistics (mock data for now, replace with actual API)
      
      // Uncomment for actual API call:
      const statsResponse = await axios.get(`${config.URI_API}/api/tasks/statistics`);
      if (isTaskStats(statsResponse.data)) {
        setTaskStats(statsResponse.data);
      } else {
        throw new Error('Invalid task statistics data');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Today's Tasks Section */}
      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
          accessibilityLabel="Nhiệm vụ hôm nay"
          accessibilityRole="header"
        >
          Nhiệm vụ hôm nay
        </Text>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskStatus}>{task.status}</Text>
              <Text style={styles.taskDueDate}>Hạn: {task.dueDate}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noData}>Không có nhiệm vụ hôm nay</Text>
            <Text style={styles.noDataSubtext}>Hãy thêm nhiệm vụ mới để bắt đầu!</Text>
          </View>
        )}
      </View>

      {/* Goal Progress Section */}
      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
          accessibilityLabel="Tiến độ mục tiêu"
          accessibilityRole="header"
        >
          Tiến độ mục tiêu
        </Text>
        {goalStats ? (
          <LineChart
            data={{
              labels: ['Hoàn thành', 'Còn lại'],
              datasets: [
                {
                  data: [
                    goalStats.completed,
                    Math.max(0, goalStats.total - goalStats.completed),
                  ],
                },
              ],
            }}
            width={screenWidth - theme.spacing.medium * 2}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            // accessibilityLabel="Biểu đồ tiến độ mục tiêu"
          />
        ) : (
          <Text style={styles.noData}>Không có dữ liệu tiến độ mục tiêu</Text>
        )}
        {goalStats && (
          <Text style={styles.progressText}>
            Tiến độ: {goalStats.progress.toFixed(1)}%
          </Text>
        )}
      </View>

      {/* Task Statistics Section */}
      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
          accessibilityLabel="Thống kê nhanh"
          accessibilityRole="header"
        >
          Thống kê nhanh
        </Text>
        {taskStats ? (
          <PieChart
            data={[
              {
                name: 'Hoàn thành',
                value: Math.max(0, taskStats.completed),
                color: theme.colors.success,
                legendFontColor: theme.colors.text,
                legendFontSize: 14,
              },
              {
                name: 'Đang chờ',
                value: Math.max(0, taskStats.pending),
                color: theme.colors.warning,
                legendFontColor: theme.colors.text,
                legendFontSize: 14,
              },
              {
                name: 'Quá hạn',
                value: Math.max(0, taskStats.overdue),
                color: theme.colors.overdue,
                legendFontColor: theme.colors.text,
                legendFontSize: 14,
              },
            ]}
            width={screenWidth - theme.spacing.medium * 2}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
            // accessibilityLabel="Biểu đồ thống kê nhiệm vụ"
          />
        ) : (
          <Text style={styles.noData}>Không có dữ liệu thống kê</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  section: {
    marginBottom: theme.spacing.large,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium,
    color: theme.colors.text,
  },
  taskItem: {
    padding: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  taskStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: theme.spacing.small,
  },
  taskDueDate: {
    fontSize: 14,
    color: '#666',
    marginTop: theme.spacing.small,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: theme.spacing.medium,
  },
  noData: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.medium,
  },
  chart: {
    marginVertical: theme.spacing.small,
    borderRadius: 16,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default DashboardScreen;