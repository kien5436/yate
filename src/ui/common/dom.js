/**
 * @typedef {{
 *   type: string | Function,
 *   props: object | VNode[],
 *   children: VNode[],
 *   dom: HTMLElement,
 *   alternate: VNode,
 *   parent: VNode,
 *   sibling: VNode,
 *   effectTag: string,
 * }} VNode
 */

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
const deletions = [];
const EEffectTag = {
  UPDATE: 'UPDATE',
  PLACEMENT: 'PLACEMENT',
  DELETION: 'DELETION',
};
const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => 'children' !== key && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];

/**
 * @param {string | Function} type
 * @param {object} props
 * @param {unknown[]} children
 * @returns {VNode}
 */
export function h(type, props, ...children) {

  return {
    type,
    props: {
      ...props,
      children: children.map((child) => 'object' === typeof child ? child : createTextElement(child)),
    },
  };
}

function createTextElement(text) {

  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/**
 * @param {VNode} fiber
 */
function createDom(fiber) {

  const dom = 'TEXT_ELEMENT' === fiber.type ? document.createTextNode('') : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

/**
 * @param {VNode} wipFiber
 * @param {VNode[]} elements
 */
function reconcileChildren(wipFiber, elements) {

  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  for (let i = 0; i < elements.length || oldFiber; i++) {

    const element = elements[i];
    const sameType = oldFiber && element && element.type === oldFiber.type;
    let newFiber = null;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: EEffectTag.UPDATE,
      };
    }
    else if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: EEffectTag.PLACEMENT,
      };
    }
    else if (oldFiber && !sameType) {

      oldFiber.effectTag = EEffectTag.DELETION;
      deletions.push(oldFiber);
    }

    if (oldFiber) oldFiber = oldFiber.sibling;

    if (0 === i) wipFiber.child = newFiber;
    else prevSibling.sibling = newFiber;

    prevSibling = newFiber;
  }
}

/**
 * @param {VNode} fiber
 */
function updateFunctionComponent(fiber) {

  const res = fiber.type(fiber.props);
  const children = Array.isArray(res) ? res : [res];

  reconcileChildren(fiber, children);
}

/**
 * @param {VNode} fiber
 */
function updateHostComponent(fiber) {

  if (!fiber.dom) fiber.dom = createDom(fiber);

  reconcileChildren(fiber, fiber.props.children);
}

/**
 * @param {VNode} fiber
 */
function performUnitOfWork(fiber) {

  if (fiber.type instanceof Function) updateFunctionComponent(fiber);
  else updateHostComponent(fiber);

  if (fiber.child) return fiber.child;

  let nextFiber = fiber;

  while (nextFiber) {

    if (nextFiber.sibling) return nextFiber.sibling;

    nextFiber = nextFiber.parent;
  }

  return null;
}

/**
 * @param {HTMLElement} dom
 * @param {object} prevProps
 * @param {object} nextProps
 */
function updateDom(dom, prevProps, nextProps) {

  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !Object.hasOwn(nextProps, key) || isNew(prevProps, nextProps)(key))
    .forEach((key) => {

      const eventType = key.substring(2).toLowerCase();

      dom.removeEventListener(eventType, prevProps[key]);
    });

  Object.keys(prevProps)
    .filter(isProperty)
    .filter((key) => !Object.hasOwn(nextProps, key))
    .forEach((key) => { dom[key] = '' });

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => { dom[key] = nextProps[key] });

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {

      const eventType = key.substring(2).toLowerCase();

      dom.addEventListener(eventType, nextProps[key]);
    });
}

/**
 * @param {VNode} fiber
 * @param {HTMLElement} domParent
 */
function commitDeletion(fiber, domParent) {

  if (fiber.dom) domParent.removeChild(fiber.dom);
  else commitDeletion(fiber.child, domParent);
}

/**
 * @param {VNode} fiber
 */
function commitWork(fiber) {

  if (!fiber) return;

  let domParentFiber = fiber.parent;

  while (!domParentFiber.dom) domParentFiber = domParentFiber.parent;

  const domParent = domParentFiber.dom;

  if (EEffectTag.PLACEMENT === fiber.effectTag && fiber.dom) domParent.append(fiber.dom);
  else if (EEffectTag.UPDATE === fiber.effectTag && fiber.dom) updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  else if (EEffectTag.DELETION === fiber.effectTag) commitDeletion(fiber, domParent);

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {

  deletions.forEach(commitWork);

  commitWork(wipRoot.child);

  currentRoot = wipRoot;
  wipRoot = null;
}

function workLoop(deadline) {

  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {

    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    shouldYield = 1 > deadline.timeRemaining();
  }

  if (!nextUnitOfWork && wipRoot)
    commitRoot();

  requestIdleCallback(workLoop);
}

/**
 * @param {VNode} element
 * @param {HTMLElement} container
 */
export function render(element, container) {

  wipRoot = {
    dom: container,
    props: { children: [element] },
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;

  requestIdleCallback(workLoop);
}

export function Fragment({ children }) { return children }
