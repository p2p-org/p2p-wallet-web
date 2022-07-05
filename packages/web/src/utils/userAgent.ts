export enum BrowserNames {
  NONE,
  CHROME,
  FIREFOX,
  SAFARI,
  OPERA,
  EDGE,
}

const userAgent = navigator.userAgent;
let browserName: BrowserNames;

if (userAgent.match(/chrome|chromium|crios/i)) {
  browserName = BrowserNames.CHROME;
} else if (userAgent.match(/firefox|fxios/i)) {
  browserName = BrowserNames.FIREFOX;
} else if (userAgent.match(/safari/i)) {
  browserName = BrowserNames.SAFARI;
} else if (userAgent.match(/opr\//i)) {
  browserName = BrowserNames.OPERA;
} else if (userAgent.match(/edg/i)) {
  browserName = BrowserNames.EDGE;
} else {
  browserName = BrowserNames.NONE;
}

export { browserName };
