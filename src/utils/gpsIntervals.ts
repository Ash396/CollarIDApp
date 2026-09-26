// Dynamic (activity-based) GPS: the three intervals and the rule between
// them.
//
// The base interval applies while the animal is still; the firmware takes
// fixes FASTER while it moves (mediumMotion while walking, highMotion while
// running — VeDBA thresholds pick the band). So each faster band's interval
// must be no longer than the band below it. 0 means "same as the base
// interval" (the firmware and both power models fall back to it), so 0 is
// never too long.
//
// The stock intervals used to be base 20 / medium 10 / high 5 in every
// client, and the editor's own fallback was inverted (medium 10, high 5
// against a 5-minute base was possible). Now 2 and 1 minutes: what the
// website will use too.
import type { Schedule } from '../navigation/ScheduleNavigator';

/** Stock medium-motion (walking) interval, minutes. */
export const DYNAMIC_GPS_DEFAULT_MEDIUM_MIN = 2;
/** Stock high-motion (running) interval, minutes. */
export const DYNAMIC_GPS_DEFAULT_HIGH_MIN = 1;

/** Why this GPS block cannot be saved as is, in one plain sentence, or
 *  null when it can. Only speaks when dynamic sampling is actually on:
 *  with it off the motion intervals do nothing, whatever they hold. The
 *  values are reported, never rewritten — the operator picks which one to
 *  change. */
export function dynamicGpsIntervalError(
  g: Schedule['gps'] | undefined,
): string | null {
  if (!g?.enabled || !g.dynamicSamplingMode) return null;
  const base = g.sampleIntervalMin ?? 0;
  const med = g.mediumMotionGpsIntervalMin ?? 0;
  const high = g.highMotionGpsIntervalMin ?? 0;
  if (med && med > base) {
    return (
      `The walking interval must not be longer than the still interval ` +
      `(${med} min when walking, ${base} min when still). ` +
      'The collar takes positions more often while the animal moves, never less often; 0 means the same as when still.'
    );
  }
  const medEff = med || base;
  if (high && high > medEff) {
    return (
      `The running interval must not be longer than the walking interval ` +
      `(${high} min when running, ${medEff} min when walking). ` +
      'The collar takes positions more often while the animal moves, never less often; 0 means the same as when still.'
    );
  }
  return null;
}
