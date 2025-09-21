
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

interface AddEventFormProps {
  selectedDate: string;
  onAddEvent: (event: {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    type: 'meeting' | 'activity' | 'camping' | 'service';
  }) => void;
  onCancel: () => void;
}

export default function AddEventForm({ selectedDate, onAddEvent, onCancel }: AddEventFormProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'meeting' | 'activity' | 'camping' | 'service'>('meeting');

  const eventTypes = [
    { key: 'meeting', label: 'Meeting', icon: 'people', color: colors.info },
    { key: 'activity', label: 'Activity', icon: 'fitness', color: colors.success },
    { key: 'camping', label: 'Camping', icon: 'bonfire', color: colors.secondary },
    { key: 'service', label: 'Service', icon: 'heart', color: colors.warning },
  ];

  const handleSubmit = () => {
    if (!title || !time || !location) {
      console.log('Missing required fields');
      return;
    }

    onAddEvent({
      title,
      date: selectedDate || new Date().toISOString().split('T')[0],
      time,
      location,
      description,
      type,
    });

    // Reset form
    setTitle('');
    setTime('');
    setLocation('');
    setDescription('');
    setType('meeting');
  };

  return (
    <ScrollView style={{ maxHeight: 600 }}>
      <View style={{ padding: 20 }}>
        <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 20 }]}>
          Add New Event
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Event Title *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter event title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Event Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {eventTypes.map((eventType) => (
              <TouchableOpacity
                key={eventType.key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: type === eventType.key ? eventType.color : colors.grey,
                  marginRight: 8,
                  marginBottom: 8,
                }}
                onPress={() => setType(eventType.key as any)}
              >
                <Icon
                  name={eventType.icon as any}
                  size={16}
                  color={type === eventType.key ? colors.backgroundAlt : colors.text}
                />
                <Text style={{
                  marginLeft: 6,
                  color: type === eventType.key ? colors.backgroundAlt : colors.text,
                  fontWeight: type === eventType.key ? '600' : '400',
                }}>
                  {eventType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Time *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g., 7:00 PM"
            value={time}
            onChangeText={setTime}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Location *</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Enter location"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>Description</Text>
          <TextInput
            style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Enter event description (URLs will be clickable)"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={[commonStyles.button, { flex: 1, backgroundColor: colors.grey }]}
            onPress={onCancel}
          >
            <Text style={[commonStyles.buttonText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.button, { flex: 1 }]}
            onPress={handleSubmit}
          >
            <Text style={commonStyles.buttonText}>
              Add Event
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
