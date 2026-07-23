//for reputation badge that is displayed on profile page

import React from 'react';

export const BADGE_LEVELS = [
  { pts: 0,    label: 'NEWSeller',         icon: '🌱', cls: 'ns-rep-newcomer' },
  { pts: 10,   label: 'First Transaction', icon: '🤝', cls: 'ns-rep-trusted'  },
  { pts: 50,   label: 'Experienced',       icon: '⭐', cls: 'ns-rep-trusted'  },
  { pts: 150,  label: 'Trusted',           icon: '🔵', cls: 'ns-rep-reliable' },
  { pts: 300,  label: 'Reliable',          icon: '💎', cls: 'ns-rep-reliable' },
  { pts: 500,  label: 'Star Seller',       icon: '🏆', cls: 'ns-rep-star'     },
  { pts: 1000, label: 'Legendary',         icon: '👑', cls: 'ns-rep-legend'   },
];

export function getBadgeInfo(points) {
  // walk backwards to find the highest unlocked level
  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    if (points >= BADGE_LEVELS[i].pts) {
      const current  = BADGE_LEVELS[i];
      const next     = BADGE_LEVELS[i + 1] || null;
      return { ...current, next: next?.label || null, nextAt: next?.pts || current.pts };
    }
  }
  return { ...BADGE_LEVELS[0], next: BADGE_LEVELS[1].label, nextAt: BADGE_LEVELS[1].pts };
}

export function getLevelFloor(points) {
  for (let i = BADGE_LEVELS.length - 1; i >= 0; i--) {
    if (points >= BADGE_LEVELS[i].pts) return BADGE_LEVELS[i].pts;
  }
  return 0;
}

export default function ReputationBadge({ points = 0, small = false, showPoints = false }) {
  const badge = getBadgeInfo(points);
  return (
    <span className={`ns-rep ${badge.cls} ${small ? 'ns-rep-sm' : ''}`}>
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
      {showPoints && <span style={{ opacity: 0.65, fontWeight: 400 }}>· {points} pts</span>}
    </span>
  );
}