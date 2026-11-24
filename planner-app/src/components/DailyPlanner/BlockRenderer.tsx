import React from 'react';
import { Block } from '../../types';
import {
  TodoListBlock,
  TextBlock,
  HeadingBlock,
  BulletListBlock,
  NumberedListBlock,
  EventBlock,
  TimeBlockBlock,
  DividerBlock,
  ReminderBlock,
  ImageBlock,
} from './blocks';

interface BlockRendererProps {
  block: Block;
  date: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, date }) => {
  switch (block.type) {
    case 'todo-list':
      return <TodoListBlock block={block} date={date} />;
    case 'text':
      return <TextBlock block={block} date={date} />;
    case 'heading':
      return <HeadingBlock block={block} date={date} />;
    case 'bullet-list':
      return <BulletListBlock block={block} date={date} />;
    case 'numbered-list':
      return <NumberedListBlock block={block} date={date} />;
    case 'event':
      return <EventBlock block={block} date={date} />;
    case 'time-block':
      return <TimeBlockBlock block={block} date={date} />;
    case 'divider':
      return <DividerBlock block={block} date={date} />;
    case 'reminder':
      return <ReminderBlock block={block} date={date} />;
    case 'image':
      return <ImageBlock block={block} date={date} />;
    default:
      return <div>Unknown block type: {block.type}</div>;
  }
};
