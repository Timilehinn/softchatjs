import { View, Text, StyleSheet, TextStyle } from 'react-native'
import React, { useCallback } from 'react'

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  heading?: boolean
};

// Define element types for Slate nodes
type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type HeadingElement = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: CustomText[];
};


type CodeElement = {
  type: 'code';
  children: CustomText[];
};

type BlockQuoteElement = {
  type: 'quote';
  children: CustomText[];
};

type ListItemElement = {
  type: 'list-item';
  children: CustomText[];
};

type BulletedListElement = {
  type: 'bulleted-list';
  children: ListItemElement[];
};

type NumberedListElement = {
  type: 'numbered-list';
  children: ListItemElement[];
};

// Define the Descendant type, combining all possible elements and text nodes
type CustomElement =
  | ParagraphElement
  | HeadingElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | CodeElement;

export type CustomDescendant = CustomElement | CustomText;

const test: CustomDescendant[] = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": "This is a ",
      },
      {
        "text": "bold",
        "bold": true
      },
      {
        "text": " and ",
      },
      {
        "text": "italic",
        "italic": true
      },
      {
        "text": " sentence with ",
      },
      {
        "text": "strikethrough",
        "strikethrough": true
      },
      {
        "text": " text."
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Here is some text with ",
      },
      {
        "text": "underline",
        "underline": true
      },
      {
        "text": " formatting."
      }
    ]
  },
  {
    "type": "quote",
    "children": [
      {
        "text": "This is a blockquote. It can contain multiple lines of text.",
        "italic": true
      }
    ]
  },
  {
    "type": "bulleted-list",
    "children": [
      {
        "type": "list-item",
        "children": [
          {
            "text": "First item in a bulleted list"
          }
        ]
      },
      {
        "type": "list-item",
        "children": [
          {
            "text": "Second item in a bulleted list with ",
          },
          {
            "text": "bold",
            "bold": true
          },
          {
            "text": " and ",
          },
          {
            "text": "strikethrough",
            "strikethrough": true
          },
          {
            "text": " text."
          }
        ]
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "A line of text with ",
        "strikethrough": true,
        "bold": true
      },
      {
        "text": "strikethrough, bold, and italic formatting.",
        "strikethrough": true,
        "bold": true,
        "italic": true
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Here's a nested example: "
      },
      {
        "text": "This text is bold",
        "bold": true
      },
      {
        "text": " and ",
      },
      {
        "text": "italic with underline: ",
        "italic": true,
        "underline": true
      },
      {
        "text": "."
      }
    ]
  },
  {
    "type": "numbered-list",
    "children": [
      {
        "type": "list-item",
        "children": [
          {
            "text": "First item in a numbered list"
          }
        ]
      },
      {
        "type": "list-item",
        "children": [
          {
            "text": "Second item with mixed ",
          },
          {
            "text": "formats",
            "bold": true,
            "italic": true
          },
          {
            "text": "."
          }
        ]
      },
      {
        "type": "list-item",
        "children": [
          {
            "text": "Third item with ",
          },
          {
            "text": "underline",
            "underline": true
          },
          {
            "text": " and ",
          },
          {
            "text": "strikethrough",
            "strikethrough": true
          },
          {
            "text": " formatting."
          }
        ]
      }
    ]
  }
]

const calcFontSize = (level: number) => {
  if(level >= 1 && level <= 6 ){
    return 35 - level * 2
  }
  return 18
}

type ElementTypeGenerics<T extends CustomElement | CustomText> = T extends CustomText
  ? CustomText
  : CustomElement;

function isCustomText(node: CustomElement | CustomText): node is CustomText {
  return (node as CustomText).text !== undefined;
}

function renderNode(node: CustomElement | CustomText, level: number = 0){
  if (!node) return null;

  if (isCustomText(node)) {
    let textStyles: TextStyle[] = [{ fontSize: calcFontSize(level), color: 'white' }, {}];
    if (node.bold) textStyles.push(styles.bold);
    if (node.italic) textStyles.push(styles.italic);
    if (node.underline) textStyles.push(styles.underline);
    if (node.strikethrough) textStyles.push(styles.strikethrough);
    if (node.heading) textStyles.push({ fontSize: calcFontSize(1), fontWeight: "bold" });
    return <Text style={textStyles}>{node.text}</Text>;
  }

  switch (node.type) {
    case 'paragraph':
      return (
        <Text style={styles.paragraph}>
          {node.children.map((child, index) => (
            <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
          ))}
        </Text>
      );
    case 'heading':
      return (
        <Text style={[styles.heading, { fontSize: 35 - node.level * 2 }]}>
          {node.children.map((child, index) => (
            <React.Fragment key={index}>{renderNode(child, node?.level?? 0)}</React.Fragment>
          ))}
        </Text>
      );
    case 'code':
        return (
          <View style={[styles.code]}>
            {node.children.map((child, index) => (
              <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
            ))}
          </View>
        );
    case 'quote':
      return (
        <View style={styles.quote}>
          {node.children.map((child, index) => (
            <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
          ))}
        </View>
      );
    case 'bulleted-list':
    case 'numbered-list':
      return (
        <View style={styles.list}>
          {node.children.map((child, index) => (
            <View key={index} style={styles.listItem}>
              {node.type === 'bulleted-list' ? <Text style={{ color: 'white' }}>•</Text> : <Text style={{ color: 'white' }}>{index + 1}.</Text>}
              {renderNode(child)}
            </View>
          ))}
        </View>
      );
    case 'list-item':
      return (
        <Text style={styles.listItemText}>
          {node.children.map((child, index) => (
            <React.Fragment key={index}>{renderNode(child)}</React.Fragment>
          ))}
        </Text>
      );
    default:
      return null;
  }
};

const SlateRenderer = ({ document }: { document: CustomDescendant[] }) => {
  return (
    <View style={styles.container}>
      {document.map((node, index) => (
        <React.Fragment key={index}>{renderNode(node)}</React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  text: {
    fontSize: 16,
    color: 'white'
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  paragraph: {
    marginVertical: 2.5,
  },
  heading: {
    fontWeight: 'bold',
    marginVertical: 8,
  },
  quote: {
    fontStyle: 'italic',
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
    paddingLeft: 8,
    marginVertical: 8,
  },
  list: {
    paddingLeft: 10,
    marginVertical: 10
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemText: {
    marginLeft: 5,
  },
  code: {
    padding: 10,
    backgroundColor: "#2C2D33",
    borderRadius: 5
  }
});

export default SlateRenderer;

