import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/site-ui-primitives";
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onChange = (e) => setFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return fine;
}
function useFxEnabled() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  return !reduced && fine;
}
export {
  useFinePointer,
  useFxEnabled
};
