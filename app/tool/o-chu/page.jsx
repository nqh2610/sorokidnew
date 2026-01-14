'use client';

import dynamic from 'next/dynamic';
import ToolLoadingSkeleton from '@/components/ToolLayout/ToolLoadingSkeleton';

const OChuClient = dynamic(() => import('./OChuClient'), { 
  ssr: false,
  loading: () => (
    <ToolLoadingSkeleton 
      toolKey="crossword"
      toolIcon="🔤"
    />
  )
});

export default function OChuPage() {
  return <OChuClient />;
}
