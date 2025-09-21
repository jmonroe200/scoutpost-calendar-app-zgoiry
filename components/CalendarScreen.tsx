
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';
import AddEventForm from './AddEventForm';
import { supabase } from '../lib/supabase';
import ClickableText from './ClickableText';

interface ScoutEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'meeting' | 'activity' | 'camping' | 'service';
  created_by_id: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<ScoutEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      await loadEvents();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        return;
      }

      setEvents(data || []);
      console.log('Loaded events:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading events:', error);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return colors.info;
      case 'activity': return colors.success;
      case 'camping': return colors.secondary;
      case 'service': return colors.warning;
      default: return colors.primary;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return 'people';
      case 'activity': return 'fitness';
      case 'camping': return 'bonfire';
      case 'service': return 'heart';
      default: return 'calendar';
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Format date string properly without timezone issues
  const formatDateString = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString();
  };

  const todayString = getTodayString();

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: getEventTypeColor(event.type),
    };
    return acc;
  }, {} as any);

  // Add today's date with green circle highlighting
  if (markedDates[todayString]) {
    // If today already has events, combine the styling
    markedDates[todayString] = {
      ...markedDates[todayString],
      customStyles: {
        container: {
          backgroundColor: colors.success,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: colors.success,
        },
        text: {
          color: colors.backgroundAlt,
          fontWeight: 'bold',
        },
      },
    };
  } else {
    // If today has no events, just add the green circle
    markedDates[todayString] = {
      customStyles: {
        container: {
          backgroundColor: colors.success,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: colors.success,
        },
        text: {
          color: colors.backgroundAlt,
          fontWeight: 'bold',
        },
      },
    };
  }

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    };
  }

  const selectedDateEvents = events.filter(event => event.date === selectedDate);

  const handleAddEvent = async (newEvent: Omit<ScoutEvent, 'id' | 'created_by_id' | 'created_by_name' | 'created_at' | 'updated_at'>) => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create events');
      return;
    }

    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', currentUser.id)
        .single();

      const { error } = await supabase
        .from('events')
        .insert([{
          ...newEvent,
          created_by_id: currentUser.id,
          created_by_name: profile?.name || 'Unknown User'
        }]);

      if (error) {
        console.error('Error creating event:', error);
        Alert.alert('Error', 'Failed to create event');
        return;
      }

      console.log('Event created successfully');
      setShowAddEvent(false);
      await loadEvents();
    } catch (error) {
      console.error('Unexpected error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const handleDeleteEvent = (event: ScoutEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', event.id);

              if (error) {
                console.error('Error deleting event:', error);
                Alert.alert('Error', 'Failed to delete event');
                return;
              }

              console.log('Event deleted successfully');
              Alert.alert('Success', 'Event deleted successfully');
              await loadEvents();
            } catch (error) {
              console.error('Unexpected error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            elevation: 3,
          }}>
            <Calendar
              onDayPress={(day) => {
                console.log('Selected date:', day.dateString);
                setSelectedDate(day.dateString);
              }}
              markedDates={markedDates}
              markingType={'custom'}
              theme={{
                backgroundColor: colors.backgroundAlt,
                calendarBackground: colors.backgroundAlt,
                textSectionTitleColor: colors.text,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.backgroundAlt,
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textSecondary,
                dotColor: colors.primary,
                selectedDotColor: colors.backgroundAlt,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                indicatorColor: colors.primary,
                textDayFontWeight: '400',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '600',
              }}
            />
          </View>
        </View>

        {selectedDate && (
          <View style={commonStyles.section}>
            <View style={commonStyles.row}>
              <Text style={commonStyles.subtitle}>
                Events for {formatDateString(selectedDate)}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddEvent(true)}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: colors.backgroundAlt, fontSize: 14, fontWeight: '600' }}>
                  Add Event
                </Text>
              </TouchableOpacity>
            </View>

            {selectedDateEvents.length === 0 ? (
              <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 32 }]}>
                <Icon name="calendar-outline" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 12, textAlign: 'center' }]}>
                  No events scheduled for this date
                </Text>
              </View>
            ) : (
              selectedDateEvents.map((event) => {
                const canDelete = currentUser && currentUser.id === event.created_by_id;
                
                return (
                  <View key={event.id} style={commonStyles.card}>
                    <View style={commonStyles.row}>
                      <View style={{ flex: 1 }}>
                        <View style={[commonStyles.centerRow, { justifyContent: 'flex-start', marginBottom: 8 }]}>
                          <View style={{
                            backgroundColor: getEventTypeColor(event.type),
                            padding: 6,
                            borderRadius: 6,
                            marginRight: 12,
                          }}>
                            <Icon name={getEventTypeIcon(event.type) as any} size={16} color={colors.backgroundAlt} />
                          </View>
                          <Text style={[commonStyles.subtitle, { marginBottom: 0, textAlign: 'left' }]}>
                            {event.title}
                          </Text>
                        </View>
                        <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>
                          {event.time} • {event.location}
                        </Text>
                        <ClickableText style={[commonStyles.text, { marginBottom: 4 }]}>
                          {event.description}
                        </ClickableText>
                        <Text style={commonStyles.textSecondary}>
                          Created by: {event.created_by_name}
                        </Text>
                      </View>
                      {canDelete && (
                        <TouchableOpacity
                          onPress={() => handleDeleteEvent(event)}
                          style={{
                            backgroundColor: colors.error,
                            padding: 8,
                            borderRadius: 6,
                          }}
                        >
                          <Icon name="trash" size={16} color={colors.backgroundAlt} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {!selectedDate && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Upcoming Events</Text>
            {events.length === 0 ? (
              <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
                <Icon name="calendar" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
                  No events scheduled
                </Text>
                <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                  Select a date above to add your first event
                </Text>
              </View>
            ) : (
              events.slice(0, 3).map((event) => {
                const canDelete = currentUser && currentUser.id === event.created_by_id;
                
                return (
                  <View key={event.id} style={commonStyles.card}>
                    <View style={commonStyles.row}>
                      <View style={{ flex: 1 }}>
                        <View style={[commonStyles.centerRow, { justifyContent: 'flex-start', marginBottom: 8 }]}>
                          <View style={{
                            backgroundColor: getEventTypeColor(event.type),
                            padding: 6,
                            borderRadius: 6,
                            marginRight: 12,
                          }}>
                            <Icon name={getEventTypeIcon(event.type) as any} size={16} color={colors.backgroundAlt} />
                          </View>
                          <Text style={[commonStyles.subtitle, { marginBottom: 0, textAlign: 'left' }]}>
                            {event.title}
                          </Text>
                        </View>
                        <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>
                          {formatDateString(event.date)} • {event.time}
                        </Text>
                        <Text style={commonStyles.text}>
                          {event.location}
                        </Text>
                      </View>
                      {canDelete && (
                        <TouchableOpacity
                          onPress={() => handleDeleteEvent(event)}
                          style={{
                            backgroundColor: colors.error,
                            padding: 6,
                            borderRadius: 4,
                          }}
                        >
                          <Icon name="trash" size={14} color={colors.backgroundAlt} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      <SimpleBottomSheet
        isVisible={showAddEvent}
        onClose={() => setShowAddEvent(false)}
      >
        <AddEventForm
          selectedDate={selectedDate}
          onAddEvent={handleAddEvent}
          onCancel={() => setShowAddEvent(false)}
        />
      </SimpleBottomSheet>
    </View>
  );
}
