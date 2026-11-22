import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { aPressDTO } from './contentFixtures';
import { mockServices } from './mockServices';
import { toPageContent } from '../frontend/src/application/mappers/contentAggregate';
import { entryPlan } from '../frontend/src/application/services/editing/entryPlan';
import { EditorFieldKey } from '../frontend/src/domain/models/ContentEditor';
import { Field } from '../frontend/src/ui/Controls/Controls.presentational';

it.each(['2026-10-01T14:30:00.123456Z', '2026-10-01T14:30:00.123000Z'])(
  'renders the actual datetime Field for persisted %s without value sanitization loss',
  (publishedAt) => {
    const dto = aPressDTO();
    dto.entries[0]!.published_at = publishedAt;
    const { page } = mockServices();
    const plan = entryPlan(toPageContent(dto), page, dto.entries[0]!.id)!;
    const field = plan.draft.fields.find(
      (item) => item.key === EditorFieldKey.PublishedAt,
    )!;
    render(
      <Field
        label={field.label}
        kind={field.kind}
        value={field.value}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Published at (UTC)')).toHaveValue(
      '2026-10-01T14:30:00.123',
    );
  },
);
