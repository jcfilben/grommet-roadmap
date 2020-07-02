import React, { useEffect, useState } from "react";
import { Box } from "grommet";

const createTouch = (event) => {
  if (event.changedTouches.length !== 1) return undefined;
  const touch = event.changedTouches.item(0);
  return { at: new Date().getTime(), x: touch.pageX, y: touch.pageY };
};

const deltaTouch = (event, start) => {
  const t = createTouch(event);
  if (t && start)
    return { at: t.at - start.at, x: t.x - start.x, y: t.y - start.y };
  else return { at: 0, x: 0, y: 0 };
};

const Swipe = ({ onSwipeLeft, onSwipeRight, ...rest }) => {
  const [offset, setOffset] = useState(0);

  // gesture interaction
  useEffect(() => {
    const { addEventListener, removeEventListener } = document;
    let touchStart;

    const onTouchStart = (event) => {
      event.preventDefault();
      touchStart = createTouch(event);
      setOffset(0);
    };

    const onTouchMove = (event) => {
      event.preventDefault();
      const delta = deltaTouch(event, touchStart);
      if (Math.abs(delta.x) > 50) setOffset(delta.x);
    };

    const onTouchEnd = (event) => {
      const delta = deltaTouch(event, touchStart);
      if (Math.abs(delta.y) < 100 && Math.abs(delta.x) > 100)
        if (delta.x < 0) onSwipeLeft();
        else onSwipeRight();
      touchStart = undefined;
      setOffset(0);
    };

    const onTouchCancel = (event) => {
      touchStart = undefined;
      setOffset(0);
    };

    addEventListener("touchstart", onTouchStart);
    addEventListener("touchmove", onTouchMove);
    addEventListener("touchend", onTouchEnd);
    addEventListener("touchcancel", onTouchCancel);

    return () => {
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchend", onTouchEnd);
      removeEventListener("touchcancel", onTouchCancel);
    };
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <Box style={{ transform: `translateX(${offset}px)` }} {...rest} />
  );
}

export default Swipe;
