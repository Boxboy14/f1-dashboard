import { Card, StackLayout, Text } from "@salt-ds/core";
import styles from "./KpiCard.module.scss";

const KpiCard = ({ label, primary, secondary }) => (
  <Card className={styles.card}>
    <StackLayout gap={0.5}>
      <Text styleAs="label" className={styles.label}>
        {label}
      </Text>
      <Text styleAs="h3" className={styles.primary}>
        {primary}
      </Text>
      {secondary != null && (
        <Text color="secondary" className={styles.secondary}>
          {secondary}
        </Text>
      )}
    </StackLayout>
  </Card>
);

export default KpiCard;
