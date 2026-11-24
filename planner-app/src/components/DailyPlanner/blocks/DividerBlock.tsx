import { Block } from '../../../types';

interface DividerBlockProps {
  block: Block;
  date: string;
}

export default function DividerBlock(_props: DividerBlockProps) {
  return (
    <div className="w-full py-2">
      <hr
        className="border-none h-px w-full"
        style={{
          backgroundColor: 'var(--border)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}
