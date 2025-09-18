
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

interface TextStyleEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

interface StyleButton {
  id: string;
  icon: string;
  label: string;
  prefix: string;
  suffix: string;
}

export default function TextStyleEditor({ value, onChangeText, placeholder }: TextStyleEditorProps) {
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const styleButtons: StyleButton[] = [
    { id: 'bold', icon: 'text', label: 'Bold', prefix: '**', suffix: '**' },
    { id: 'italic', icon: 'text', label: 'Italic', prefix: '*', suffix: '*' },
    { id: 'heading', icon: 'text', label: 'Heading', prefix: '# ', suffix: '' },
    { id: 'bullet', icon: 'list', label: 'Bullet', prefix: '• ', suffix: '' },
  ];

  const applyStyle = (style: StyleButton) => {
    const beforeSelection = value.substring(0, selectionStart);
    const selectedText = value.substring(selectionStart, selectionEnd);
    const afterSelection = value.substring(selectionEnd);

    let newText: string;
    let newCursorPosition: number;

    if (selectedText) {
      // Apply style to selected text
      newText = beforeSelection + style.prefix + selectedText + style.suffix + afterSelection;
      newCursorPosition = selectionEnd + style.prefix.length + style.suffix.length;
    } else {
      // Insert style markers at cursor position
      if (style.id === 'heading' || style.id === 'bullet') {
        // For line-based styles, apply to the current line
        const lines = value.split('\n');
        const currentLineIndex = beforeSelection.split('\n').length - 1;
        const currentLine = lines[currentLineIndex];
        
        if (style.id === 'heading' && !currentLine.startsWith('# ')) {
          lines[currentLineIndex] = '# ' + currentLine;
        } else if (style.id === 'bullet' && !currentLine.startsWith('• ')) {
          lines[currentLineIndex] = '• ' + currentLine;
        }
        
        newText = lines.join('\n');
        newCursorPosition = selectionStart + style.prefix.length;
      } else {
        // For inline styles, insert placeholder text
        const placeholder = style.id === 'bold' ? 'bold text' : 'italic text';
        newText = beforeSelection + style.prefix + placeholder + style.suffix + afterSelection;
        newCursorPosition = selectionStart + style.prefix.length + placeholder.length + style.suffix.length;
      }
    }

    onChangeText(newText);
    console.log('Applied style:', style.id);
  };

  const renderStyledText = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      let processedLine = line;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;

      // Handle headings
      if (line.startsWith('# ')) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { 
            fontSize: 20, 
            fontWeight: 'bold', 
            marginBottom: 12,
            color: colors.primary 
          }]}>
            {line.substring(2)}
          </Text>
        );
      }

      // Handle bullet points
      if (line.startsWith('• ')) {
        return (
          <View key={lineIndex} style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Text style={[commonStyles.text, { marginRight: 8 }]}>•</Text>
            <Text style={[commonStyles.text, { flex: 1 }]}>
              {renderInlineStyles(line.substring(2))}
            </Text>
          </View>
        );
      }

      // Handle regular paragraphs with inline styles
      return (
        <Text key={lineIndex} style={[commonStyles.text, { 
          marginBottom: lineIndex < lines.length - 1 ? 12 : 0,
          lineHeight: 22 
        }]}>
          {renderInlineStyles(line)}
        </Text>
      );
    });
  };

  const renderInlineStyles = (text: string) => {
    const elements: React.ReactNode[] = [];
    let remainingText = text;
    let keyIndex = 0;

    // Process bold text (**text**)
    while (remainingText.includes('**')) {
      const startIndex = remainingText.indexOf('**');
      const endIndex = remainingText.indexOf('**', startIndex + 2);
      
      if (endIndex === -1) break;

      // Add text before bold
      if (startIndex > 0) {
        elements.push(remainingText.substring(0, startIndex));
      }

      // Add bold text
      const boldText = remainingText.substring(startIndex + 2, endIndex);
      elements.push(
        <Text key={keyIndex++} style={{ fontWeight: 'bold' }}>
          {boldText}
        </Text>
      );

      remainingText = remainingText.substring(endIndex + 2);
    }

    // Process italic text (*text*)
    let processedText = remainingText;
    remainingText = '';
    let tempElements: React.ReactNode[] = [];

    while (processedText.includes('*')) {
      const startIndex = processedText.indexOf('*');
      const endIndex = processedText.indexOf('*', startIndex + 1);
      
      if (endIndex === -1) break;

      // Add text before italic
      if (startIndex > 0) {
        tempElements.push(processedText.substring(0, startIndex));
      }

      // Add italic text
      const italicText = processedText.substring(startIndex + 1, endIndex);
      tempElements.push(
        <Text key={keyIndex++} style={{ fontStyle: 'italic' }}>
          {italicText}
        </Text>
      );

      processedText = processedText.substring(endIndex + 1);
    }

    // Add remaining text
    if (processedText) {
      tempElements.push(processedText);
    }

    elements.push(...tempElements);

    // If no styling was applied, return the original text
    if (elements.length === 0) {
      return remainingText || text;
    }

    return elements;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Toolbar */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.backgroundAlt,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {styleButtons.map((style) => (
              <TouchableOpacity
                key={style.id}
                onPress={() => applyStyle(style)}
                style={{
                  backgroundColor: colors.background,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  minWidth: 60,
                }}
              >
                <Icon name={style.icon} size={16} color={colors.text} />
                <Text style={[commonStyles.textSecondary, { fontSize: 10, marginTop: 2 }]}>
                  {style.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => setShowPreview(!showPreview)}
          style={{
            backgroundColor: showPreview ? colors.primary : colors.background,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: showPreview ? colors.primary : colors.border,
            marginLeft: 12,
          }}
        >
          <Icon 
            name={showPreview ? 'eye-off' : 'eye'} 
            size={16} 
            color={showPreview ? colors.backgroundAlt : colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Editor/Preview */}
      {showPreview ? (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <View style={[commonStyles.card, { backgroundColor: colors.background }]}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 16, color: colors.primary }]}>
              Preview
            </Text>
            {value.trim() ? (
              renderStyledText(value)
            ) : (
              <Text style={commonStyles.textSecondary}>
                Start typing to see the preview...
              </Text>
            )}
          </View>
        </ScrollView>
      ) : (
        <TextInput
          style={[commonStyles.input, {
            flex: 1,
            textAlignVertical: 'top',
            fontSize: 16,
            lineHeight: 24,
            margin: 16,
            padding: 16,
            borderRadius: 8,
          }]}
          placeholder={placeholder || "Start typing your newsletter content...\n\nFormatting tips:\n• Use **bold** for bold text\n• Use *italic* for italic text\n• Start lines with # for headings\n• Start lines with • for bullet points"}
          value={value}
          onChangeText={onChangeText}
          onSelectionChange={(event) => {
            setSelectionStart(event.nativeEvent.selection.start);
            setSelectionEnd(event.nativeEvent.selection.end);
          }}
          placeholderTextColor={colors.textSecondary}
          multiline={true}
        />
      )}

      {/* Help Text */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.backgroundAlt,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <Text style={[commonStyles.textSecondary, { fontSize: 12, textAlign: 'center' }]}>
          Select text and tap formatting buttons, or use markdown: **bold**, *italic*, # heading, • bullet
        </Text>
      </View>
    </View>
  );
}
