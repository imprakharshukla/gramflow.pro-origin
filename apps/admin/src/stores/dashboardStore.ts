import { Provider, atom } from "jotai";

const searchOrderIdAtom = atom<string | null>(null);
const searchBundleIdAtom = atom<string | null>(null);
const currentTabAtom = atom<string | null>(null);
const isOrderDetailOpenAtom = atom<boolean>(false);
const isBundleDetailOpenAtom = atom<boolean>(false);
export {
  Provider,
  searchOrderIdAtom,
  searchBundleIdAtom,
  currentTabAtom,
  isOrderDetailOpenAtom,
  isBundleDetailOpenAtom,
};
