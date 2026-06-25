'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  CheckCircle2,
  Edit3,
  MapPin,
  MoreVertical,
  Plus,
  QrCode,
  Search,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, type BranchManagement, type OpeningHours } from '@/lib/api';
import {
  Badge,
  Card,
  FormPanel,
  IconButton,
  PrimaryButton,
  SectionTitle,
  TabLoader,
  slugify,
} from '@/components/ui/dashboard-ui';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  readError,
  toLocalized,
  toLocalizedDraft,
  type LocalizedDraft,
} from '@/features/dashboard/utils/dashboard-utils';
import { useBranchManagement } from '@/features/venue/hooks/use-venue';
import {
  addBranchToCaches,
  removeBranchFromCaches,
  setMainBranchInCaches,
  updateBranchCaches,
} from '@/features/branches/cache/branch-cache';
import { textForLocale } from '@/lib/localized-text';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  branchSchema,
  type BranchFormInput,
  type BranchFormValues,
} from '@/features/branches/schemas/branch.schema';
import { FormInput } from '@/components/ui/form-input';

function normalizeOpeningHours(openingHours: BranchManagement['openingHours']): OpeningHours | undefined {
  if (!openingHours) {
    return undefined;
  }

  const from = typeof openingHours.from === 'string' ? openingHours.from : '';
  const to = typeof openingHours.to === 'string' ? openingHours.to : '';

  return from || to ? { from, to } : undefined;
}

