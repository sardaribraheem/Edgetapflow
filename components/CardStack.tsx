import EdgeTapCard from './EdgeTapCard';
import EdgeTapCardBack from './EdgeTapCardBack';

export default function CardStack({ highPriority = false }: { highPriority?: boolean }) {
  return <div className="card-face-stack" aria-label="EdgeTap card, front and QR back">
    <EdgeTapCardBack className="card-stack-back"/>
    <div className="card-stack-front"><EdgeTapCard highPriority={highPriority}/></div>
  </div>;
}
