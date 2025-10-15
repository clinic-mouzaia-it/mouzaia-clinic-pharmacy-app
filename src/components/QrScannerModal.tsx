import { useState } from 'react';
import { Modal, Button, Stack, Text, TextInput, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface QrScannerModalProps {
  opened: boolean;
  onClose: () => void;
  onScan: (nationalId: string) => void;
}

export default function QrScannerModal({ opened, onClose, onScan }: QrScannerModalProps) {
  const [manualId, setManualId] = useState('');

  const handleManualSubmit = () => {
    if (!manualId.trim()) {
      notifications.show({
        title: 'Invalid Input',
        message: 'Please enter a national ID',
        color: 'orange',
      });
      return;
    }

    onScan(manualId.trim());
    setManualId('');
  };

  const handleClose = () => {
    setManualId('');
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title="Scan Staff ID Card" 
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Scan the QR code on the staff member's ID card, or enter their national ID manually below.
        </Text>

        {/* Manual Entry Option */}
        <TextInput
          label="Manual Entry"
          placeholder="Enter national ID"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleManualSubmit();
            }
          }}
        />

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleManualSubmit}>
            Submit
          </Button>
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          Note: QR code scanning requires camera permissions. 
          For now, use manual entry with national IDs like: P-0001, S1-0001, S2-0002
        </Text>
      </Stack>
    </Modal>
  );
}
