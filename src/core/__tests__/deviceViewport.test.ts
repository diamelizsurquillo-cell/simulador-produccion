import { describe, expect, it } from 'vitest';
import { classifyDeviceType, computeViewportInfo } from '../../hooks/useDeviceViewport';

describe('Responsive Device & Viewport Detection', () => {
  it('classifies mobile, tablet, laptop, and desktop widths accurately', () => {
    expect(classifyDeviceType(390)).toBe('mobile');
    expect(classifyDeviceType(768)).toBe('tablet');
    expect(classifyDeviceType(1024)).toBe('laptop');
    expect(classifyDeviceType(1440)).toBe('desktop');
  });

  it('computes optimal FOV, DPR, and orientation for portrait smartphones vs wide desktops', () => {
    const phone = computeViewportInfo(390, 844, true);
    expect(phone.deviceType).toBe('mobile');
    expect(phone.orientation).toBe('portrait');
    expect(phone.isCompact).toBe(true);
    expect(phone.recommendedFov).toBe(56);
    expect(phone.recommendedDpr).toEqual([1, 1.5]);

    const tabletLandscape = computeViewportInfo(1020, 768, true);
    expect(tabletLandscape.deviceType).toBe('tablet');
    expect(tabletLandscape.orientation).toBe('landscape');
    expect(tabletLandscape.recommendedDpr).toEqual([1, 1.5]);

    const desktop = computeViewportInfo(1920, 1080, false);
    expect(desktop.deviceType).toBe('desktop');
    expect(desktop.isCompact).toBe(false);
    expect(desktop.recommendedFov).toBe(42);
    expect(desktop.recommendedDpr).toEqual([1, 2]);
  });
});
