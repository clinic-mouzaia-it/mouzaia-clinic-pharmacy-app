import { useState, useEffect } from 'react';
import { 
  Stack, 
  Title, 
  Button, 
  Table, 
  Group, 
  ActionIcon, 
  LoadingOverlay,
  Text,
  Badge,
  Box
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconPlus, IconTrash, IconQrcode, IconAlertTriangle } from '@tabler/icons-react';
import { apiService } from '../services/api';
import type { Medicine } from '../types';
import AddMedicineModal from './AddMedicineModal';
import DistributeMedicinesModal from './DistributeMedicinesModal';

export default function MedicinesList() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);

  // Parse a yyyy-mm-dd string into a local Date (midnight) safely
  const parseYYYYMMDD = (input?: string | null) => {
    if (!input) return null;
    const [y, m, d] = input.split('-').map((v) => Number(v));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  // Returns true if ddp exists and is earlier than today (expired)
  const isDDPPassed = (ddp?: string | null) => {
    const date = parseYYYYMMDD(ddp);
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  };

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMedicines();
      setMedicines(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load medicines',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleDelete = (medicine: Medicine) => {
    modals.openConfirmModal({
      title: 'Delete Medicine',
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{medicine.nomCommercial}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await apiService.deleteMedicine(medicine.id);
          notifications.show({
            title: 'Success',
            message: 'Medicine deleted successfully',
            color: 'green',
          });
          loadMedicines();
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to delete medicine',
            color: 'red',
          });
        }
      },
    });
  };

  const rows = medicines.map((medicine) => (
    <Table.Tr key={medicine.id}>
      <Table.Td>{medicine.nomCommercial}</Table.Td>
      <Table.Td>{medicine.dci}</Table.Td>
      <Table.Td>
        <Badge color={medicine.stock > 10 ? 'green' : medicine.stock > 0 ? 'yellow' : 'red'}>
          {medicine.stock}
        </Badge>
      </Table.Td>
      <Table.Td>{medicine.cout.toString()} DA</Table.Td>
      <Table.Td>{medicine.prixDeVente.toString()} DA</Table.Td>
      <Table.Td>
        {medicine.ddp ? (
          <Group gap="xs">
            <Text>{medicine.ddp}</Text>
            {isDDPPassed(medicine.ddp) && (
              <Badge color="red" variant="light" leftSection={<IconAlertTriangle size={14} />}>
                Expired
              </Badge>
            )}
          </Group>
        ) : (
          '-'
        )}
      </Table.Td>
      <Table.Td>{medicine.lot || '-'}</Table.Td>
      <Table.Td>
        <ActionIcon 
          color="red" 
          variant="subtle" 
          onClick={() => handleDelete(medicine)}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>Medicines Inventory</Title>
          <Group>
            <Button 
              leftSection={<IconQrcode size={18} />}
              onClick={() => setDistributeModalOpen(true)}
              color="teal"
            >
              Distribute to Staff
            </Button>
            <Button 
              leftSection={<IconPlus size={18} />}
              onClick={() => setAddModalOpen(true)}
            >
              Add Medicine
            </Button>
          </Group>
        </Group>

        <Box pos="relative">
          <LoadingOverlay visible={loading} />
          {medicines.length === 0 && !loading ? (
            <Text c="dimmed" ta="center" py="xl">
              No medicines found. Add your first medicine to get started.
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Commercial Name</Table.Th>
                  <Table.Th>DCI</Table.Th>
                  <Table.Th>Stock</Table.Th>
                  <Table.Th>Cost</Table.Th>
                  <Table.Th>Sale Price</Table.Th>
                  <Table.Th>DDP</Table.Th>
                  <Table.Th>Lot</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}
        </Box>
      </Stack>

      <AddMedicineModal 
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          loadMedicines();
        }}
      />

      <DistributeMedicinesModal
        opened={distributeModalOpen}
        onClose={() => setDistributeModalOpen(false)}
        medicines={medicines}
        onSuccess={() => {
          setDistributeModalOpen(false);
          loadMedicines();
        }}
      />
    </>
  );
}
