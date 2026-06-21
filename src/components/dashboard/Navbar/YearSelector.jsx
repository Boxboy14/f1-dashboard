import { Dropdown, FlexLayout, Text, Option } from "@salt-ds/core";
import styles from "./YearSelector.module.scss";

const YEARS = ["2023", "2024", "2025"];

const YearSelector = ({ value, onChange }) => {
  const handleChange = (_, newSelected) => {
    if (newSelected[0]) onChange(Number(newSelected[0]));
  };

  return (
    <FlexLayout align="center" gap={2}>
      <Text as="label" styleAs="h3" className={styles.label}>
        Select Season
      </Text>
      <Dropdown
        id="year-dropdown"
        className={styles.dropdown}
        selected={[String(value)]}
        onSelectionChange={handleChange}
        valueToString={(v) => v}
      >
        {YEARS.map((year) => (
          <Option key={year} value={year} />
        ))}
      </Dropdown>
    </FlexLayout>
  );
};

export default YearSelector;
