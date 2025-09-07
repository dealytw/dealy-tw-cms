import type { Schema, Struct } from '@strapi/strapi';

export interface HomepageHomeCategorySection extends Struct.ComponentSchema {
  collectionName: 'components_homepage_home_category_sections';
  info: {
    displayName: 'home.category-section';
  };
  attributes: {
    heading: Schema.Attribute.String;
    topics: Schema.Attribute.Relation<'oneToMany', 'api::topic.topic'>;
  };
}

export interface HomepageHomeCouponSection extends Struct.ComponentSchema {
  collectionName: 'components_homepage_home_coupon_sections';
  info: {
    displayName: 'home.coupon-section';
  };
  attributes: {
    heading: Schema.Attribute.String;
    merchants: Schema.Attribute.Relation<'oneToMany', 'api::merchant.merchant'>;
  };
}

export interface HomepageHomeHero extends Struct.ComponentSchema {
  collectionName: 'components_homepage_home_heroes';
  info: {
    displayName: 'home.hero';
  };
  attributes: {
    background: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    showSearch: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface HomepageHomeShopAndCatRef extends Struct.ComponentSchema {
  collectionName: 'components_homepage_home_shop_and_cat_refs';
  info: {
    displayName: 'home.shop&cat-ref';
  };
  attributes: {
    categories: Schema.Attribute.Relation<
      'oneToMany',
      'api::category.category'
    >;
    merchants: Schema.Attribute.Relation<'oneToMany', 'api::merchant.merchant'>;
  };
}

export interface HomepageHomeStoreSection extends Struct.ComponentSchema {
  collectionName: 'components_homepage_home_store_sections';
  info: {
    displayName: 'home.store-section';
  };
  attributes: {
    heading: Schema.Attribute.String;
    merchants: Schema.Attribute.Relation<'oneToMany', 'api::merchant.merchant'>;
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
      'homepage.home-category-section': HomepageHomeCategorySection;
      'homepage.home-coupon-section': HomepageHomeCouponSection;
      'homepage.home-hero': HomepageHomeHero;
      'homepage.home-shop-and-cat-ref': HomepageHomeShopAndCatRef;
      'homepage.home-store-section': HomepageHomeStoreSection;
      'topic.topic-coupon': TopicTopicCoupon;
      'topic.topic-merchant': TopicTopicMerchant;
    }
  }
}
