export const patchStyle = (el, oldStyle, newStyle) => {
  if (!newStyle) newStyle = {};
  const style = el.style;
  for (const key in newStyle) {
    style[key] = newStyle[key];
  }
  if (oldStyle) {
    for (const key in oldStyle) {
      if (!Reflect.has(newStyle, key)) {
        style[key] = "";
      }
    }
  }
};
