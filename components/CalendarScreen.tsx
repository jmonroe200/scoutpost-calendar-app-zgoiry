
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';
import AddEventForm from './AddEventForm';

interface ScoutEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'meeting' | 'activity' | 'camping' | 'service';
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [events, setEvents] = useState<ScoutEvent[]>([
    {
      id: '1',
      title: 'Troop Meeting',
      date: '2024-01-15',
      time: '7:00 PM',
      location: 'Scout Hall',
      description: 'Weekly troop meeting with badge work',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Winter Camping',
      date: '2024-01-20',
      time: '9:00 AM',
      location: 'Pine Ridge Camp',
      description: 'Weekend winter camping adventure',
      type: 'camping'
    },
    {
      id: '3',
      title: 'Community Service',
      date: '2024-01-25',
      time: '10:00 AM',
      location: 'Local Food Bank',
      description: 'Volunteer at the community food bank',
      type: 'service'
    }
  ]);

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

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: getEventTypeColor(event.type),
    };
    return acc;
  }, {} as any);

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    };
  }

  const selectedDateEvents = events.filter(event => event.date === selectedDate);

  const handleAddEvent = (newEvent: Omit<ScoutEvent, 'id'>) => {
    const event: ScoutEvent = {
      ...newEvent,
      id: Date.now().toString(),
    };
    setEvents([...events, event]);
    setShowAddEvent(false);
    console.log('Added new event:', event);
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents(events.filter(e => e.id !== eventId));
            console.log('Deleted event:', eventId);
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          <Calendar
            onDayPress={(day) => {
              console.log('Selected date:', day.dateString);
              setSelectedDate(day.dateString);
            }}
            markedDates={markedDates}
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

        {selectedDate && (
          <View style={commonStyles.section}>
            <View style={commonStyles.row}>
              <Text style={commonStyles.subtitle}>
                Events for {new Date(selectedDate).toLocaleDateString()}
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
              selectedDateEvents.map((event) => (
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
                        <Text style={[commonStyles.subtitle, { marginBottom: 0 }]}>
                          {event.title}
                        </Text>
                      </View>
                      <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>
                        {event.time} • {event.location}
                      </Text>
                      <Text style={commonStyles.text}>
                        {event.description}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteEvent(event.id)}
                      style={{ padding: 8 }}
                    >
                      <Icon name="trash" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {!selectedDate && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.subtitle}>Upcoming Events</Text>
            {events.slice(0, 3).map((event) => (
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
                      <Text style={[commonStyles.subtitle, { marginBottom: 0 }]}>
                        {event.title}
                      </Text>
                    </View>
                    <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>
                      {new Date(event.date).toLocaleDateString()} • {event.time}
                    </Text>
                    <Text style={commonStyles.text}>
                      {event.location}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
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
