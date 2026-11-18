import * as THREE from 'three';

let cachedShellGeo: THREE.LatheGeometry | null = null;
let cachedLiquidGeo: THREE.LatheGeometry | null = null;
let cachedLabelGeo: THREE.CylinderGeometry | null = null;

/**
 * Authentic 1.5L Carbonated PET Bottle sculpted profile (total height ~0.56 units)
 */
export function getSculptedPetBottleGeometry(): THREE.LatheGeometry {
  if (cachedShellGeo) return cachedShellGeo;

  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.058, 0.0), // petaloid foot ring
    new THREE.Vector2(0.076, 0.025),
    new THREE.Vector2(0.078, 0.09), // lower bumper
    new THREE.Vector2(0.075, 0.19),
    new THREE.Vector2(0.069, 0.25), // ergonomic waist / label panel
    new THREE.Vector2(0.069, 0.34),
    new THREE.Vector2(0.076, 0.39), // upper bumper
    new THREE.Vector2(0.066, 0.45), // curved dome shoulder
    new THREE.Vector2(0.042, 0.50),
    new THREE.Vector2(0.024, 0.53), // neck
    new THREE.Vector2(0.030, 0.536), // pilfer support ring
    new THREE.Vector2(0.023, 0.542),
    new THREE.Vector2(0.023, 0.565), // threaded finish
    new THREE.Vector2(0.019, 0.565)
  ];

  cachedShellGeo = new THREE.LatheGeometry(points, 18);
  cachedShellGeo.computeVertexNormals();
  return cachedShellGeo;
}

/**
 * Matching inner cola liquid column (origin at y = 0.015 so scaling Y raises liquid level naturally!)
 */
export function getInternalLiquidGeometry(): THREE.LatheGeometry {
  if (cachedLiquidGeo) return cachedLiquidGeo;

  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.068, 0.01),
    new THREE.Vector2(0.072, 0.08),
    new THREE.Vector2(0.064, 0.23),
    new THREE.Vector2(0.064, 0.32),
    new THREE.Vector2(0.070, 0.37),
    new THREE.Vector2(0.054, 0.435),
    new THREE.Vector2(0.0, 0.44)
  ];

  cachedLiquidGeo = new THREE.LatheGeometry(points, 14);
  cachedLiquidGeo.computeVertexNormals();
  return cachedLiquidGeo;
}

/**
 * Wrap-aroundOPP label sleeve around the bottle waist
 */
export function getBottleLabelSleeveGeometry(): THREE.CylinderGeometry {
  if (cachedLabelGeo) return cachedLabelGeo;
  cachedLabelGeo = new THREE.CylinderGeometry(0.0715, 0.0715, 0.135, 16, 1, true);
  return cachedLabelGeo;
}
