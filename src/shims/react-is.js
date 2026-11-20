import React from 'react';

export function isFragment(object) {
  return object && (object.type === React.Fragment || object.$$typeof === Symbol.for('react.fragment'));
}

export function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === Symbol.for('react.element');
}

export function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' || typeof type === 'symbol';
}

export default {
  isFragment,
  isElement,
  isValidElementType,
};
