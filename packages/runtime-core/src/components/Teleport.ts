export const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, internals) {
    const {
      mc: mountChildren,
      pc: patchChildren,
      o: { querySelector, insert },
    } = internals;

    const {
      props: { to },
      children,
    } = n2;
    const target = (n2.target = querySelector(to));

    if (n1 == null) {
      const mount = (children) => {
        mountChildren(children, target, anchor, parentComponent);
      };
      mount(children);
    } else {
      const target = (n2.target = n1.target);
      patchChildren(n1, n2, target, null, parentComponent);
      if (n2.props.to !== n1.props.to) {
        const nextTarget = (n2.target = querySelector(n2.props.to));
        const { children } = n2;
        for (let i = 0; i < children.length; i++) {
          const el = children[i].el;
          insert(el, nextTarget);
        }
      }
    }
  },
};

export const isTeleport = (v) => !!v.__isTeleport;

export const Teleport = TeleportImpl;
