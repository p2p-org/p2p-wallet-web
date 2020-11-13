import { useEffect, useRef, useState } from 'react';

const getScrollbarWidth = (() => {
  let scrollElement = null;

  return () => {
    if (scrollElement === null) {
      const containerDiv = document.createElement('div');

      containerDiv.innerHTML = `
        <div style="position: absolute; top: -200px; width: 100px; height: 100px; overflow: scroll; visibility: hidden;"></div>
      `;

      scrollElement = containerDiv.firstElementChild;
      document.body.append(scrollElement);
    }

    return scrollElement.offsetWidth - scrollElement.clientWidth;
  };
})();

const listeners = [];

let width;
let prevWidth;

function onResize() {
  const scrollbarWidth = getScrollbarWidth();

  if (scrollbarWidth === 0) {
    width = null;
  } else {
    width = window.innerWidth - scrollbarWidth;
  }

  if (width !== prevWidth) {
    for (const callback of listeners) {
      callback(width);
    }
  }

  prevWidth = width;
}

export const useWidthWithoutScrollbar = () => {
  const [value, setValue] = useState(width);
  const currentRef = useRef(null);
  currentRef.current = value;

  useEffect(() => {
    if (listeners.length === 0) {
      window.addEventListener('resize', onResize);
    }

    listeners.push(setValue);

    if (width === undefined) {
      onResize();
    } else if (currentRef.current !== width) {
      setValue(width);
    }

    return () => {
      const index = listeners.lastIndexOf(setValue);

      if (index !== -1) {
        listeners.splice(index, 1);
      }

      if (listeners.length === 0) {
        window.removeEventListener('resize', onResize);
      }
    };
  }, []);

  return value;
};
