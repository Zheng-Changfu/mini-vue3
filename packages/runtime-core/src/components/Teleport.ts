export const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, internals) {
    const { children, props } = n2;
    const {
      mc: mountChildren,
      pc: patchChildren,
      o: { querySelector, insert },
    } = internals;

    if (n1 == null) {
      // mount
      const target = (n2.target = querySelector(props.to));
      const mount = (children) => {
        mountChildren(children, target, anchor, parentComponent);
      };
      mount(children);
    } else {
      // update
      const target = (n2.target = n1.target);
      patchChildren(n1, n2, target, anchor, parentComponent);

      if (n1.props.to !== n2.props.to) {
        // move
        const nextTarget = (n2.target = querySelector(n2.props.to));
        const { children } = n2;
        for (let i = 0; i < children.length; i++) {
          insert(children[i].el, nextTarget);
        }
      }
    }
  },
};

export const isTeleport = (v) => !!v.__isTeleport;

export const Teleport = TeleportImpl;
