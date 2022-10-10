import { generate, toRGB } from './utils';

const theme = {
  colors: {
    bg: {
      primary: '#FFFFFF',
      secondary: '#F6F6F8',
      tertiary: '#FAFBFC',
      special: '#FAFAFC', // this color is from iOS design system
      activePrimary: '#EFF3FF',
      activeSecondary: '#FFFFFF',
      buttonPrimary: '#5887FF',
      buttonSecondary: '#F6F6F8',
      buttonDisabled: '#A3A5BA',
      app: '#FBFBFD',
      pressed: '#E4EAFF',
      // chart: '',
    },
    stroke: {
      primary: '#D3D4DE',
      primaryRGB: toRGB('#D3D4DE'),
      secondary: '#F2F2F7',
      tertiary: '#F6F6F8',
      // 'chart-red': '',
      // 'chart-green': '',
    },
    system: {
      errorMain: '#F43D3D',
      successMain: '#2DB533',
      warningMain: '#FFA631',
      errorBg: '#FEF5F5',
      successBg: '#F5FBF5',
      warningBg: '#FFFBF5',
    },
    textIcon: {
      primary: '#202020',
      secondary: '#8E8E93',
      tertiary: '#D2D4E5',
      links: '#82A5FF',
      active: '#5887FF',
      buttonPrimary: '#FFFFFF',
      buttonSecondary: '#8E8E93',
      buttonDisabled: '#D0D3E9',
    },
    card: '#F6F6F9',
  },
};

export const darkTheme = generate(theme);
