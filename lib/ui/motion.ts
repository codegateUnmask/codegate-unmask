export const motionTokens = {
  duration: {
    fast: 0.16,
    base: 0.24,
    slow: 0.3,
  },
  ease: {
    standard: [0.24, 1, 0.4, 1],
    emphasized: [0.2, 0, 0, 1],
  },
} as const;

export const motionTransition = {
  duration: motionTokens.duration.base,
  ease: motionTokens.ease.standard,
};
