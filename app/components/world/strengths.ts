export const clamp = (
  value: number,
  min: number,
  max: number
) => {
  return Math.max(
    min,
    Math.min(max, value)
  );
};

export function getVoidStrength(
  darkness: number,
  solitude: number
) {
  return clamp(
    darkness * 0.75 +
      solitude * 0.65 -
      0.65,
    0,
    1
  );
}

export function getOrganismStrength(
  nature: number,
  fluidity: number,
  fantasy: number
) {
  return clamp(
    nature * 0.72 +
      fluidity * 0.48 +
      fantasy * 0.2 -
      0.55,
    0,
    1
  );
}

export function getWaveStrength(
  fluidity: number,
  speed: number,
  fantasy: number
) {
  return clamp(
    fluidity * 0.95 +
      (1 - speed) * 0.18 +
      fantasy * 0.18 -
      0.45,
    0,
    1
  );
}

export function getCrystalStrength(
  tension: number,
  fantasy: number,
  chaos: number
) {
  return clamp(
    tension * 0.95 +
      fantasy * 0.35 +
      chaos * 0.1 -
      0.62,
    0,
    1
  );
}

export function getRainStrength(
  speed: number,
  chaos: number,
  tension: number
) {
  return clamp(
    speed * 0.8 +
      chaos * 0.45 +
      tension * 0.35 -
      0.65,
    0,
    1
  );
}

export function getCloudStrength(
  quietness: number,
  spaciousness: number,
  darkness: number
) {
  return clamp(
    quietness * 0.85 +
      spaciousness * 0.35 +
      darkness * 0.12 -
      0.45,
    0,
    1
  );
}