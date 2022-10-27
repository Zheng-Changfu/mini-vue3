import { currentInstance } from "./component";

export function provide(key, value) {
  let provides = currentInstance.provides;
  if (currentInstance.parent && provides === currentInstance.parent.provides) {
    provides = currentInstance.provides = Object.create(provides);
  }
  provides[key] = value;
}

export function inject(key) {
  const parentProvides = currentInstance.parent.provides;
  if (parentProvides && key in parentProvides) {
    return parentProvides[key];
  }
}
