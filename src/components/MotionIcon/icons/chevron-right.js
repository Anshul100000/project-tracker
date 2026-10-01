/* eslint-disable */
// chevron-right — from lucide-animated (https://github.com/pqoqubbw/icons), MIT License.
import { motion, useAnimation } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import cn from "components/MotionIcon/cn";
const DEFAULT_TRANSITION = {
    times: [0, 0.4, 1],
    duration: 0.5,
};
const ChevronRightIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);
    useImperativeHandle(ref, () => {
        isControlledRef.current = true;
        return {
            startAnimation: () => controls.start("animate"),
            stopAnimation: () => controls.start("normal"),
        };
    });
    const handleMouseEnter = useCallback((e) => {
        if (isControlledRef.current) {
            onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter(e);
        }
        else {
            controls.start("animate");
        }
    }, [controls, onMouseEnter]);
    const handleMouseLeave = useCallback((e) => {
        if (isControlledRef.current) {
            onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave(e);
        }
        else {
            controls.start("normal");
        }
    }, [controls, onMouseLeave]);
    return (<div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
      <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
        <motion.path animate={controls} d="m9 18 6-6-6-6" transition={DEFAULT_TRANSITION} variants={{
            normal: { x: 0 },
            animate: { x: [0, 2, 0] },
        }}/>
      </svg>
    </div>);
});
ChevronRightIcon.displayName = "ChevronRightIcon";
export { ChevronRightIcon };
