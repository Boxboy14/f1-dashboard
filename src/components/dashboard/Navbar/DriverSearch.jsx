import { ComboBox, Option, Button } from "@salt-ds/core";
import { SearchIcon, CloseIcon } from "@salt-ds/icons";
import { useMemo, useState } from "react";
import { useDriversByYear } from "../../../hooks/useOpenF1.js";
import styles from "./DriverSearch.module.scss";

const DriverSearchBar = ({ onDriverSelect = () => {}, year }) => {
  const { data: drivers = [] } = useDriversByYear(year);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const normalizeQuery = (value) => value.trim().toLowerCase();

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) return [];
    return drivers.filter(({ full_name }) =>
      full_name.toLowerCase().includes(normalizedQuery),
    );
  }, [drivers, query]);

  const handleChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    const normalizedQuery = normalizeQuery(value);
    const hasResults =
      normalizedQuery.length > 0 &&
      drivers.some(({ full_name }) =>
        full_name.toLowerCase().includes(normalizedQuery),
      );
    setIsOpen(hasResults);
  };

  const handleClearSelectedValue = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <>
      <SearchIcon size={1.2} className={styles.icon} />
      <ComboBox
        value={query}
        open={isOpen}
        onOpenChange={(open) => setIsOpen(open && filteredDrivers.length > 0)}
        onChange={handleChange}
        onSelectionChange={(_, selectedValues) => {
          if (selectedValues.length) {
            const selectedName = selectedValues[0];
            const selectedDriver = drivers.find(
              ({ full_name }) => full_name === selectedName,
            );
            setQuery(selectedName);
            setIsOpen(false);
            onDriverSelect(selectedDriver);
          }
        }}
        placeholder="Search Drivers...."
        endAdornment={
          query && (
            <Button onClick={handleClearSelectedValue}>
              <CloseIcon size={1.2} />
            </Button>
          )
        }
      >
        {filteredDrivers.map(({ full_name, driver_number }) => (
          <Option value={full_name} key={`${full_name}-${driver_number}`} />
        ))}
      </ComboBox>
    </>
  );
};

export default DriverSearchBar;
