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
  role: 'OWNER' | 'MANAGER' | 'STAFF';
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

export type ListQueryOptions = {
  paginate?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  view?: 'full' | 'options' | 'management';
};

export type BranchQrResponse = {
  branch: Pick<Branch, 'id' | 'name' | 'slug' | 'phone'> & { venueSlug: string | null };
  menu: Pick<Menu, 'id' | 'publishedAt' | 'qrCode' | 'analytics'> | null;
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
