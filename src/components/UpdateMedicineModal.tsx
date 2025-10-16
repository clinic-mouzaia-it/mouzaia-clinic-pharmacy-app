import { useMemo, useState, useEffect } from 'react';
import { Modal, TextInput, NumberInput, Button, Stack, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiService } from '../services/api';
import { MedicineUpdateSchema, type Medicine, type MedicineUpdate } from '../types';

interface UpdateMedicineModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  medicine: Medicine | null;
}

export default function UpdateMedicineModal({ opened, onClose, onSuccess, medicine }: UpdateMedicineModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialForm = useMemo(() => ({
    dci: medicine?.dci ?? '',
    nomCommercial: medicine?.nomCommercial ?? '',
    stock: medicine?.stock ?? 0,
    ddp: medicine?.ddp ?? '',
    lot: medicine?.lot ?? '',
    cout: medicine?.cout ?? 0,
    prixDeVente: medicine?.prixDeVente ?? 0,
  }), [medicine]);

  const [formData, setFormData] = useState(initialForm);

  // Reset form when medicine changes or modal opens
  useEffect(() => {
    setFormData(initialForm);
  }, [initialForm, opened]);

  const buildPayload = (): MedicineUpdate => {
    if (!medicine) return {} as MedicineUpdate;
    const payload: Partial<MedicineUpdate> = {};

    if (formData.dci !== medicine.dci) payload.dci = formData.dci;
    if (formData.nomCommercial !== medicine.nomCommercial) payload.nomCommercial = formData.nomCommercial;
    if (formData.stock !== medicine.stock) payload.stock = Number(formData.stock) || 0;
    const ddpNorm = formData.ddp || undefined;
    if (ddpNorm !== (medicine.ddp || undefined)) payload.ddp = ddpNorm as any;
    const lotNorm = formData.lot || undefined;
    if (lotNorm !== (medicine.lot || undefined)) payload.lot = lotNorm as any;
    if (formData.cout !== medicine.cout) payload.cout = Number(formData.cout) || 0;
    if (formData.prixDeVente !== medicine.prixDeVente) payload.prixDeVente = Number(formData.prixDeVente) || 0;

    return payload as MedicineUpdate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = buildPayload();

    // Validate with Zod (requires at least one field)
    const result = MedicineUpdateSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = (err.path[0] as string) || 'form';
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (!medicine) return;
      setLoading(true);
      await apiService.updateMedicine(medicine.id, result.data);
      notifications.show({
        title: 'Success',
        message: 'Medicine updated successfully',
        color: 'green',
      });
      onSuccess();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update medicine',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Update Medicine${medicine ? `: ${medicine.nomCommercial}` : ''}`} size="lg">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="DCI (Active Ingredient)"
            placeholder="Enter DCI"
            value={formData.dci}
            onChange={(e) => setFormData({ ...formData, dci: e.target.value })}
            error={errors.dci}
          />

          <TextInput
            label="Commercial Name"
            placeholder="Enter commercial name"
            value={formData.nomCommercial}
            onChange={(e) => setFormData({ ...formData, nomCommercial: e.target.value })}
            error={errors.nomCommercial}
          />

          <NumberInput
            label="Stock"
            placeholder="Enter stock quantity"
            min={0}
            value={formData.stock}
            onChange={(value) => setFormData({ ...formData, stock: Number(value) || 0 })}
            error={errors.stock}
          />

          <Group grow>
            <NumberInput
              label="Cost (DA)"
              placeholder="Enter cost"
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
              value={formData.ddp as string}
              onChange={(e) => setFormData({ ...formData, ddp: e.target.value })}
            />

            <TextInput
              label="Lot (Optional)"
              placeholder="Enter lot number"
              value={formData.lot as string}
              onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
