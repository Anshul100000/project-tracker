/* eslint-disable */
// sun-moon — from lucide-animated (https://github.com/pqoqubbw/icons), MIT License.
import { motion, useAnimation } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import cn from "components/MotionIcon/cn";
const SUN_VARIANTS = {
    normal: {
        rotate: 0,
    },
    animate: {
        rotate: [0, -5, 5, -2, 2, 0],
        transition: {
            duration: 1.5,
            ease: "easeInOut",
        },
    },
};
const MOON_VARIANTS = {
    normal: { opacity: 1 },
    animate: (i) => ({
        opacity: [0, 1],
        transition: { delay: i * 0.1, duration: 0.3 },
    }),
};
const SunMoonIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const sunControls = useAnimation();
    const moonControls = useAnimation();
    const isControlledRef = useRef(false);
    useImperativeHandle(ref, () => {
        isControlledRef.current = true;
        return {
            startAnimation: () => {
                sunControls.start("animate");
                moonControls.start("animate");
            },
            stopAnimation: () => {
                sunControls.start("normal");
                moonControls.start("normal");
            },
        };
    });
    const handleMouseEnter = useCallback((e) => {
        if (isControlledRef.current) {
            onMouseEnter === null || onMouseEnter === void 0 ? void 0 : onMouseEnter(e);
        }
        else {
            sunControls.start("animate");
            moonControls.start("animate");
        }
    }, [sunControls, moonControls, onMouseEnter]);
    const handleMouseLeave = useCallback((e) => {
        if (isControlledRef.current) {
            onMouseLeave === null || onMouseLeave === void 0 ? void 0 : onMouseLeave(e);
        }
        else {
            sunControls.start("normal");
            moonControls.start("normal");
        }
    }, [sunControls, moonControls, onMouseLeave]);
    return (<div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
        <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
          <motion.g animate={sunControls} initial="normal" variants={SUN_VARIANTS}>
            <path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4"/>
          </motion.g>
          {[
            "M12 2v2",
            "M12 20v2",
            "m4.9 4.9 1.4 1.4",
            "m17.7 17.7 1.4 1.4",
            "M2 12h2",
            "M20 12h2",
            "m6.3 17.7-1.4 1.4",
            "m19.1 4.9-1.4 1.4",
        ].map((d, index) => (<motion.path animate={moonControls} custom={index + 1} d={d} initial="normal" key={d} variants={MOON_VARIANTS}/>))}
        </svg>
      </div>);
});
SunMoonIcon.displayName = "SunMoonIcon";
export { SunMoonIcon };
