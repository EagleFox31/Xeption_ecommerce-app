/**
 * Marketing Banner Entity
 * Represents a promotional banner with localized content for Cameroon (237)
 */
export class MarketingBanner {
  id: string;
  title_237: string; // Localized title for Cameroon
  description_237?: string; // Optional localized description
  image_url: string;
  cta_url?: string; // Call-to-action URL (redirect link)
  category_id?: string; // Optional category association
  priority: number; // Display priority (higher = more important)
  start_date: Date;
  end_date: Date;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string; // Admin user ID

  constructor(data: Partial<MarketingBanner>) {
    Object.assign(this, data);
  }

  /**
   * Check if banner is currently valid for display
   */
  isCurrentlyActive(): boolean {
    const now = new Date();
    return this.active && this.start_date <= now && this.end_date >= now;
  }

  /**
   * Check if banner has expired
   */
  isExpired(): boolean {
    return new Date() > this.end_date;
  }
}
