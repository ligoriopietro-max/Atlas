(function (root) {
  'use strict';

  const ENUMS = {
    entity_type: ['professional', 'center', 'service'],
    verification_status: ['unverified', 'self_declared', 'document_checked', 'atlas_verified', 'stale'],
    availability_status: ['unknown', 'accepting', 'waitlist', 'not_accepting'],
    setting: ['private', 'public', 'convention', 'mixed', 'unknown'],
    appointment_mode: ['in_person', 'online', 'home_visit', 'mixed'],
  };

  const REQUIRED = ['id', 'entity_type', 'name', 'services', 'verification', 'access'];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function isArray(value) {
    return Array.isArray(value);
  }

  function validate(record) {
    const errors = [];
    const warnings = [];

    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      return { valid: false, errors: ['record must be an object'], warnings: [] };
    }

    REQUIRED.forEach(function (field) {
      if (record[field] === undefined || record[field] === null) {
        errors.push('missing required field: ' + field);
      }
    });

    if (record.id !== undefined && !hasText(record.id)) errors.push('id must be non-empty text');
    if (record.name !== undefined && !hasText(record.name)) errors.push('name must be non-empty text');

    if (record.entity_type !== undefined && !ENUMS.entity_type.includes(record.entity_type)) {
      errors.push('invalid entity_type');
    }

    if (record.services !== undefined && !isArray(record.services)) {
      errors.push('services must be an array');
    }

    const verification = record.verification;
    if (verification && typeof verification === 'object') {
      if (!ENUMS.verification_status.includes(verification.status)) {
        errors.push('invalid verification.status');
      }
      if (verification.status === 'atlas_verified' && !hasText(verification.checked_at)) {
        errors.push('atlas_verified requires verification.checked_at');
      }
      if (verification.status === 'document_checked' && !hasText(verification.source)) {
        errors.push('document_checked requires verification.source');
      }
      if (verification.status === 'stale') {
        warnings.push('verification is stale; matching may use the record only with a freshness penalty');
      }
    }

    const access = record.access;
    if (access && typeof access === 'object') {
      if (access.setting !== undefined && !ENUMS.setting.includes(access.setting)) {
        errors.push('invalid access.setting');
      }
      if (access.appointment_modes !== undefined) {
        if (!isArray(access.appointment_modes) || access.appointment_modes.some(function (m) { return !ENUMS.appointment_mode.includes(m); })) {
          errors.push('invalid access.appointment_modes');
        }
      }
      if (access.online === true && access.appointment_modes && !access.appointment_modes.includes('online')) {
        warnings.push('access.online=true but online is absent from appointment_modes');
      }
    }

    if (record.availability && typeof record.availability === 'object') {
      if (!ENUMS.availability_status.includes(record.availability.status)) {
        errors.push('invalid availability.status');
      }
      if (record.availability.estimated_wait_days !== undefined && record.availability.estimated_wait_days !== null && (typeof record.availability.estimated_wait_days !== 'number' || record.availability.estimated_wait_days < 0)) {
        errors.push('availability.estimated_wait_days must be a non-negative number');
      }
    }

    if (record.cost && typeof record.cost === 'object') {
      if (record.cost.min !== undefined && record.cost.min !== null && typeof record.cost.min !== 'number') errors.push('cost.min must be numeric');
      if (record.cost.max !== undefined && record.cost.max !== null && typeof record.cost.max !== 'number') errors.push('cost.max must be numeric');
      if (record.cost.min !== undefined && record.cost.min !== null && record.cost.max !== undefined && record.cost.max !== null && record.cost.min > record.cost.max) {
        errors.push('cost.min cannot exceed cost.max');
      }
    }

    if (record.matching && record.matching.ranking_score !== undefined) {
      errors.push('ranking_score is not part of the source data model; ranking must be calculated transparently at match time');
    }

    if (record.claims && Array.isArray(record.claims)) {
      record.claims.forEach(function (claim, i) {
        if (!claim || typeof claim !== 'object' || !hasText(claim.text)) {
          errors.push('claims[' + i + '] must contain text');
        }
        if (claim && claim.verified !== true) {
          warnings.push('claims[' + i + '] is not verified');
        }
      });
    }

    return { valid: errors.length === 0, errors: errors, warnings: warnings };
  }

  function createExample(entityType) {
    return {
      id: 'EXAMPLE-' + String(entityType || 'professional').toUpperCase(),
      entity_type: entityType || 'professional',
      name: 'ESEMPIO — record sintetico',
      professional_role: entityType === 'professional' ? 'logopedista' : null,
      specializations: ['autismo', 'neurodivergenze'],
      services: ['valutazione', 'intervento', 'supporto alla famiglia'],
      population: { age_min: 3, age_max: 18, notes: 'Esempio sintetico, non reale.' },
      access: {
        city: 'ESEMPIO', province: 'XX', region: 'ESEMPIO',
        service_areas: [], online: true, home_visit: false,
        setting: 'private', appointment_modes: ['in_person', 'online']
      },
      accessibility: { cAA: false, sensory_friendly: 'unknown', notes: null },
      availability: { status: 'unknown', estimated_wait_days: null, checked_at: null },
      cost: { min: null, max: null, currency: 'EUR', unit: 'session', reimbursement: 'unknown' },
      verification: {
        status: 'self_declared', checked_at: null, source: 'example_only',
        expires_at: null, notes: 'Record sintetico per test; non rappresenta un fornitore reale.'
      },
      claims: [],
      contacts: { website: null, booking_url: null, phone: null },
      last_updated_at: '2026-09-30'
    };
  }

  const AtlasMatchingDataModel = {
    version: '0.1',
    enums: clone(ENUMS),
    required: REQUIRED.slice(),
    validate: validate,
    createExample: createExample
  };

  root.AtlasMatchingDataModel = AtlasMatchingDataModel;
})(typeof window !== 'undefined' ? window : globalThis);
