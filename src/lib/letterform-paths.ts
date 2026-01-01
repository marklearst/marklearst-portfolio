/**
 * ML Letterform Coordinate Paths
 * Defines particle target positions to form clean geometric "ML" monogram
 */

export interface LetterformPoint {
  x: number
  y: number
}

/**
 * Generate M letterform points
 * Bold geometric sans-serif style
 */
export function generateM(
  startX: number,
  startY: number,
  height: number,
  width: number,
): LetterformPoint[] {
  const points: LetterformPoint[] = []
  const strokeWidth = width * 0.18 // Thick strokes for bold look
  const pointDensity = 3 // Points per pixel

  // Left vertical stroke
  for (let y = 0; y <= height; y += 1 / pointDensity) {
    for (let x = 0; x < strokeWidth; x += 1 / pointDensity) {
      points.push({
        x: startX + x,
        y: startY + y,
      })
    }
  }

  // Left diagonal (going up-right to center peak)
  const peakX = startX + width / 2
  const peakY = startY + height * 0.3
  const leftDiagSteps = 40
  for (let i = 0; i <= leftDiagSteps; i++) {
    const t = i / leftDiagSteps
    const x = startX + strokeWidth + t * (peakX - startX - strokeWidth)
    const y = startY + t * (peakY - startY)

    for (let w = 0; w < strokeWidth; w += 1 / pointDensity) {
      const angle = Math.atan2(peakY - startY, peakX - startX - strokeWidth)
      const offsetX = w * Math.sin(angle)
      const offsetY = w * -Math.cos(angle)
      points.push({ x: x + offsetX, y: y + offsetY })
    }
  }

  // Right diagonal (going down-right from peak)
  const rightDiagSteps = 40
  for (let i = 0; i <= rightDiagSteps; i++) {
    const t = i / rightDiagSteps
    const x = peakX + t * (startX + width - strokeWidth - peakX)
    const y = peakY + t * (startY - peakY)

    for (let w = 0; w < strokeWidth; w += 1 / pointDensity) {
      const angle = Math.atan2(
        startY - peakY,
        startX + width - strokeWidth - peakX,
      )
      const offsetX = w * Math.sin(angle)
      const offsetY = w * -Math.cos(angle)
      points.push({ x: x + offsetX, y: y + offsetY })
    }
  }

  // Right vertical stroke
  for (let y = 0; y <= height; y += 1 / pointDensity) {
    for (let x = 0; x < strokeWidth; x += 1 / pointDensity) {
      points.push({
        x: startX + width - strokeWidth + x,
        y: startY + y,
      })
    }
  }

  return points
}

/**
 * Generate L letterform points
 * Bold geometric sans-serif style
 */
export function generateL(
  startX: number,
  startY: number,
  height: number,
  width: number,
): LetterformPoint[] {
  const points: LetterformPoint[] = []
  const strokeWidth = width * 0.2 // Thick strokes for bold look
  const pointDensity = 3

  // Vertical stroke
  for (let y = 0; y <= height; y += 1 / pointDensity) {
    for (let x = 0; x < strokeWidth; x += 1 / pointDensity) {
      points.push({
        x: startX + x,
        y: startY + y,
      })
    }
  }

  // Horizontal stroke (bottom)
  for (let x = 0; x <= width; x += 1 / pointDensity) {
    for (let y = 0; y < strokeWidth; y += 1 / pointDensity) {
      points.push({
        x: startX + x,
        y: startY + height - strokeWidth + y,
      })
    }
  }

  return points
}

/**
 * Get complete ML monogram points
 * Centered in canvas with proper kerning
 */
export function getMLPoints(
  canvasWidth: number,
  canvasHeight: number,
  sampleCount: number = 200,
): LetterformPoint[] {
  // Letter dimensions
  const letterHeight = canvasHeight * 0.6
  const mWidth = letterHeight * 0.9
  const lWidth = letterHeight * 0.5
  const kerning = letterHeight * 0.15

  // Calculate total width and center
  const totalWidth = mWidth + kerning + lWidth
  const startX = (canvasWidth - totalWidth) / 2
  const startY = (canvasHeight - letterHeight) / 2

  // Generate letterforms
  const mPoints = generateM(startX, startY, letterHeight, mWidth)
  const lPoints = generateL(
    startX + mWidth + kerning,
    startY,
    letterHeight,
    lWidth,
  )

  // Combine all points
  const allPoints = [...mPoints, ...lPoints]

  // Sample down to target count (evenly distributed)
  const step = Math.floor(allPoints.length / sampleCount)
  const sampledPoints: LetterformPoint[] = []

  for (let i = 0; i < allPoints.length && sampledPoints.length < sampleCount; i += step) {
    sampledPoints.push(allPoints[i])
  }

  // Fill remaining to exactly match sampleCount
  while (sampledPoints.length < sampleCount && allPoints.length > 0) {
    const randomIndex = Math.floor(Math.random() * allPoints.length)
    sampledPoints.push(allPoints[randomIndex])
  }

  return sampledPoints
}
