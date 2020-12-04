declare module '*.png';

declare module '*-icon.svg' {
  const content: SvgIconType;
  // eslint-disable-next-line import/no-default-export
  export default content;
}
