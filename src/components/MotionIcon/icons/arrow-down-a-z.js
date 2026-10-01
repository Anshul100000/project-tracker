/* eslint-disable */
// arrow-down-a-z — from lucide-animated (https://github.com/pqoqubbw/icons), MIT License.
import { motion, useAnimation } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import cn from "components/MotionIcon/cn";
const SWAP_TRANSITION = {
    type: "spring",
    stiffness: 240,
    damping: 24,
};
const SWAP_VARIANTS = {
    normal: {
        translateY: 0,
    },
    animate: (custom) => ({
        translateY: custom * 10,
    }),
};
const ArrowDownAZIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
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
          <path d="m3 16 4 4 4-4"/>
          <path d="M7 20V4"/>
          <motion.g animate={controls} custom={1} initial="normal" transition={SWAP_TRANSITION} variants={SWAP_VARIANTS}>
            <path d="M20 8h-5"/>
            <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10"/>
          </motion.g>
          <motion.path animate={controls} custom={-1} d="M15 14h5l-5 6h5" initial="normal" transition={SWAP_TRANSITION} variants={SWAP_VARIANTS}/>
        </svg>
      </div>);
});
ArrowDownAZIcon.displayName = "ArrowDownAZIcon";
export { ArrowDownAZIcon };
