import { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { Scrim, Spinner, StackLayout, Text } from "@salt-ds/core";
import styles from "./GlobalLoadingOverlay.module.scss";

// Brief delay before showing the blocker so an instant cache hit (the common
// case, thanks to persistQueryCache) never flashes the overlay.
const SHOW_DELAY = 200;

// Queries tagged `meta: { background: true }` (e.g. scroll-triggered card
// fetches with their own inline placeholder) don't count toward this — only
// page-level loads should freeze the screen.
const isForeground = (query) => !query.meta?.background;

const GlobalLoadingOverlay = () => {
  const isFetching = useIsFetching({ predicate: isForeground }) > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setVisible(isFetching),
      isFetching ? SHOW_DELAY : 0,
    );
    return () => clearTimeout(timer);
  }, [isFetching]);

  return (
    <Scrim open={visible} fixed className={styles.scrim}>
      <StackLayout align="center" gap={2} className={styles.content}>
        <Text styleAs="h1" className={styles.label}>
          Loading...
        </Text>
        <Spinner size="medium" aria-label="Loading" />
      </StackLayout>
    </Scrim>
  );
};

export default GlobalLoadingOverlay;
