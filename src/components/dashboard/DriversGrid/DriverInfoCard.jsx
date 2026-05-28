import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  FormField,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";

import { CloseIcon } from "@salt-ds/icons";
import styles from "./driverGridCss/DriverInfoCard.module.scss";

const DriverInfoCard = ({ isOpen, driverData, setIsInfoDialogOpen, id }) => {
  const {
    full_name,
    driver_number,
    team_name,
    country_name,
    broadcast_name,
    headshot_url,
  } = driverData ?? {};

  const handleOnClickClose = () => setIsInfoDialogOpen(false);

  const photoUrl = headshot_url || "";

  const driverFields = [
    { label: "Full Name", value: full_name },
    { label: "Driver Number", value: driver_number },
    { label: "Team Name", value: team_name },
    { label: "Country", value: country_name },
    { label: "Broadcast Name", value: broadcast_name },
  ];

  const closeButton = (
    <Button
      onClick={handleOnClickClose}
      appearance="transparent"
      aria-label="Close Button"
    >
      <CloseIcon size={1} aria-hidden />
    </Button>
  );

  return (
    <Dialog
      className={styles.dialogWidth}
      open={isOpen}
      idProp={id}
      size="medium"
      onOpenChange={setIsInfoDialogOpen}
    >
      <DialogHeader header="Driver Details" actions={closeButton} />
      <DialogContent className={styles.content}>
        <div className={styles.profileSection}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={full_name || "Driver photo"}
              className={styles.driverPhoto}
            />
          ) : (
            <div className={styles.driverPhotoFallback}>No Photo</div>
          )}
          <p className={styles.broadcastName}>{broadcast_name || "N/A"}</p>
        </div>

        <div className={styles.fieldsGrid}>
          {driverFields.map(({ label, value }) => (
            <FormField key={label} className={styles.field}>
              <FormFieldLabel className={styles.formLabel}>
                {label}
              </FormFieldLabel>
              <Input
                readOnly
                value={value ?? ""}
                emptyReadOnlyMarker="N/A"
                className={styles.fieldInput}
              />
            </FormField>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DriverInfoCard;
