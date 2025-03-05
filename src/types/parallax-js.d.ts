declare module 'parallax-js' {
   export default class Parallax {
      constructor(element: HTMLElement, options?: {
         relativeInput?: boolean;
         clipRelativeInput?: boolean;
         hoverOnly?: boolean;
         calibrationThreshold?: number;
         calibrationDelay?: number;
         supportDelay?: number;
         calibrateX?: boolean;
         calibrateY?: boolean;
         invertX?: boolean;
         invertY?: boolean;
         limitX?: number | false;
         limitY?: number | false;
         scalarX?: number;
         scalarY?: number;
         frictionX?: number;
         frictionY?: number;
         originX?: number;
         originY?: number;
         pointerEvents?: boolean;
         precision?: number;
         selector?: string | null;
         onReady?: () => void;
      });
   }
} 