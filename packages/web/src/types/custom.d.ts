declare module '*.png';

interface BrowserSpriteSymbol {
  id: string;
  viewBox: string;
  content: string;
  node: SVGSymbolElement;
}

declare module '*-icon.svg' {
  const content: BrowserSpriteSymbol;
  // eslint-disable-next-line import/no-default-export
  export default content;
}
