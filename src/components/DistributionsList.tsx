import { useEffect, useMemo, useState } from 'react';
import {
  Stack,
  Title,
  Table,
  Group,
  Button,
  TextInput,
  Select,
  LoadingOverlay,
  Badge,
  Text,
  Box
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconRefresh, IconChevronLeft, IconChevronRight, IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { DistributionsListResponse, Distribution, Medicine } from '../types';

export default function DistributionsList() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Distribution[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const [staffNationalId, setStaffNationalId] = useState('');
  const [medicineId, setMedicineId] = useState<string>('');

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);
  const currentPage = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);

  const loadMedicines = async () => {
    try {
      const list = await apiService.getMedicines();
      setMedicines(list);
    } catch (error) {
      notifications.show({
        title: 'Warning',
        message: error instanceof Error ? error.message : 'Failed to load medicines for filter',
        color: 'orange',
      });
    }
  };

  const loadDistributions = async (opts?: { resetOffset?: boolean }) => {
    try {
      setLoading(true);
      const resp: DistributionsListResponse = await apiService.getDistributions({
        staffNationalId: staffNationalId || undefined,
        medicineId: medicineId || undefined,
        limit,
        offset: opts?.resetOffset ? 0 : offset,
      });
      if (opts?.resetOffset) setOffset(0);
      setItems(resp.items);
      setTotal(resp.total);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to load distributions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    loadDistributions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit]);

  const medicineOptions = useMemo(
    () => medicines.map((m) => ({ value: m.id, label: `${m.nomCommercial} (${m.dci})` })),
    [medicines]
  );

  const clearFilters = () => {
    setStaffNationalId('');
    setMedicineId('');
    setOffset(0);
    loadDistributions({ resetOffset: true });
  };

  const goPrev = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const goNext = () => {
    const next = offset + limit;
    if (next < total) setOffset(next);
  };

  const rows = items.map((d) => (
    <Table.Tr key={d.id}>
      <Table.Td>{d.medicineName}</Table.Td>
      <Table.Td>{d.quantity}</Table.Td>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm">{d.staffFullName || '-'}</Text>
          <Text size="xs" c="dimmed">{d.staffUsername}</Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Badge variant="light">{d.staffNationalId}</Badge>
      </Table.Td>
      <Table.Td>{d.distributedBy}</Table.Td>
      <Table.Td>{new Date(d.distributedAt).toLocaleString()}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>Distributions</Title>
        <Button component={Link} to="/" variant="light" leftSection={<IconArrowLeft size={16} />}>Back to Home</Button>
      </Group>

      <Stack gap="sm">
        <Group align="flex-end" wrap="wrap">
          <TextInput
            label="Staff National ID"
            placeholder="e.g. 1234567890"
            value={staffNationalId}
            onChange={(e) => setStaffNationalId(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            style={{ minWidth: 260 }}
          />
          <Select
            label="Medicine"
            placeholder="Filter by medicine"
            searchable
            clearable
            data={medicineOptions}
            value={medicineId}
            onChange={(val) => setMedicineId(val || '')}
            style={{ minWidth: 260 }}
          />
          <Group>
            <Button onClick={() => loadDistributions({ resetOffset: true })}>
              Apply Filters
            </Button>
            <Button variant="light" color="gray" leftSection={<IconRefresh size={16} />} onClick={clearFilters}>
              Reset
            </Button>
          </Group>
        </Group>
      </Stack>

      <Box pos="relative">
        <LoadingOverlay visible={loading} />
        {items.length === 0 && !loading ? (
          <Text c="dimmed" ta="center" py="xl">
            No distributions found.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Medicine</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Staff</Table.Th>
                <Table.Th>National ID</Table.Th>
                <Table.Th>Distributed By</Table.Th>
                <Table.Th>Distributed At</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        )}
      </Box>

      <Group justify="space-between" align="center" wrap="wrap">
        <Text size="sm" c="dimmed">
          Showing {items.length} of {total} — Page {currentPage} / {pages}
        </Text>
        <Group>
          <Select
            label="Rows per page"
            data={[
              { value: '20', label: '20' },
              { value: '50', label: '50' },
              { value: '100', label: '100' },
              { value: '200', label: '200' },
            ]}
            value={String(limit)}
            onChange={(v) => {
              const newLimit = Number(v || 50);
              setOffset(0);
              setLimit(newLimit);
            }}
            style={{ width: 140 }}
          />
          <Button variant="light" onClick={goPrev} disabled={offset === 0} leftSection={<IconChevronLeft size={16} />}>
            Previous
          </Button>
          <Button
            variant="light"
            onClick={goNext}
            disabled={offset + limit >= total}
            rightSection={<IconChevronRight size={16} />}
          >
            Next
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
