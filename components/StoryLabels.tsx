import { ArrowCurveDoodle } from './doodles';

export default function StoryLabels({ target }: { target:'card'|'phone' }) {
  return <span className={`story-labels story-annotation-${target}`} aria-hidden="true">
    <span>{target === 'card' ? 'Your card' : 'Someone’s phone'}</span>
    <ArrowCurveDoodle/>
  </span>;
}
