/**
 * Crucible Scene Adapter for 3d-shorts
 * Bridges 3d-shorts declarative shot & world descriptors into Crucible recipe format:
 * { format: "crucible.scene", schemaVersion: 1, geometries: [], materials: [], nodes: [], camera: {}, environment: {} }
 */

export function buildCrucibleRecipe({
  width = 1080,
  height = 1920,
  fps = 30,
  totalFrames = 592,
  shots = [],
  cameraFn = null,
  lights = {},
  nodes = [],
  materials = [],
  geometries = []
}) {
  const recipe = {
    format: "crucible.scene",
    schemaVersion: 1,
    environment: {
      exposure: 1.0,
      lines: {
        enabled: true,
        width: 1.8,
        color: [0.14, 0.09, 0.15],
        creaseAngle: 38
      },
      sky: {
        topColor: [0.25, 0.50, 0.83],
        horizonColor: [0.76, 0.85, 0.95],
        groundColor: [0.54, 0.51, 0.38]
      },
      fog: {
        enabled: true,
        near: 60,
        far: 800,
        color: [0.79, 0.86, 0.94]
      }
    },
    camera: {
      type: "perspective",
      fov: 40,
      aspect: width / height,
      near: 0.1,
      far: 1500,
      dof: {
        enabled: true,
        focalDistance: 5.0,
        aperture: 0.03
      }
    },
    geometries: geometries,
    materials: materials,
    nodes: nodes,
    timeline: {
      fps,
      totalFrames,
      shots: shots.map(s => ({
        id: s.id,
        startFrame: s.a,
        endFrame: s.b,
        light: s.light
      }))
    }
  };

  return recipe;
}
