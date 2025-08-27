import type { Schema, Struct } from '@strapi/strapi';

export interface MerchantFaq extends Struct.ComponentSchema {
  collectionName: 'components_merchant_faqs';
  info: {
    description: 'Frequently Asked Question';
    displayName: 'FAQ';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageContactInfo extends Struct.ComponentSchema {
  collectionName: 'components_page_contact_infos';
  info: {
    description: 'Contact information for contact pages';
    displayName: 'Contact Info';
  };
  attributes: {
    address: Schema.Attribute.Text;
    business_hours: Schema.Attribute.Text;
    company_name: Schema.Attribute.String;
    email: Schema.Attribute.Email;
    map_embed: Schema.Attribute.Text;
    phone: Schema.Attribute.String;
    website: Schema.Attribute.String;
  };
}

export interface PageFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_page_faq_items';
  info: {
    description: 'FAQ item for FAQ pages';
    displayName: 'FAQ Item';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    category: Schema.Attribute.String;
    is_featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    question: Schema.Attribute.String & Schema.Attribute.Required;
    sort_order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface PageSocialLinks extends Struct.ComponentSchema {
  collectionName: 'components_page_social_links';
  info: {
    description: 'Social media links for pages';
    displayName: 'Social Links';
  };
  attributes: {
    display_name: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images'>;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    platform: Schema.Attribute.Enumeration<
      [
        'facebook',
        'twitter',
        'instagram',
        'linkedin',
        'youtube',
        'tiktok',
        'line',
        'wechat',
        'telegram',
        'discord',
        'other',
      ]
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PageTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_page_team_members';
  info: {
    description: 'Team member information for about pages';
    displayName: 'Team Member';
  };
  attributes: {
    bio: Schema.Attribute.Text;
    email: Schema.Attribute.Email;
    is_featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    linkedin: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    photo: Schema.Attribute.Media<'images'>;
    position: Schema.Attribute.String;
    twitter: Schema.Attribute.String;
  };
}

export interface RatingRatingStats extends Struct.ComponentSchema {
  collectionName: 'components_rating_rating_stats';
  info: {
    description: 'Rating statistics for coupons';
    displayName: 'Rating Stats';
  };
  attributes: {
    last_rating_at: Schema.Attribute.DateTime;
    success_rate: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    thumbs_down: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    thumbs_up: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    total_ratings: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface SocialApiCredentials extends Struct.ComponentSchema {
  collectionName: 'components_social_api_credentials';
  info: {
    description: 'API credentials for social media platforms (encrypted)';
    displayName: 'API Credentials';
  };
  attributes: {
    access_token: Schema.Attribute.String;
    api_key: Schema.Attribute.String;
    api_secret: Schema.Attribute.String;
    expires_at: Schema.Attribute.DateTime;
    is_valid: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    last_verified: Schema.Attribute.DateTime;
    refresh_token: Schema.Attribute.String;
  };
}

export interface SocialEngagementMetrics extends Struct.ComponentSchema {
  collectionName: 'components_social_engagement_metrics';
  info: {
    description: 'Recent engagement metrics for social media accounts';
    displayName: 'Engagement Metrics';
  };
  attributes: {
    clicks: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    comments: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    engagement_rate: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    impressions: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    likes: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    notes: Schema.Attribute.Text;
    reach: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    shares: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface SocialPostingSchedule extends Struct.ComponentSchema {
  collectionName: 'components_social_posting_schedules';
  info: {
    description: 'Optimal posting times for social media platforms';
    displayName: 'Posting Schedule';
  };
  attributes: {
    day_of_week: Schema.Attribute.Enumeration<
      [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]
    > &
      Schema.Attribute.Required;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    time_slots: Schema.Attribute.Component<'social.time-slot', true>;
  };
}

export interface SocialTimeSlot extends Struct.ComponentSchema {
  collectionName: 'components_social_time_slots';
  info: {
    description: 'Specific time slot for posting';
    displayName: 'Time Slot';
  };
  attributes: {
    end_time: Schema.Attribute.Time & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    priority: Schema.Attribute.Enumeration<['low', 'medium', 'high']> &
      Schema.Attribute.DefaultTo<'medium'>;
    start_time: Schema.Attribute.Time & Schema.Attribute.Required;
  };
}

export interface TopicTopicCoupon extends Struct.ComponentSchema {
  collectionName: 'components_topic_topic_coupons';
  info: {
    displayName: 'topic_coupon';
  };
  attributes: {
    coupon: Schema.Attribute.Relation<'oneToOne', 'api::coupon.coupon'>;
  };
}

export interface TopicTopicMerchant extends Struct.ComponentSchema {
  collectionName: 'components_topic_topic_merchants';
  info: {
    displayName: 'topic_merchant';
  };
  attributes: {
    merchant: Schema.Attribute.Relation<'oneToOne', 'api::merchant.merchant'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'merchant.faq': MerchantFaq;
      'page.contact-info': PageContactInfo;
      'page.faq-item': PageFaqItem;
      'page.social-links': PageSocialLinks;
      'page.team-member': PageTeamMember;
      'rating.rating-stats': RatingRatingStats;
      'social.api-credentials': SocialApiCredentials;
      'social.engagement-metrics': SocialEngagementMetrics;
      'social.posting-schedule': SocialPostingSchedule;
      'social.time-slot': SocialTimeSlot;
      'topic.topic-coupon': TopicTopicCoupon;
      'topic.topic-merchant': TopicTopicMerchant;
    }
  }
}
