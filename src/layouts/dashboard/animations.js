import { keyframes } from "@emotion/react";

const rise = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(23, 178, 106, 0.45); }
  70%  { box-shadow: 0 0 0 6px rgba(23, 178, 106, 0); }
  100% { box-shadow: 0 0 0 0 rgba(23, 178, 106, 0); }
`;

// Short, subtle entrance; disabled for users who ask the OS for less motion.
export const enter = (delay = 0) => ({
  animation: `${rise} .4s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
});
