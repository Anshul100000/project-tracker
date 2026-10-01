/* eslint-disable */
// users-round — from lucide-animated (https://github.com/pqoqubbw/icons), MIT License.
import { motion, useAnimation } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import cn from "components/MotionIcon/cn";
const PATH_VARIANTS = {
    normal: {
        translateX: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 13,
        },
    },
    animate: {
        translateX: [-4, 0],
        opacity: [0, 1],
        transition: {
            delay: 0.1,
            type: "spring",
            stiffness: 200,
            damping: 13,
        },
    },
};
const UsersRoundIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
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
          <path d="M18 21a8 8 0 0 0-16 0"/>
          <circle cx="10" cy="8" r="5"/>
          <motion.path animate={controls} d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" initial="normal" variants={PATH_VARIANTS}/>
        </svg>
      </div>);
});
UsersRoundIcon.displayName = "UsersRoundIcon";
export { UsersRoundIcon };
