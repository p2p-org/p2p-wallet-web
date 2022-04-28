type Points = 'bottom' | 'middle' | 'top' | 'nav' | 'modal';

type Zindexes = {
  [P in Points as P]: number;
};

type Getters = {
  step: number;
  above: (point: Points) => number;
  under: (point: Points) => number;
};

type ZIndexesObject = Getters & Zindexes;

export const zIndexes: ZIndexesObject = {
  step: 1,
  bottom: 0,
  middle: 10,
  top: 20,
  nav: 30,
  modal: 40,

  above: function (point: Points) {
    return this[point] + this.step;
  },

  under: function (point: Points) {
    return this[point] - this.step;
  },
};
