import { isFunction } from "@vue/shared";
import {
  ReactiveEffect,
  track,
  trackEffect,
  trigger,
  triggerEffect,
} from "./effect";

export function computed(getterOrOptions) {
  const isOnlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (isOnlyGetter) {
    getter = getterOrOptions;
    setter = () => {};
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedImpl(getter, setter);
}
// isRef
class ComputedImpl {
  public __v_isRef = true;
  public _value;
  public _effect;
  public _deps; // []
  public _dirty = true; // dirty如果是true，那么下次读取value属性会执行重新getter函数
  constructor(public getter, public setter) {
    this._effect = new ReactiveEffect(getter, {
      scheduler: () => {
        console.log("更新");
        if (!this._dirty) {
          this._dirty = true;
          triggerEffect(this._deps);
        }
      },
    });
  }
  get value() {
    trackEffect(this._deps || (this._deps = new Set()));
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
  set value(val) {}
}
