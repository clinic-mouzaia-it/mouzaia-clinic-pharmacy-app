import { useState } from 'react';
import { Modal, TextInput, NumberInput, Button, Stack, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiService } from '../services/api';
import { MedicineCreateSchema, type MedicineCreate } from '../types';

interface AddMedicineModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMedicineModal({ opened, onClose, onSuccess }: AddMedicineModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MedicineCreate>({
    dci: '',
    nomCommercial: '',
    stock: 0,
    ddp: '',
    lot: '',
    cout: 0,
    prixDeVente: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = MedicineCreateSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      await apiService.createMedicine(result.data);
      notifications.show({
        title: 'Success',
        message: 'Medicine added successfully',
        color: 'green',
      });
      setFormData({
        dci: '',
        nomCommercial: '',
        stock: 0,
        ddp: '',
        lot: '',
        cout: 0,
        prixDeVente: 0,
      });
      onSuccess();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to add medicine',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add New Medicine" size="lg">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="DCI (Active Ingredient)"
            placeholder="Enter DCI"
            required
            value={formData.dci}
            onChange={(e) => setFormData({ ...formData, dci: e.target.value })}
            error={errors.dci}
          />

          <TextInput
            label="Commercial Name"
            placeholder="Enter commercial name"
            required
            value={formData.nomCommercial}
            onChange={(e) => setFormData({ ...formData, nomCommercial: e.target.value })}
            error={errors.nomCommercial}
          />

          <NumberInput
            label="Initial Stock"
            placeholder="Enter stock quantity"
            required
            min={0}
            value={formData.stock}
            onChange={(value) => setFormData({ ...formData, stock: Number(value) || 0 })}
            error={errors.stock}
          />

          <Group grow>
            <NumberInput
              label="Cost (DA)"
              placeholder="Enter cost"
              required
              min={0}
              decimalScale={2}
              fixedDecimalScale
              value={formData.cout}
              onChange={(value) => setFormData({ ...formData, cout: Number(value) || 0 })}
              error={errors.cout}
            />

            <NumberInput
              label="Sale Price (DA)"
              placeholder="Enter sale price"
              required
              min={0}
              decimalScale={2}
              fixedDecimalScale
              value={formData.prixDeVente}
              onChange={(value) => setFormData({ ...formData, prixDeVente: Number(value) || 0 })}
              error={errors.prixDeVente}
            />
          </Group>

          <Group grow>
            <TextInput
              label="DDP (Optional)"
              type="date"
              placeholder="Enter DDP"
              value={formData.ddp}
              onChange={(e) => setFormData({ ...formData, ddp: e.target.value })}
            />

            <TextInput
              label="Lot (Optional)"
              placeholder="Enter lot number"
              value={formData.lot}
              onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Medicine
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
