import clsx from 'clsx';

interface Props {
  /** Speeds up the animation to signal the assistant is working. */
  active?: boolean;
  className?: string;
}

/**
 * Lightweight, animated AI orb built entirely from CSS/SVG — no WebGL.
 * A rotating conic gradient core, a glossy highlight and a soft pulsing halo
 * give it life without the weight (or deprecation warnings) of three.js.
 */
export default function AiOrb({ active = false, className }: Props) {
  return (
    <span className={clsx('ai-orb', active && 'is-active', className)} aria-hidden="true">
      <span className="ai-orb-halo" />
      <span className="ai-orb-core">
        <span className="ai-orb-gloss" />
        <span className="ai-orb-spark" />
      </span>
    </span>
  );
}
