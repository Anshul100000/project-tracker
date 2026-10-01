import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ICONS from "components/MotionIcon/icons";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Animated line icon (lucide-animated, MIT).
 *
 * - Animates on its own hover.
 * - `play` lets a parent drive it (e.g. animate while the whole nav item is hovered).
 * - `loop` (ms) replays the animation on an interval so the icon keeps moving.
 */
function MotionIcon({ name, size, color, play, loop, loopDelay, style, ...rest }) {
  const Icon = ICONS[name];
  const ref = useRef(null);
  // Some icons can only return to rest after they've animated once; never "stop" a fresh icon.
  const played = useRef(false);
  const start = () => {
    played.current = true;
    ref.current?.startAnimation();
  };
  const stop = () => {
    if (played.current) ref.current?.stopAnimation();
  };

  useEffect(() => {
    if (!ref.current) return;
    if (play) start();
    else stop();
  }, [play]);

  useEffect(() => {
    if (!loop || reducedMotion()) return undefined;
    let interval;
    const kick = () => {
      start();
      // return to rest so the next cycle replays from the start
      setTimeout(() => !play && stop(), Math.min(1200, loop / 2));
    };
    const first = setTimeout(() => {
      kick();
      interval = setInterval(kick, loop);
    }, loopDelay);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [loop, loopDelay, play]);

  if (!Icon) return null;
  return (
    <Icon
      ref={ref}
      size={size}
      onMouseEnter={start}
      onMouseLeave={() => !play && stop()}
      style={{ display: "inline-grid", placeItems: "center", color, lineHeight: 0, ...style }}
      {...rest}
    />
  );
}

MotionIcon.defaultProps = { size: 20, color: "currentColor", play: false, loop: 0, loopDelay: 400, style: {} };
MotionIcon.propTypes = {
  name: PropTypes.oneOf(Object.keys(ICONS)).isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  play: PropTypes.bool,
  loop: PropTypes.number,
  loopDelay: PropTypes.number,
  style: PropTypes.object,
};

export default MotionIcon;
