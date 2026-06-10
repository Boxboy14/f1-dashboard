import { useEffect, useRef, useState } from "react";

// Reports whether the referenced element has scrolled into view. Once true it
// stays true — we only need to trigger a card's one-time lazy fetch. `rootMargin`
// starts the fetch slightly before the element is actually visible so the data
// is usually ready by the time the user reaches it.
function useInView(rootMargin = "200px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView];
}

export default useInView;
