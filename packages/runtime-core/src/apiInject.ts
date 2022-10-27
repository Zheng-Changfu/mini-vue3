import { currentInstance } from "./component";

export function provide(key, value) {
  let provides = currentInstance.provides;
  const parentProvides = currentInstance.parent?.provides;
  if (provides === parentProvides) {
    provides = currentInstance.provides = Object.create(provides);
  }
  provides[key] = value;
}

export function inject(key) {
  const parentProvides = currentInstance.parent?.provides;
  if (parentProvides && key in parentProvides) {
    return parentProvides[key];
  }
}
