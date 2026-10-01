import PropTypes from "prop-types";
import UseAnimations from "react-useanimations";
import activity from "react-useanimations/lib/activity";
import settings2 from "react-useanimations/lib/settings2";
import menu3 from "react-useanimations/lib/menu3";
import infinity from "react-useanimations/lib/infinity";
import explore from "react-useanimations/lib/explore";
import star from "react-useanimations/lib/star";
import notification from "react-useanimations/lib/notification";
import searchToX from "react-useanimations/lib/searchToX";

// Animated line icons (react-useanimations, MIT). Add more from react-useanimations/lib/* here.
const ICONS = { activity, settings2, menu3, infinity, explore, star, notification, searchToX };

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function AnimatedIcon({ name, size, color, loop, autoplay, speed, reverse, ...rest }) {
  const still = reducedMotion();
  return (
    <UseAnimations
      animation={ICONS[name]}
      size={size}
      strokeColor={color}
      fillColor={color}
      loop={still ? false : loop}
      autoplay={still ? false : autoplay}
      speed={speed}
      reverse={reverse}
      wrapperStyle={{ display: "grid", placeItems: "center", pointerEvents: "none" }}
      {...rest}
    />
  );
}

AnimatedIcon.defaultProps = { size: 24, color: "currentColor", loop: true, autoplay: true, speed: 1, reverse: undefined };
AnimatedIcon.propTypes = {
  name: PropTypes.oneOf(Object.keys(ICONS)).isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  loop: PropTypes.bool,
  autoplay: PropTypes.bool,
  speed: PropTypes.number,
  reverse: PropTypes.bool,
};

export default AnimatedIcon;
