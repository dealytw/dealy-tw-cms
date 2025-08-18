import type { Schema, Struct } from '@strapi/strapi';

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
      'topic.topic-coupon': TopicTopicCoupon;
      'topic.topic-merchant': TopicTopicMerchant;
    }
  }
}
