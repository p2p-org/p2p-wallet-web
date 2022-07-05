export enum BrowserNames {
  NONE,
  CHROME,
  FIREFOX,
}

const userAgent = navigator.userAgent;
let browserName: BrowserNames;

if (userAgent.match(/chrome|chromium|crios/i)) {
  browserName = BrowserNames.CHROME;
} else if (userAgent.match(/firefox|fxios/i)) {
  browserName = BrowserNames.FIREFOX;
} /*else if (userAgent.match(/safari/i)) {
  browserName = 'safari';
} else if (userAgent.match(/opr\//i)) {
  browserName = 'opera';
} else if (userAgent.match(/edg/i)) {
  browserName = 'edge';
} */ else {
  browserName = BrowserNames.NONE;
}

export { browserName };