export function BranchesTab({
  locale,
  onOpenMenu,
  onOpenQr,
  onOpenStats,
}: {
  locale: string;
  onOpenMenu: (branchId: string) => void;
  onOpenQr: (branchId: string) => void;
  onOpenStats: (branchId: string) => void;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();
  const branchesQuery = useBranchManagement();
  const branches = branchesQuery.data?.branches ?? [];
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchManagement | null>(null);
  const form = useForm<BranchFormInput, unknown, BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: { en: '', ar: '' },
      slug: '',
      active: true,
      phone: '',
      whatsapp: '',
      address: { en: '', ar: '' },
      logoUrl: '',
      coverUrl: '',
      googleMapsUrl: '',
      instagramUrl: '',
      openingHours: { from: '', to: '' },
    },
  });
  const [openActionsBranchId, setOpenActionsBranchId] = useState<string | null>(null);
  const [deleteBranchId, setDeleteBranchId] = useState<string | null>(null);
  const filtered = branches.filter((branch) =>
    `${textForLocale(branch.name, locale)} ${branch.slug}`.toLowerCase().includes(search.toLowerCase()),
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!openActionsBranchId) {
      return;
    }

    const closeActionsOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Element | null;

      if (target?.closest('[data-branch-actions-root]')) {
        return;
      }

      setOpenActionsBranchId(null);
    };

    document.addEventListener('pointerdown', closeActionsOnOutsideClick);

    return () => document.removeEventListener('pointerdown', closeActionsOnOutsideClick);
  }, [openActionsBranchId]);

  const resetForm = () => {
    setEditingBranch(null);
    reset({
      name: { en: '', ar: '' },
      slug: '',
      active: true,
      phone: '',
      whatsapp: '',
      address: { en: '', ar: '' },
      logoUrl: '',
      coverUrl: '',
      googleMapsUrl: '',
      instagramUrl: '',
      openingHours: { from: '', to: '' },
    });
    setFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
    setOpenActionsBranchId(null);
  };

  const openEditForm = (branch: BranchManagement) => {
    setEditingBranch(branch);
    setOpenActionsBranchId(null);

    reset({
      name: toLocalizedDraft(branch.name, locale),
      slug: branch.slug,
      active: branch.active,
      phone: branch.phone ?? '',
      whatsapp: branch.whatsapp ?? '',
      address: toLocalizedDraft(branch.address, locale),
      logoUrl: branch.logoUrl ?? '',
      coverUrl: branch.coverUrl ?? '',
      googleMapsUrl: branch.googleMapsUrl ?? '',
      instagramUrl: branch.instagramUrl ?? '',
      openingHours: normalizeOpeningHours(branch.openingHours) ?? { from: '', to: '' },
    });

    setFormOpen(true);
  };

  const branchPayload = (values: BranchFormValues) => {
    const address: LocalizedDraft = {
      en: values.address.en ?? '',
      ar: values.address.ar ?? '',
    };
    const openingHours =
      values.openingHours?.from || values.openingHours?.to
        ? { from: values.openingHours.from, to: values.openingHours.to }
        : undefined;

    return {
      name: toLocalized(values.name, t('branches')),
      slug: values.slug || slugify(values.name.en || values.name.ar || 'branch'),
      active: values.active,
      phone: values.phone || undefined,
      whatsapp: values.whatsapp || undefined,
      address: address.en || address.ar ? toLocalized(address, '') : undefined,
      logoUrl: values.logoUrl || undefined,
      coverUrl: values.coverUrl || undefined,
      googleMapsUrl: values.googleMapsUrl || undefined,
      instagramUrl: values.instagramUrl || undefined,
      openingHours,
    };
  };

  const createBranchMutation = useMutation({
    mutationFn: (values: BranchFormValues) => api.createBranch(branchPayload(values)),
    onSuccess: ({ branch }, values) => {
      const payload = branchPayload(values);

      addBranchToCaches(queryClient, {
        ...branch,
        ...payload,
        isMain: branch.isMain,
        active: payload.active,
        phone: payload.phone ?? null,
        whatsapp: payload.whatsapp ?? null,
        address: payload.address ?? null,
        logoUrl: payload.logoUrl ?? null,
        coverUrl: payload.coverUrl ?? null,
        googleMapsUrl: payload.googleMapsUrl ?? null,
        instagramUrl: payload.instagramUrl ?? null,
        openingHours: payload.openingHours ?? null,
        menuId: null,
        hasMenu: false,
        publishedAt: null,
        stats: {
          categories: 0,
          items: 0,
          views: 0,
          scans: 0,
          whatsapp: 0,
          calls: 0,
          maps: 0,
        },
      });
      resetForm();
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: (values: BranchFormValues) => {
      if (!editingBranch) {
        throw new Error('No branch selected');
      }

      return api.updateBranch(editingBranch.id, branchPayload(values));
    },
    onSuccess: (_result, values) => {
      if (editingBranch) {
        updateBranchCaches(queryClient, editingBranch.id, branchPayload(values));
      }
      resetForm();
    },
  });

  const setMainMutation = useMutation({
    mutationFn: (branchId: string) => api.setMainBranch(branchId),
    onSuccess: (_result, branchId) => setMainBranchInCaches(queryClient, branchId),
  });

  const toggleBranchMutation = useMutation({
    mutationFn: (branch: BranchManagement) => api.updateBranch(branch.id, { active: !branch.active }),
    onSuccess: (_result, branch) => updateBranchCaches(queryClient, branch.id, { active: !branch.active }),
  });

  const deleteBranchMutation = useMutation({
    mutationFn: (branchId: string) => api.deleteBranch(branchId),
    onSuccess: (_result, branchId) => {
      removeBranchFromCaches(queryClient, branchId);
      setDeleteBranchId(null);
    },
  });

  if (branchesQuery.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('venueStructure')} title={t('branches')}>
        <PrimaryButton onClick={openCreateForm}>
          <Plus className="size-4" />
          {t('addBranch')}
        </PrimaryButton>
      </SectionTitle>
      <Card>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-11 w-full rounded-xl border border-border px-9 outline-none focus:border-primary"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchBranches')}
          />
        </label>
      </Card>

      {formOpen ? (
        <FormPanel
          title={editingBranch ? t('editBranch') : t('addBranch')}
          closeLabel={commonT('close')}
          onClose={resetForm}
        >
          <form
            onSubmit={handleSubmit((values) =>
              editingBranch ? updateBranchMutation.mutate(values) : createBranchMutation.mutate(values),
            )}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              <FormInput
                name="name.en"
                register={register}
                errors={errors}
                placeholder={t('nameInEnglish')}
              />

              <FormInput name="name.ar" register={register} errors={errors} placeholder={t('nameInArabic')} />

              <FormInput name="slug" register={register} errors={errors} placeholder={t('slug')} />

              <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold">
                <input type="checkbox" {...register('active')} />
                {t('activeBranch')}
              </label>

              <FormInput
                name="phone"
                type="tel"
                register={register}
                errors={errors}
                placeholder={t('phone')}
              />

              <FormInput
                name="whatsapp"
                type="tel"
                register={register}
                errors={errors}
                placeholder={t('whatsapp')}
              />

              <FormInput
                name="address.en"
                register={register}
                errors={errors}
                placeholder={t('addressInEnglish')}
              />

              <FormInput
                name="address.ar"
                register={register}
                errors={errors}
                placeholder={t('addressInArabic')}
              />

              <FormInput
                name="logoUrl"
                type="url"
                register={register}
                errors={errors}
                placeholder={t('logoUrl')}
              />

              <FormInput
                name="coverUrl"
                type="url"
                register={register}
                errors={errors}
                placeholder={t('coverUrl')}
              />

              <FormInput
                name="googleMapsUrl"
                type="url"
                register={register}
                errors={errors}
                placeholder={t('googleMapsUrl')}
              />

              <FormInput
                name="instagramUrl"
                type="url"
                register={register}
                errors={errors}
                placeholder={t('instagramUrl')}
              />

              <FormInput
                name="openingHours.from"
                label={t('openingHoursFrom')}
                type="time"
                register={register}
                errors={errors}
                placeholder={t('openingHoursFrom')}
              />
              <FormInput
                name="openingHours.to"
                label={t('openingHoursTo')}
                type="time"
                register={register}
                errors={errors}
                placeholder={t('openingHoursTo')}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <button
                className="h-11 rounded-xl border border-border bg-white px-4 text-sm font-bold"
                onClick={resetForm}
              >
                {commonT('cancel')}
              </button>
              <PrimaryButton
                type="submit"
                disabled={isSubmitting || createBranchMutation.isPending || updateBranchMutation.isPending}
              >
                <CheckCircle2 className="size-4" />
                {editingBranch ? t('saveBranch') : t('createBranch')}
              </PrimaryButton>
            </div>
          </form>
          {createBranchMutation.error ? (
            <p className="mt-2 text-sm text-red-700">{readError(createBranchMutation.error)}</p>
          ) : null}
          {updateBranchMutation.error ? (
            <p className="mt-2 text-sm text-red-700">{readError(updateBranchMutation.error)}</p>
          ) : null}
        </FormPanel>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {filtered.map((branch) => {
          const stats = branch.stats;
          const branchName = textForLocale(branch.name, locale) || branch.slug;

          return (
            <Card key={branch.id} className={branch.isMain ? 'relative border-teal-200' : 'relative'}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-stone-950">{branchName}</h3>
                    {branch.isMain ? <Badge tone="teal">{t('main')}</Badge> : null}
                    <Badge tone={branch.active ? 'green' : 'muted'}>
                      {branch.active ? t('active') : t('inactive')}
                    </Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {textForLocale(branch.address, locale) || branch.slug}
                  </p>
                </div>

                <div data-branch-actions-root>
                  <IconButton
                    label={t('branchActions')}
                    onClick={() =>
                      setOpenActionsBranchId((current) => (current === branch.id ? null : branch.id))
                    }
                  >
                    <MoreVertical className="size-4" />
                  </IconButton>
                  {openActionsBranchId === branch.id ? (
                    <div className="absolute end-4 top-14 z-20 w-52 rounded-2xl border border-border bg-white p-2 shadow-2xl">
                      <button
                        className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                        onClick={() => openEditForm(branch)}
                      >
                        <Edit3 className="size-4" />
                        {t('editBranch')}
                      </button>
                      <button
                        className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                        onClick={() => {
                          setOpenActionsBranchId(null);
                          toggleBranchMutation.mutate(branch);
                        }}
                        disabled={toggleBranchMutation.isPending}
                      >
                        {branch.active ? (
                          <ToggleRight className="size-4 text-primary" />
                        ) : (
                          <ToggleLeft className="size-4" />
                        )}
                        {branch.active ? t('deactivate') : t('activate')}
                      </button>
                      <button
                        className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                        onClick={() => {
                          setOpenActionsBranchId(null);
                          setDeleteBranchId(branch.id);
                        }}
                      >
                        <Trash2 className="size-4 text-red-600" />
                        {t('deleteBranch')}
                      </button>
                      {!branch.isMain ? (
                        <button
                          className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                          onClick={() => {
                            setOpenActionsBranchId(null);
                            setMainMutation.mutate(branch.id);
                          }}
                          disabled={setMainMutation.isPending}
                        >
                          <Star className="size-4" />
                          {t('setMain')}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="font-black text-stone-900">{stats.items}</p>
                  <p className="text-xs text-muted-foreground">{t('items')}</p>
                </div>
                <div className="rounded-xl bg-teal-50 p-3">
                  <p className="font-black text-teal-700">{stats.scans}</p>
                  <p className="text-xs text-teal-700">{t('scans')}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="font-black text-amber-700">{stats.views}</p>
                  <p className="text-xs text-amber-700">{t('views')}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                {[
                  { label: t('menu'), icon: UtensilsCrossed, onClick: () => onOpenMenu(branch.id) },
                  { label: t('qr'), icon: QrCode, onClick: () => onOpenQr(branch.id) },
                  { label: t('stats'), icon: BarChart3, onClick: () => onOpenStats(branch.id) },
                ].map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-stone-600 transition hover:bg-stone-50 hover:text-primary"
                      onClick={action.onClick}
                    >
                      <Icon className="size-4" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
      {deleteBranchId && (
        <ConfirmationModal
          open={!!deleteBranchId}
          setOpen={(open) => !open && !deleteBranchMutation.isPending && setDeleteBranchId(null)}
          title={t('deleteBranch')}
          description={t('deleteBranchWarning')}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          confirmLoading={deleteBranchMutation.isPending}
          onConfirm={() => deleteBranchMutation.mutate(deleteBranchId)}
        />
      )}
    </div>
  );
}
