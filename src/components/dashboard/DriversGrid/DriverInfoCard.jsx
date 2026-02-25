import { Button, Dialog, DialogContent, DialogHeader } from "@salt-ds/core";

import { CloseIcon } from "@salt-ds/icons";

const DriverInfoCard = ({
  isOpen,
  driverData,
  setIsInfoDialogOpen,
  dialogId,
}) => {
  console.log(driverData);
  const handleOnClickClose = () => setIsInfoDialogOpen(false);
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
    <Dialog open={isOpen} id={dialogId}>
      <DialogHeader header="Driver Details" actions={closeButton} />
      <DialogContent>
        <p>Name: {driverData?.full_name}</p>
      </DialogContent>
    </Dialog>
  );
};

export default DriverInfoCard;
