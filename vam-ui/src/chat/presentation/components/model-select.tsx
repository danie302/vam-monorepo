'use client';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

/** Compact model picker; hidden when there is nothing to choose. */
export function ModelSelect({
  models,
  value,
  onChange,
  disabled,
}: {
  models: string[];
  value?: string;
  onChange: (model: string) => void;
  disabled: boolean;
}) {
  if (models.length < 2 || !value) return null;
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      variant="standard"
      disableUnderline
      size="small"
      inputProps={{ 'aria-label': 'Model' }}
      sx={{ fontSize: '0.75rem', color: 'text.secondary', '& .MuiSelect-select': { py: 0 } }}
    >
      {models.map((model) => (
        <MenuItem key={model} value={model} sx={{ fontSize: '0.875rem' }}>
          {model}
        </MenuItem>
      ))}
    </Select>
  );
}
