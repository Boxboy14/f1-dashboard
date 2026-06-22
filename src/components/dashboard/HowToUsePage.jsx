import { Text } from "@salt-ds/core";
import HowToUseGuide from "../tabs/how-to-use/HowToUseGuide.jsx";
import styles from "./HowToUsePage.module.scss";

const HowToUsePage = () => {
  return (
    <div className={styles.page}>
      <Text styleAs="h1" className={styles.heading}>
        How to Use the F1 Dashboard
      </Text>
      <Text color="secondary" className={styles.subtitle}>
        New here? Expand any section below for a quick walkthrough of what
        each part of the dashboard does and how to get the most out of it.
      </Text>
      <HowToUseGuide />
    </div>
  );
};

export default HowToUsePage;
