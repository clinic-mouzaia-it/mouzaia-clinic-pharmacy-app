import { useState } from 'react';
import { 
  Modal, 
  Button, 
  Stack, 
  Group, 
  Select, 
  NumberInput,
  Table,
  ActionIcon,
  Text,
  Paper,
  Divider,
  Alert,
  Box
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconQrcode, IconUserCheck } from '@tabler/icons-react';
import { apiService } from '../services/api';
import type { Medicine, StaffUser, DistributionItem } from '../types';
import QrScannerModal from './QrScannerModal';

interface DistributeMedicinesModalProps {
  opened: boolean;
  onClose: () => void;
  medicines: Medicine[];
  onSuccess: () => void;
}

export default function DistributeMedicinesModal({ 
  opened, 
  onClose, 
  medicines,
  onSuccess 
}: DistributeMedicinesModalProps) {
  const [selectedMedicines, setSelectedMedicines] = useState<DistributionItem[]>([]);
  const [currentMedicineId, setCurrentMedicineId] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableMedicines = medicines.filter(m => m.stock > 0);

  const handleAddMedicine = () => {
    if (!currentMedicineId || currentQuantity <= 0) {
      notifications.show({
        title: 'Invalid Input',
        message: 'Please select a medicine and enter a valid quantity',
        color: 'orange',
      });
      return;
    }

    const medicine = medicines.find(m => m.id === currentMedicineId);
    if (!medicine) return;

    if (currentQuantity > medicine.stock) {
      notifications.show({
        title: 'Insufficient Stock',
        message: `Only ${medicine.stock} units available`,
        color: 'red',
      });
      return;
    }

    const existing = selectedMedicines.find(m => m.id === currentMedicineId);
    if (existing) {
      const totalQuantity = existing.quantity + currentQuantity;
      if (totalQuantity > medicine.stock) {
        notifications.show({
          title: 'Insufficient Stock',
          message: `Only ${medicine.stock} units available`,
          color: 'red',
        });
        return;
      }
      setSelectedMedicines(
        selectedMedicines.map(m => 
          m.id === currentMedicineId 
            ? { ...m, quantity: totalQuantity }
            : m
        )
      );
    } else {
      setSelectedMedicines([...selectedMedicines, { id: currentMedicineId, quantity: currentQuantity }]);
    }

    setCurrentMedicineId('');
    setCurrentQuantity(1);
  };

  const handleRemoveMedicine = (id: string) => {
    setSelectedMedicines(selectedMedicines.filter(m => m.id !== id));
  };

  const handleQrScan = async (nationalId: string) => {
    try {
      setLoading(true);
      const user = await apiService.getUserByNationalId(nationalId);
      setStaffUser(user);
      setScannerOpen(false);
      notifications.show({
        title: 'Staff Found',
        message: `${user.firstName || ''} ${user.lastName || ''} (${user.username})`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to find staff member',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!staffUser) {
      notifications.show({
        title: 'No Staff Selected',
        message: 'Please scan a staff ID card first',
        color: 'orange',
      });
      return;
    }

    if (selectedMedicines.length === 0) {
      notifications.show({
        title: 'No Medicines Selected',
        message: 'Please add at least one medicine to distribute',
        color: 'orange',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.distributeMedicines({
        staffUser,
        medicines: selectedMedicines,
      });

      notifications.show({
        title: 'Success',
        message: response.message,
        color: 'green',
      });

      // Reset form
      setSelectedMedicines([]);
      setStaffUser(null);
      setCurrentMedicineId('');
      setCurrentQuantity(1);
      onSuccess();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to distribute medicines',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMedicines([]);
    setStaffUser(null);
    setCurrentMedicineId('');
    setCurrentQuantity(1);
    onClose();
  };

  const medicineOptions = availableMedicines.map(m => ({
    value: m.id,
    label: `${m.nomCommercial} (Stock: ${m.stock})`,
  }));

  const selectedRows = selectedMedicines.map((item) => {
    const medicine = medicines.find(m => m.id === item.id);
    if (!medicine) return null;

    return (
      <Table.Tr key={item.id}>
        <Table.Td>{medicine.nomCommercial}</Table.Td>
        <Table.Td>{medicine.dci}</Table.Td>
        <Table.Td>{item.quantity}</Table.Td>
        <Table.Td>{medicine.stock}</Table.Td>
        <Table.Td>
          <ActionIcon 
            color="red" 
            variant="subtle" 
            onClick={() => handleRemoveMedicine(item.id)}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={handleClose} 
        title="Distribute Medicines to Staff" 
        size="xl"
      >
        <Stack gap="md">
          {/* Step 1: Select Medicines */}
          <Paper p="md" withBorder>
            <Text fw={600} mb="md">Step 1: Select Medicines</Text>
            <Group align="flex-end">
              <Select
                label="Medicine"
                placeholder="Select medicine"
                data={medicineOptions}
                value={currentMedicineId}
                onChange={(value) => setCurrentMedicineId(value || '')}
                searchable
                style={{ flex: 1 }}
              />
              <NumberInput
                label="Quantity"
                placeholder="Quantity"
                min={1}
                value={currentQuantity}
                onChange={(value) => setCurrentQuantity(Number(value) || 1)}
                style={{ width: 120 }}
              />
              <Button 
                leftSection={<IconPlus size={18} />}
                onClick={handleAddMedicine}
              >
                Add
              </Button>
            </Group>

            {selectedMedicines.length > 0 && (
              <Box mt="md">
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Medicine</Table.Th>
                      <Table.Th>DCI</Table.Th>
                      <Table.Th>Quantity</Table.Th>
                      <Table.Th>Available Stock</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{selectedRows}</Table.Tbody>
                </Table>
              </Box>
            )}
          </Paper>

          <Divider />

          {/* Step 2: Scan Staff ID */}
          <Paper p="md" withBorder>
            <Text fw={600} mb="md">Step 2: Scan Staff ID Card</Text>
            {staffUser ? (
              <Alert icon={<IconUserCheck />} color="green" mb="md">
                <Text fw={600}>
                  {staffUser.firstName} {staffUser.lastName}
                </Text>
                <Text size="sm">Username: {staffUser.username}</Text>
                <Text size="sm">National ID: {staffUser.nationalId}</Text>
                <Text size="sm">Email: {staffUser.email || 'N/A'}</Text>
              </Alert>
            ) : (
              <Text c="dimmed" mb="md">No staff member selected</Text>
            )}
            <Button 
              leftSection={<IconQrcode size={18} />}
              onClick={() => setScannerOpen(true)}
              variant={staffUser ? 'light' : 'filled'}
            >
              {staffUser ? 'Scan Different Staff' : 'Scan QR Code'}
            </Button>
          </Paper>

          <Divider />

          {/* Step 3: Confirm Distribution */}
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDistribute} 
              loading={loading}
              disabled={!staffUser || selectedMedicines.length === 0}
            >
              Distribute Medicines
            </Button>
          </Group>
        </Stack>
      </Modal>

      <QrScannerModal
        opened={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleQrScan}
      />
    </>
  );
}
