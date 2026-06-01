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
import TEAM_LOGO_MAP from "../../../constants/teamLogos.js";
import styles from "./TeamDetailCard.module.scss";

const TeamDetailCard = ({ isOpen, teamData, id, setIsDetailOpen }) => {
  if (!teamData) return null;

  const { team_name, position_current, points_current, drivers } = teamData;
  const logoUrl = TEAM_LOGO_MAP[team_name];

  const closeButton = (
    <Button
      onClick={() => setIsDetailOpen(false)}
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
      onOpenChange={setIsDetailOpen}
    >
      <DialogHeader
        header={
          <span className={styles.dialogHeader}>
            {team_name}
            {logoUrl && <img src={logoUrl} alt="" className={styles.headerLogo} />}
          </span>
        }
        actions={closeButton}
      />
      <DialogContent className={styles.content}>
        <div className={styles.teamSummary}>
          <FormField className={styles.field}>
            <FormFieldLabel className={styles.formLabel}>
              Championship Rank
            </FormFieldLabel>
            <Input
              readOnly
              value={String(position_current ?? "")}
              emptyReadOnlyMarker="—"
              className={styles.fieldInput}
            />
          </FormField>
          <FormField className={styles.field}>
            <FormFieldLabel className={styles.formLabel}>
              Points
            </FormFieldLabel>
            <Input
              readOnly
              value={String(points_current ?? "")}
              emptyReadOnlyMarker="—"
              className={styles.fieldInput}
            />
          </FormField>
        </div>

        {drivers.map((driver) => (
          <div key={driver.driver_number} className={styles.driverSection}>
            <p className={styles.driverName}>
              {driver.full_name} #{driver.driver_number}
            </p>
            <div className={styles.statRow}>
              <FormField className={styles.field}>
                <FormFieldLabel className={styles.formLabel}>
                  Driver Rank
                </FormFieldLabel>
                <Input
                  readOnly
                  value={String(driver.championship?.position_current ?? "")}
                  emptyReadOnlyMarker="—"
                  className={styles.fieldInput}
                />
              </FormField>
              <FormField className={styles.field}>
                <FormFieldLabel className={styles.formLabel}>
                  Driver Points
                </FormFieldLabel>
                <Input
                  readOnly
                  value={String(driver.championship?.points_current ?? "")}
                  emptyReadOnlyMarker="—"
                  className={styles.fieldInput}
                />
              </FormField>
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default TeamDetailCard;
