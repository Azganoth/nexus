import { useDebounceValue } from "$/hooks/useDebouce";
import { AUTO_SAVE_DELAY } from "$/lib/constants";
import { useEffect } from "react";
import { Control, FieldValues, Path, useWatch } from "react-hook-form";

interface UseAutoSaveFormProps<T extends FieldValues> {
  control: Control<T>;
  fields: Path<T>[];
  currentValues: Pick<T, Path<T>>;
  trigger: (fields: Path<T>[]) => Promise<boolean>;
  submitData: (data: Partial<T>) => void;
  delay?: number;
}

export function useAutoSaveForm<T extends FieldValues>({
  control,
  fields,
  currentValues,
  trigger,
  submitData,
  delay = AUTO_SAVE_DELAY,
}: UseAutoSaveFormProps<T>) {
  const watchedValues = useWatch({ control, name: fields });
  const debouncedValues = useDebounceValue(watchedValues, delay);

  useEffect(() => {
    const autoSave = async () => {
      const hasChanges = fields.some(
        (field, i) => debouncedValues[i] !== currentValues[field],
      );
      if (hasChanges) {
        const isValid = await trigger(fields);
        if (isValid) {
          const data = fields.reduce((acc, field, i) => {
            acc[field] = debouncedValues[i];
            return acc;
          }, {} as Partial<T>);
          submitData(data);
        }
      }
    };
    autoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValues]);

  return { watchedValues, debouncedValues };
}
