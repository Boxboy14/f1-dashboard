import { ComboBox, Option, Button } from "@salt-ds/core";
import { SearchIcon, CloseIcon } from "@salt-ds/icons";
import { useMemo, useState } from "react";
import { driverSearchSelector } from "../../../store/drivers/selector.js";
import { useSelector } from "react-redux";
import styles from "./DriverSearch.module.scss";

const DriverSearchBar = () => {
  const driverSearchValues = useSelector(driverSearchSelector);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const normalizeQuery = (value) => value.trim().toLowerCase();

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = normalizeQuery(query);

    if (!normalizedQuery) {
      return [];
    }

    return driverSearchValues.filter((name) =>
      name.toLowerCase().includes(normalizedQuery),
    );
  }, [driverSearchValues, query]);

  const handleChange = (event) => {
    const value = event.target.value;
    setQuery(value);

    const normalizedQuery = normalizeQuery(value);
    const liveResults = !normalizedQuery
      ? []
      : driverSearchValues.filter((name) =>
          name.toLowerCase().includes(normalizedQuery),
        );

    setIsOpen(normalizedQuery.length > 0 && liveResults.length > 0);
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
            setQuery(selectedName);
            setIsOpen(false);
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
        {filteredDrivers.map((name) => (
          <Option value={name} key={name} />
        ))}
      </ComboBox>
    </>
  );
};

export default DriverSearchBar;
