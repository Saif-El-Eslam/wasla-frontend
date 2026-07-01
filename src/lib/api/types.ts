export type ApiEnvelope<T> = {
  success: true;
  data: T;
};

export type LocalizedText = Record<string, string>;
export type LocalizedValue = LocalizedText | string;
export type OpeningHours = {
  from: string;
  to: string;
};

export type CurrentUser = {
  id: string;
  name: string | null;
  phone: string;
  verified: boolean;
  role: string;
  venueId: string | null;
  branches: Array<{
    id: string;
    name: LocalizedValue;
    slug: string;
    isMain: boolean;
    active: boolean;
  }>;
};

export type UpdateMeInput = {
  name?: string;
  phone?: string;
};

export type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type Branch = {
  id: string;
  venueId: string;
  name: LocalizedValue;
  slug: string;
  isMain: boolean;
  active: boolean;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: LocalizedValue | null;
  googleMapsUrl: string | null;
  instagramUrl: string | null;
  openingHours?: OpeningHours | null;
  menu?: Menu | null;
};

export type BranchStats = {
  categories: number;
  items: number;
  views: number;
  scans: number;
  whatsapp: number;
  calls: number;
  maps: number;
};

export type BranchOption = Pick<Branch, 'id' | 'name' | 'slug' | 'isMain' | 'active'>;

export type BranchManagement = Omit<Branch, 'menu'> & {
  menuId: string | null;
  hasMenu: boolean;
  publishedAt: string | null;
  stats: BranchStats;
};

