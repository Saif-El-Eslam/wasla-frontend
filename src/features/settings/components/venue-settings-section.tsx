'use client';

import { Building2, CreditCard, MapPin, MessageCircle, Phone, Save, Sparkles, Store, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { UseMutationResult } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { Card, PrimaryButton, SecondaryButton } from '@/components/ui/dashboard-ui';
import { FormInput } from '@/components/ui/form-input';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { readError } from '@/features/dashboard/utils/dashboard-utils';
import type { UpdateVenueInput, Venue } from '@/lib/api';
import { cleanupUploadedImages, uploadImageDirect } from '@/lib/api/image-upload';
import { textForLocale } from '@/lib/localized-text';
import type {
  VenueSettingsFormInput,
  VenueSettingsFormValues,
} from '@/features/settings/schemas/settings.schema';
import { DetailTile, SettingsPanelHeader, settingsInputClassName } from './settings-ui';

const venueTypes = [
  'RESTAURANT',
  'CAFE',
  'BAKERY',
  'DESSERT_SHOP',
  'FOOD_TRUCK',
  'CLOUD_KITCHEN',
  'CATERING',
  'LOUNGE',
  'OTHER',
] as const;

function cleanLocalized(value: { en?: string; ar?: string }) {
  const next: Record<string, string> = {};

  if (value.en?.trim()) {
    next.en = value.en.trim();
  }

  if (value.ar?.trim()) {
    next.ar = value.ar.trim();
  }

  return Object.keys(next).length > 0 ? next : undefined;
}

export function VenueSettingsSection({
  venue,
  locale,
  form,
  mutation,
}: {
  venue?: Venue;
  locale: string;
  form: UseFormReturn<VenueSettingsFormInput, unknown, VenueSettingsFormValues>;
  mutation: UseMutationResult<{ venue: Venue }, Error, UpdateVenueInput>;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const [editing, setEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState('');
  const pending = mutation.isPending || uploadingImages;

  const closeEditor = () => {
    setLogoFile(null);
    setCoverFile(null);
    setImageError('');
    setEditing(false);
  };

  const submitVenueSettings = async (values: VenueSettingsFormValues) => {
    const uploadedUrls: string[] = [];

    try {
      setUploadingImages(true);
      setImageError('');

      const logoUrl = logoFile ? (await uploadImageDirect(logoFile, 'venue')).url : values.logoUrl;
      if (logoFile && logoUrl) {
        uploadedUrls.push(logoUrl);
      }

      const coverUrl = coverFile ? (await uploadImageDirect(coverFile, 'venue')).url : values.coverUrl;
      if (coverFile && coverUrl) {
        uploadedUrls.push(coverUrl);
      }

      await mutation.mutateAsync({
        type: values.type,
        name: cleanLocalized(values.name),
        description: cleanLocalized(values.description ?? {}),
        defaultLocale: values.defaultLocale === 'en' ? 'en' : 'ar',
        supportedLocales: ['ar', 'en'],
        logoUrl,
        coverUrl,
        phone: values.phone,
        whatsapp: values.whatsapp,
        address: cleanLocalized(values.address ?? {}),
        googleMapsUrl: values.googleMapsUrl,
        instagramUrl: values.instagramUrl,
      });

      closeEditor();
    } catch (error) {
      await cleanupUploadedImages(uploadedUrls);
      setImageError(error instanceof Error ? error.message : 'Could not save images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  if (!editing) {
    return (
      <Card className="flex flex-col gap-5 border-teal-100 bg-[#fbfefd] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SettingsPanelHeader icon={Store} title={t('venueSettings')} body={t('venueSettingsBody')} />
          <PrimaryButton onClick={() => setEditing(true)} className="shrink-0">
            <Save className="size-4" />
            {t('editVenue')}
          </PrimaryButton>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DetailTile
            icon={Building2}
            label={t('name')}
            value={textForLocale(venue?.name, locale) || commonT('notSet')}
          />
          <DetailTile icon={Sparkles} label={t('type')} value={venue?.type ?? commonT('notSet')} />
          <DetailTile icon={CreditCard} label={t('currency')} value={venue?.currency ?? 'EGP'} />
          <DetailTile icon={Phone} label={t('phone')} value={venue?.phone ?? commonT('notSet')} />
          <DetailTile
            icon={MessageCircle}
            label={t('whatsapp')}
            value={venue?.whatsapp ?? commonT('notSet')}
          />
          <DetailTile
            icon={MapPin}
            label={t('address')}
            value={textForLocale(venue?.address, locale) || commonT('notSet')}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-teal-100 bg-[#fbfefd] p-5">
      <SettingsPanelHeader icon={Store} title={t('venueSettings')} body={t('venueSettingsBody')} />
      <form className="grid gap-4" onSubmit={form.handleSubmit(submitVenueSettings)}>
        <div className="grid gap-3 lg:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-bold text-muted-foreground">{t('type')}</span>
            <select className={settingsInputClassName} {...form.register('type')}>
              {venueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-bold text-muted-foreground">{t('defaultLocale')}</span>
            <select className={settingsInputClassName} {...form.register('defaultLocale')}>
              <option value="ar">AR</option>
              <option value="en">EN</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <ImageUploadField
            label={t('logoUrl')}
            value={(form.watch('logoUrl') as string) ?? ''}
            file={logoFile}
            onFileChange={setLogoFile}
            onChange={(value) => form.setValue('logoUrl', value, { shouldDirty: true, shouldValidate: true })}
            aspect="aspect-[5/2]"
            disabled={pending}
            pending={pending}
          />
          <ImageUploadField
            label={t('coverUrl')}
            value={(form.watch('coverUrl') as string) ?? ''}
            file={coverFile}
            onFileChange={setCoverFile}
            onChange={(value) =>
              form.setValue('coverUrl', value, { shouldDirty: true, shouldValidate: true })
            }
            aspect="aspect-[5/2]"
            disabled={pending}
            pending={pending}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormInput
            name="name.en"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('venueNameEn')}
            className={settingsInputClassName}
          />
          <FormInput
            name="name.ar"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('venueNameAr')}
            className={settingsInputClassName}
            dir="rtl"
          />
          <FormInput
            name="description.en"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('venueDescriptionEn')}
            className={settingsInputClassName}
          />
          <FormInput
            name="description.ar"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('venueDescriptionAr')}
            className={settingsInputClassName}
            dir="rtl"
          />
          <FormInput
            name="address.en"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('venueAddressEn')}
            className={settingsInputClassName}
          />
          <FormInput
            name="address.ar"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('venueAddressAr')}
            className={settingsInputClassName}
            dir="rtl"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormInput
            name="phone"
            type="tel"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('phone')}
            className={settingsInputClassName}
          />
          <FormInput
            name="whatsapp"
            type="tel"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('whatsapp')}
            className={settingsInputClassName}
          />
          <FormInput
            name="googleMapsUrl"
            type="url"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('googleMapsUrl')}
            className={settingsInputClassName}
          />
          <FormInput
            name="instagramUrl"
            type="url"
            register={form.register}
            errors={form.formState.errors}
            placeholder={t('instagramUrl')}
            className={settingsInputClassName}
          />
        </div>

        {mutation.error ? <p className="text-sm text-red-700">{readError(mutation.error)}</p> : null}
        {imageError ? <p className="text-sm text-red-700">{imageError}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton
            type="button"
            onClick={closeEditor}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-bold transition hover:brightness-95"
          >
            <X className="size-4" />
            {commonT('cancel')}
          </SecondaryButton>
          <PrimaryButton type="submit" loading={pending} className="sm:min-w-40">
            <Save className="size-4" />
            {t('saveVenue')}
          </PrimaryButton>
        </div>
      </form>
    </Card>
  );
}
