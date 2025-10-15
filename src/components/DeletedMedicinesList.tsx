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
import { IconRestore, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Medicine } from '../types';
import keycloak from '../config/keycloak';

export default function DeletedMedicinesList() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user has restore permission
  const hasRestorePermission = keycloak.hasResourceRole(
    'allowed_to_restore_deleted_medicines',
    'pharmacy-service'
  );

  const loadDeletedMedicines = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDeletedMedicines();
      setMedicines(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load deleted medicines',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedMedicines();
  }, []);

  const handleRestore = (medicine: Medicine) => {
    modals.openConfirmModal({
      title: 'Restore Medicine',
      children: (
        <Text size="sm">
          Are you sure you want to restore <strong>{medicine.nomCommercial}</strong>? 
          This medicine will be available again in the active inventory.
        </Text>
      ),
      labels: { confirm: 'Restore', cancel: 'Cancel' },
      confirmProps: { color: 'teal' },
      onConfirm: async () => {
        try {
          await apiService.restoreMedicine(medicine.id);
          notifications.show({
            title: 'Success',
            message: 'Medicine restored successfully',
            color: 'green',
          });
          loadDeletedMedicines();
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to restore medicine',
            color: 'red',
          });
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const rows = medicines.map((medicine) => (
    <Table.Tr key={medicine.id}>
      <Table.Td>{medicine.nomCommercial}</Table.Td>
      <Table.Td>{medicine.dci}</Table.Td>
      <Table.Td>
        <Badge color="gray">
          {medicine.stock}
        </Badge>
      </Table.Td>
      <Table.Td>{medicine.lot || '-'}</Table.Td>
      <Table.Td>{formatDate(medicine.updatedAt)}</Table.Td>
      <Table.Td>
        {hasRestorePermission && (
          <ActionIcon 
            color="teal" 
            variant="subtle" 
            onClick={() => handleRestore(medicine)}
            title="Restore medicine"
          >
            <IconRestore size={18} />
          </ActionIcon>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Deleted Medicines</Title>
        <Button 
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate('/')}
          variant="default"
        >
          Back to Inventory
        </Button>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={loading} />
        {medicines.length === 0 && !loading ? (
          <Text c="dimmed" ta="center" py="xl">
            No deleted medicines found. All medicines are in the active inventory.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Commercial Name</Table.Th>
                <Table.Th>DCI</Table.Th>
                <Table.Th>Stock</Table.Th>
                <Table.Th>Lot</Table.Th>
                <Table.Th>Deleted At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}
      </Box>
    </Stack>
  );
}