export type BranchOverviewResponse = {
  branches: Array<
    Pick<Branch, 'id' | 'name' | 'slug' | 'active'> & {
      hasMenu: boolean;
      stats: BranchStats;
    }
  >;
  totals: {
    menus: number;
    items: number;
    views: number;
    scans: number;
  };
  userCount: number;
  isAdmin: boolean;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type BranchListResponse = {
  branches: Branch[];
  pagination?: PaginationMeta;
};

export type BranchOptionsResponse = {
  branches: BranchOption[];
};

export type BranchManagementResponse = {
  branches: BranchManagement[];
};

export type PublicBranch = Omit<Branch, 'menu'> & {
  menuId: string | null;
  publishedAt: string | null;
  stats: {
    categories: number;
    items: number;
  };
};

export type PublicVenue = Omit<Venue, 'branches'> & {
  branchCount: number;
  branches: PublicBranch[];
};

export type PublicVenueListResponse = {
  venues: PublicVenue[];
  pagination: PaginationMeta;
  filters: {
    search: string;
    type: string | null;
  };
};

export type PublicVenueResponse = {
  venue: PublicVenue;
  branches: PublicBranch[];
};

export type PublicBranchMenuResponse = {
  venue: Venue;
  branch: Omit<Branch, 'menu'>;
  menu: Menu | null;
};

export type PublicAnalyticsEventType =
  | 'VENUE_VIEW'
  | 'MENU_VIEW'
  | 'CATEGORY_VIEW'
  | 'QR_SCAN'
  | 'WHATSAPP_CLICK'
  | 'CALL_CLICK'
  | 'MAPS_CLICK'
  | 'ITEM_VIEW';

export type PublicAnalyticsEventInput = {
  eventType: PublicAnalyticsEventType;
  venueId: string;
  branchId?: string;
  menuId?: string;
  categoryId?: string;
  itemId?: string;
};

export type AssignedBranch = Pick<Branch, 'id' | 'name' | 'slug' | 'isMain' | 'active'>;

export type VenueUser = {
  id: string;
  venueId: string | null;
  phone: string;
  email: string | null;
  name: string | null;
  role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF';
  verified: boolean;
  branches: AssignedBranch[];
};

export type UserListResponse = {
  users: VenueUser[];
  pagination?: PaginationMeta;
};

export type MenuQrCode = {
  id: string;
  menuId: string;
  shortCode: string;
  targetUrl: string | null;
  shortUrl?: string;
  pngUrl?: string;
  svgUrl?: string;
  posterUrl?: string;
  imageUrl: string | null;
};

export type MenuAnalytics = {
  id: string;
  menuId: string;
  viewCount: number;
  qrScanCount: number;
  whatsappClicks: number;
  callClicks: number;
  mapsClicks: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: LocalizedValue;
  description: LocalizedValue | null;
  price: string | number | null;
  prices: MenuItemPrice[];
  imageUrl: string | null;
  tags: string[];
  calories: number | null;
  available: boolean;
  sortOrder: number;
};

export type MenuItemPrice = {
  id: string;
  itemId: string;
  label: string;
  price: string | number;
  sortOrder: number;
};

export type MenuCategory = {
  id: string;
  menuId: string;
  name: LocalizedValue;
  description: LocalizedValue | null;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
  items: MenuItem[];
};

export type Menu = {
  id: string;
  branchId: string;
  // name?: LocalizedValue;
  theme: 'CLASSIC' | 'MODERN' | 'MINIMAL';
  showPrices: boolean;
  publishedAt: string | null;
  categories: MenuCategory[];
  qrCode?: MenuQrCode | null;
  analytics?: MenuAnalytics | null;
};

export type ExtractionJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'APPROVED' | 'REJECTED';

export type ExtractedPrice = {
  id?: string;
  label: string;
  price: number;
  sortOrder?: number;
};

export type ExtractedItem = {
  id?: string;
  name: LocalizedText;
  description?: LocalizedText;
  price?: number;
  prices?: ExtractedPrice[];
  imageUrl?: string;
  tags: string[];
  calories?: number;
  available: boolean;
  sortOrder?: number;
};

export type ExtractedCategory = {
  id?: string;
  name: LocalizedText;
  description?: LocalizedText;
  imageUrl?: string;
  active: boolean;
  sortOrder?: number;
  items: ExtractedItem[];
};

export type ExtractedMenu = {
  menu: {
    id?: string;
    // name: LocalizedText;
    theme: 'CLASSIC' | 'MODERN' | 'MINIMAL';
    showPrices: boolean;
  };
  categories: ExtractedCategory[];
  warnings: string[];
};

export type ExtractionLimits = {
  plan: string;
  subscriptionStatus: string;
  canExtract: boolean;
  monthlyExtractions: number;
  usedThisMonth: number;
  remainingThisMonth: number;
  maxImages: number;
};

export type ExtractionJob = {
  id: string;
  menuId: string;
  branchId: string;
  venueId: string;
  requestedById: string | null;
  status: ExtractionJobStatus;
  modelProvider: string;
  modelName: string;
  imageCount: number;
  rawModelResponse: string | null;
  extractedMenu: ExtractedMenu | null;
  confidenceScore: number | null;
  warnings: string[];
  errors: string[];
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExtractionJobResponse = {
  job: ExtractionJob | null;
  limits: ExtractionLimits;
};

export type StartExtractionResponse = ExtractionJobResponse & {
  job: ExtractionJob;
  menu: Menu;
};

export type ApproveExtractionResponse = {
  job: ExtractionJob;
  menu: Menu;
};

export type Venue = {
  id: string;
  ownerId: string | null;
  type: string;
  name: LocalizedValue;
  slug: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  description: LocalizedValue | null;
  defaultLocale: string;
  supportedLocales: string[];
  timezone: string;
  currency: string;
  phone: string | null;
  whatsapp: string | null;
  address: LocalizedValue | null;
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  branches?: Branch[];
};

export type SetupVenueInput = {
  type: string;
  name: LocalizedText;
  slug: string;
  logoUrl?: string;
  coverUrl?: string;
  description?: LocalizedText;
  defaultLocale: 'ar' | 'en';
  supportedLocales: Array<'ar' | 'en'>;
  phone?: string;
  whatsapp?: string;
  address?: LocalizedText;
  googleMapsUrl?: string;
  instagramUrl?: string;
  branchName: LocalizedText;
  branchSlug: string;
};

export type ImageUploadScope = 'venue' | 'branch' | 'menu-category' | 'menu-item' | 'qr' | 'misc';

export type ImageUploadSignature = {
  provider: 'cloudinary';
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  maxBytes: number;
};

export type UpdateVenueInput = Partial<
  Pick<
    SetupVenueInput,
    | 'type'
    | 'name'
    | 'description'
    | 'defaultLocale'
    | 'supportedLocales'
    | 'logoUrl'
    | 'coverUrl'
    | 'phone'
    | 'whatsapp'
    | 'address'
    | 'googleMapsUrl'
    | 'instagramUrl'
  >
>;

export type ListQueryOptions = {
  paginate?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  view?: 'full' | 'options' | 'management';
};

export type BranchQrResponse = {
  branch: Pick<Branch, 'id' | 'name' | 'slug' | 'phone' | 'logoUrl'> & { venueSlug: string | null };
  venue?: Pick<Venue, 'id' | 'name' | 'slug' | 'logoUrl'>;
  menu: Pick<Menu, 'id' | 'publishedAt' | 'qrCode' | 'analytics'> | null;
  publicMenuUrl?: string;
  previewDataUrl?: string;
  generatedAt?: string;
};

export type AnalyticsSummary = {
  period: '7d' | '30d';
  branchId: string | null;
  metrics: Record<
    'venueViews' | 'views' | 'categoryViews' | 'itemViews' | 'scans' | 'whatsapp' | 'calls' | 'maps',
    {
      current: number;
      previous: number;
      change: number;
    }
  >;
  series: Array<{ label: string; views: number; scans: number }>;
  branchActivity: Array<{ branchId: string; name: LocalizedValue; slug: string; value: number }>;
  topItems: Array<{ itemId: string; name: LocalizedValue | null; views: number }>;
};

export type CreateBranchInput = {
  name: LocalizedText;
  slug: string;
  active?: boolean;
  logoUrl?: string;
  coverUrl?: string;
  phone?: string;
  whatsapp?: string;
  address?: LocalizedText;
  googleMapsUrl?: string;
  instagramUrl?: string;
  openingHours?: OpeningHours;
};

export type UpdateBranchInput = Partial<CreateBranchInput>;

export type CreateMenuInput = {
  theme?: 'CLASSIC' | 'MODERN' | 'MINIMAL';
  showPrices?: boolean;
};

export type UpdateMenuInput = Partial<CreateMenuInput>;

export type CreateCategoryInput = {
  name: LocalizedText;
  description?: LocalizedText;
  imageUrl?: string;
  active?: boolean;
};

export type CreateItemInput = {
  name: LocalizedText;
  description?: LocalizedText;
  price?: number;
  prices?: Array<{
    label: string;
    price: number;
    sortOrder?: number;
  }>;
  imageUrl?: string;
  calories?: number;
  available?: boolean;
  tags?: string[];
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type UpdateItemInput = Partial<CreateItemInput>;

export type CreateVenueUserInput = {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: 'MANAGER' | 'STAFF';
  branchIds: string[];
};

export type UpdateUserBranchesInput = {
  branchIds: string[];
};

export type MenuPlanCode = 'FREE' | 'MENU_STARTER' | 'MENU_PRO' | 'MENU_MULTI_BRANCH' | 'WASLA_COMPLETE';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export type PlanFeature = {
  id: string;
  key: string;
  name: LocalizedValue;
  description: LocalizedValue | null;
  valueType: 'BOOLEAN' | 'NUMBER' | 'TEXT' | 'JSON' | string;
  unit: string | null;
  displayOrder: number;
  active: boolean;
};

export type PlanFeatureMapping = {
  id: string;
  planId: string;
  featureId: string;
  enabled: boolean;
  valueInt: number | null;
  valueBool: boolean | null;
  valueString: string | null;
  valueJson: unknown;
  feature: PlanFeature;
};

export type Plan = {
  id: string;
  code: MenuPlanCode;
  publicName: LocalizedValue;
  internalName: string;
  description: LocalizedValue | null;
  priceAnnualEgp: number | null;
  displayOrder: number;
  active: boolean;
  comingSoon: boolean;
  featureMappings: PlanFeatureMapping[];
  upgradeUrl?: string;
};

export type TenantSubscriptionResponse = {
  canManageBilling: boolean;
  subscription: {
    id: string;
    venueId: string;
    plan: MenuPlanCode;
    status: SubscriptionStatus;
    paymentProvider: 'MANUAL' | 'PAYMOB';
    currentPeriodEnds: string | null;
    limits: {
      branches: number | null;
      unlimitedBranches: boolean;
      monthlyExtractions: number | null;
      unlimitedExtractions: boolean;
      imagesPerExtraction: number;
      analyticsHistoryDays: number | null;
      allTimeAnalytics: boolean;
      staffUsers: number | null;
      unlimitedStaffUsers: boolean;
      languages: number | null;
      unlimitedLanguages: boolean;
      advancedAnalytics: boolean;
      qrBranding: string;
      customQrAssets: boolean;
    };
  };
  usage: {
    branches: number;
    users: number;
    extractionsThisMonth: number;
    languages: number;
  };
  plans: Plan[];
  features: PlanFeature[];
};

export type AdminSubscriptionOverview = {
  metrics: {
    venues: number;
    subscriptions: number;
    activeRevenueAnnualEgp: number;
    totalRevenueAnnualEgp: number;
    paidSubscriptions: number;
    pastDue: number;
  };
  expiringSoon: Array<{
    id: string;
    plan: MenuPlanCode;
    status: SubscriptionStatus;
    currentPeriodEnds: string | null;
    venue: Venue;
    planRecord: Plan;
  }>;
};

export type AdminVenueSubscriptionRow = Venue & {
  subscription: ({ planRecord: Plan } & TenantSubscriptionResponse['subscription']) | null;
  _count: {
    branches: number;
    users: number;
  };
};

export type AdminVenuesResponse = {
  venues: AdminVenueSubscriptionRow[];
};

export type UpdateVenueSubscriptionInput = {
  plan: MenuPlanCode;
  status: SubscriptionStatus;
  currentPeriodEnds?: string | null;
  paymentProvider?: 'MANUAL' | 'PAYMOB';
  notes?: string | null;
  recreate?: boolean;
};

export type UpdatePlanInput = {
  code?: MenuPlanCode;
  publicName?: LocalizedText;
  internalName?: string;
  description?: {
    en?: string;
    ar?: string;
  };
  priceAnnualEgp?: number | null;
  displayOrder?: number;
  active?: boolean;
  comingSoon?: boolean;
};

export type CreatePlanFeatureMappingInput = {
  planId: string;
  featureId: string;
  enabled?: boolean;
  valueInt?: number | null;
  valueBool?: boolean | null;
  valueString?: string | null;
  valueJson?: unknown;
};

export type UpdatePlanFeatureMappingInput = Omit<
  Partial<CreatePlanFeatureMappingInput>,
  'planId' | 'featureId'
>;

export type AdminPlansResponse = {
  plans: Plan[];
};

export type AdminFeaturesResponse = {
  features: PlanFeature[];
};
