import { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const rpos = useRef({ x: 0, y: 0 });
  const [grow, setGrow] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.left = e.clientX + "px";
        dot.current.style.top = e.clientY + "px";
      }
    };

    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      rpos.current.x = lerp(rpos.current.x, pos.current.x, 0.09);
      rpos.current.y = lerp(rpos.current.y, pos.current.y, 0.09);
      if (ring.current) {
        ring.current.style.left = rpos.current.x + "px";
        ring.current.style.top = rpos.current.y + "px";
      }
      raf = requestAnimationFrame(tick);
    };

    const onEnter = () => setGrow(true);
    const onLeave = () => setGrow(false);

    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    document.querySelectorAll("button,a,[data-cursor]").forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dot} className="c-dot" />
      <div ref={ring} className={`c-ring ${grow ? "grow" : ""}`} />
    </>
  );
};

export default CustomCursor;
