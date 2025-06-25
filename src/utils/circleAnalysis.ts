interface Point {
  x: number;
  y: number;
}

interface CircleAnalysis {
  score: number;
  center: Point;
  averageRadius: number;
}

export const analyzeCircle = (points: Point[]): CircleAnalysis => {
  if (points.length < 10) {
    return { score: 0, center: { x: 0, y: 0 }, averageRadius: 0 };
  }

  // Find center point using least squares method
  const center = findCenter(points);
  
  // Calculate distances from center to each point
  const distances = points.map(point => 
    Math.sqrt(Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2))
  );
  
  const averageRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  
  // Calculate consistency score (how close each point is to average radius)
  const radiusVariations = distances.map(d => Math.abs(d - averageRadius));
  const averageVariation = radiusVariations.reduce((sum, v) => sum + v, 0) / radiusVariations.length;
  const consistencyScore = Math.max(0, 100 - (averageVariation / averageRadius) * 100);
  
  // Calculate closure score (how well the circle closes)
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const closureDistance = Math.sqrt(
    Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2)
  );
  const closureScore = Math.max(0, 100 - (closureDistance / averageRadius) * 50);
  
  // Calculate roundness score using angular consistency
  const roundnessScore = calculateRoundness(points, center);
  
  // Combine all scores with weights
  const finalScore = Math.min(100, 
    consistencyScore * 0.4 + 
    closureScore * 0.3 + 
    roundnessScore * 0.3
  );
  
  return {
    score: Math.max(0, finalScore),
    center,
    averageRadius
  };
};

const findCenter = (points: Point[]): Point => {
  // Use centroid as initial approximation
  const centroid = {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length
  };
  
  // Refine using weighted approach
  let bestCenter = centroid;
  let bestScore = Infinity;
  
  for (let dx = -20; dx <= 20; dx += 5) {
    for (let dy = -20; dy <= 20; dy += 5) {
      const testCenter = { x: centroid.x + dx, y: centroid.y + dy };
      const distances = points.map(p => 
        Math.sqrt(Math.pow(p.x - testCenter.x, 2) + Math.pow(p.y - testCenter.y, 2))
      );
      const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
      const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
      
      if (variance < bestScore) {
        bestScore = variance;
        bestCenter = testCenter;
      }
    }
  }
  
  return bestCenter;
};

const calculateRoundness = (points: Point[], center: Point): number => {
  if (points.length < 8) return 50;
  
  // Calculate angles for each point relative to center
  const angles = points.map(point => 
    Math.atan2(point.y - center.y, point.x - center.x)
  );
  
  // Normalize angles to [0, 2π]
  const normalizedAngles = angles.map(angle => angle < 0 ? angle + 2 * Math.PI : angle);
  
  // Sort angles
  normalizedAngles.sort((a, b) => a - b);
  
  // Calculate angular differences
  const angularDiffs = [];
  for (let i = 0; i < normalizedAngles.length - 1; i++) {
    angularDiffs.push(normalizedAngles[i + 1] - normalizedAngles[i]);
  }
  // Add wrap-around difference
  angularDiffs.push(2 * Math.PI - normalizedAngles[normalizedAngles.length - 1] + normalizedAngles[0]);
  
  // Calculate consistency of angular spacing
  const expectedDiff = (2 * Math.PI) / normalizedAngles.length;
  const angularVariance = angularDiffs.reduce((sum, diff) => 
    sum + Math.pow(diff - expectedDiff, 2), 0
  ) / angularDiffs.length;
  
  // Convert to score (lower variance = higher score)
  const roundnessScore = Math.max(0, 100 - (angularVariance / expectedDiff) * 200);
  
  return roundnessScore;
};