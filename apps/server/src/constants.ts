import { clamp } from '@quiz-lib/utils';

const MAX_QNS = 20; // Limit the number of questions to a maximum of 20
export const NUM_QNS = clamp(Number(process.env.NUM_QNS) || 10, 1, MAX_QNS); // ... and a minimum of 1
