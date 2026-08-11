import React from 'react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

export default function ScrollStackDemo() {
  return (
    <ScrollStack
      itemDistance={100}
      itemScale={0.03}
      itemStackDistance={30}
      stackPosition="20%"
      scaleEndPosition="10%"
      baseScale={0.85}
    >
      <ScrollStackItem itemClassName="bg-blue-600 text-white">
        <h2>Card 1</h2>
        <p>This is the first card in the scroll stack.</p>
      </ScrollStackItem>
      <ScrollStackItem itemClassName="bg-purple-600 text-white">
        <h2>Card 2</h2>
        <p>This is the second card in the scroll stack.</p>
      </ScrollStackItem>
      <ScrollStackItem itemClassName="bg-indigo-600 text-white">
        <h2>Card 3</h2>
        <p>This is the third card in the scroll stack.</p>
      </ScrollStackItem>
    </ScrollStack>
  );
}
