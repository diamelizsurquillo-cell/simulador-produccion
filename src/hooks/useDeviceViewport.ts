import { useEffect, useState } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';
export type ViewportOrientation = 'portrait' | 'landscape';

export interface DeviceViewportInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  orientation: ViewportOrientation;
  isTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isCompact: boolean; // mobile or tablet
  recommendedFov: number;
  recommendedDpr: [number, number];
}

export function classifyDeviceType(width: number): DeviceType {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1280) return 'laptop';
  return 'desktop';
}

export function computeViewportInfo(width: number, height: number, isTouch: boolean): DeviceViewportInfo {
  const deviceType = classifyDeviceType(width);
  const orientation: ViewportOrientation = height > width ? 'portrait' : 'landscape';
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isCompact = isMobile || isTablet;

  // Wider FOV in portrait phones/tablets so the full bottling line remains comfortably framed
  const recommendedFov =
    isMobile && orientation === 'portrait'
      ? 56
      : isMobile
        ? 48
        : isTablet && orientation === 'portrait'
          ? 50
          : isTablet || deviceType === 'laptop'
            ? 45
            : 42;

  // Cap DPR at 1.5 on phones/tablets for smooth 60fps thermal & GPU performance
  const recommendedDpr: [number, number] = isCompact ? [1, 1.5] : [1, 2];

  return {
    width,
    height,
    deviceType,
    orientation,
    isTouch,
    isMobile,
    isTablet,
    isCompact,
    recommendedFov,
    recommendedDpr
  };
}

export function useDeviceViewport(): DeviceViewportInfo {
  const [info, setInfo] = useState<DeviceViewportInfo>(() => {
    if (typeof window === 'undefined') {
      return computeViewportInfo(1440, 900, false);
    }
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    return computeViewportInfo(window.innerWidth, window.innerHeight, isTouch);
  });

  useEffect(() => {
    const update = () => {
      const isTouch =
        window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
      setInfo(computeViewportInfo(window.innerWidth, window.innerHeight, isTouch));
    };

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return info;
}
