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
      'rating.rating-stats': RatingRatingStats;
      'topic.topic-coupon': TopicTopicCoupon;
      'topic.topic-merchant': TopicTopicMerchant;
    }
  }
}
