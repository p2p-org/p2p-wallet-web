// based on https://github.com/w8r/svg-arc-corners/blob/d0a6337d79bea629b53707b32529c7e23652ceba/index.js

const RAD_DEG = Math.PI / 180;
const PI2 = 2 * Math.PI;

/**
 * @param  {Array.<Number>} center
 * @param  {Number} radius
 * @param  {Number} angle
 * @return {Array.<Number>}
 */
const pointOnArc = (center: number[], radius: number, angle: number) => {
  const radians = (angle - 90) * RAD_DEG;

  return [center[0] + radius * Math.cos(radians), center[1] + radius * Math.sin(radians)];
};

/**
 * @param  {Array.<Number>} center
 * @param  {Number}         outerRadius
 * @param  {Number}         lineWidth
 * @return {String}
 */
const drawCircle = (center: number[], outerRadius: number, lineWidth: number) => {
  const innerRadius = outerRadius - lineWidth;
  const [x, y] = center;

  return [
    'M',
    x - outerRadius,
    y,
    'A',
    outerRadius,
    outerRadius,
    0,
    1,
    0,
    x + outerRadius,
    y,
    'A',
    outerRadius,
    outerRadius,
    0,
    1,
    0,
    x - outerRadius,
    y,
    'M',
    x - innerRadius,
    y,
    'A',
    innerRadius,
    innerRadius,
    0,
    1,
    0,
    x + innerRadius,
    y,
    'A',
    innerRadius,
    innerRadius,
    0,
    1,
    0,
    x - innerRadius,
    y,
    'Z',
  ];
};

/**
 * Generates arc path
 *
 * @param  {Array.<Number>} center
 * @param  {Number}         outerRadius
 * @param  {Number}         startDegree
 * @param  {Number}         endDegree
 * @param  {Number}         lineWidth
 * @param  {Number}         borderRadius Corner radius
 *
 * @return {String}
 */
export const arc = (
  center: number[],
  outerRadius: number,
  startDegree: number,
  endDegree: number,
  lineWidth: number,
  borderRadius: number,
) => {
  let points;
  if (Math.abs(endDegree - startDegree) === 360) {
    points = drawCircle(center, outerRadius, lineWidth);
    return points.join(' ');
  }

  const innerRadius = outerRadius - lineWidth;
  const circumference = Math.abs(endDegree - startDegree);
  let borderRadiusPoint = Math.min(lineWidth / 2, borderRadius);

  if (
    360 * (borderRadiusPoint / (Math.PI * (outerRadius - lineWidth))) >
    Math.abs(startDegree - endDegree)
  ) {
    borderRadiusPoint = (circumference / 360) * innerRadius * Math.PI;
  }

  // inner and outer radiuses
  const innerRadius2 = innerRadius + borderRadiusPoint;
  const outerRadius2 = outerRadius - borderRadiusPoint;

  // butts corner points
  const oStart = pointOnArc(center, outerRadius2, startDegree);
  const oEnd = pointOnArc(center, outerRadius2, endDegree);

  const iStart = pointOnArc(center, innerRadius2, startDegree);
  const iEnd = pointOnArc(center, innerRadius2, endDegree);

  const iSection = 360 * (borderRadiusPoint / (PI2 * innerRadius));
  const oSection = 360 * (borderRadiusPoint / (PI2 * outerRadius));

  // arcs endpoints
  const iArcStart = pointOnArc(center, innerRadius, startDegree + iSection);
  const iArcEnd = pointOnArc(center, innerRadius, endDegree - iSection);

  const oArcStart = pointOnArc(center, outerRadius, startDegree + oSection);
  const oArcEnd = pointOnArc(center, outerRadius, endDegree - oSection);

  const arcSweep1 = circumference > 180 + 2 * oSection ? 1 : 0;
  const arcSweep2 = circumference > 180 + 2 * iSection ? 1 : 0;

  points = [
    // begin path
    'M',
    oStart[0],
    oStart[1],
    // outer start corner
    'A',
    borderRadiusPoint,
    borderRadiusPoint,
    0,
    0,
    1,
    oArcStart[0],
    oArcStart[1],
    // outer main arc
    'A',
    outerRadius,
    outerRadius,
    0,
    arcSweep1,
    1,
    oArcEnd[0],
    oArcEnd[1],
    // outer end corner
    'A',
    borderRadiusPoint,
    borderRadiusPoint,
    0,
    0,
    1,
    oEnd[0],
    oEnd[1],
    // end butt
    'L',
    iEnd[0],
    iEnd[1],
    // inner end corner
    'A',
    borderRadiusPoint,
    borderRadiusPoint,
    0,
    0,
    1,
    iArcEnd[0],
    iArcEnd[1],
    // inner arc
    'A',
    innerRadius,
    innerRadius,
    0,
    arcSweep2,
    0,
    iArcStart[0],
    iArcStart[1],
    // inner start corner
    'A',
    borderRadiusPoint,
    borderRadiusPoint,
    0,
    0,
    1,
    iStart[0],
    iStart[1],
    'Z', // end path
  ];

  return points.join(' ');
};
