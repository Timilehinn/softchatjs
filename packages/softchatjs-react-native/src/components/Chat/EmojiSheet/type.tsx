export type Emoticon = {
  type: string;
  id: string;
  url: string;
  slug: string;
  bitly_gif_url: string;
  bitly_url: string;
  embed_url: string;
  username: string;
  source: string;
  title: string;
  rating: string;
  content_url: string;
  source_tld: string;
  source_post_url: string;
  is_sticker: number;
  import_datetime: string;
  trending_datetime: string;
  images: {
    hd: {
      height: string;
      mp4: string;
      mp4_size: string;
      width: string;
    };
    fixed_width_still: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    fixed_height_downsampled: {
      height: string;
      size: string;
      url: string;
      webp: string;
      webp_size: string;
      width: string;
    };
    preview_gif: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    preview: {
      height: string;
      mp4: string;
      mp4_size: string;
      width: string;
    };
    fixed_height_small: {
      height: string;
      mp4: string;
      mp4_size: string;
      size: string;
      url: string;
      webp: string;
      webp_size: string;
      width: string;
    };
    downsized: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    fixed_width_downsampled: {
      height: string;
      size: string;
      url: string;
      webp: string;
      webp_size: string;
      width: string;
    };
    fixed_width: {
      height: string;
      mp4: string;
      mp4_size: string;
      size: string;
      url: string;
      webp: string;
      webp_size: string;
      width: string;
    };
    downsized_still: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    downsized_medium: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    original_mp4: {
      height: string;
      mp4: string;
      mp4_size: string;
      width: string;
    };
    downsized_large: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    preview_webp: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    original: {
      frames: string;
      hash: string;
      height: string;
      mp4: string;
      mp4_size: string;
      size: string;
      url: string;
      webp: string;
      webp_size: string;
      width: string;
    };
    original_still: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    fixed_height_small_still: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    fixed_width_small: {
      height: string;
      mp4: string;
      mp4_size: string;
      size: string;
      url: string;
      webp: string;
      webp_size: string;
      width: string;
    };
    looping: {
      mp4: string;
      mp4_size: string;
    };
    downsized_small: {
      height: string;
      mp4: string;
      mp4_size: string;
      width: string;
    };
    fixed_width_small_still: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    fixed_height_still: {
      height: string;
      size: string;
      url: string;
      width: string;
    };
    fixed_height: {
      height: string;
      mp4: string;
      mp4_size: string;
      size: string;
      url: string;
      webp: string;
      webp_size: string;
      width: string;
    };
    "480w_still": {
      height: string;
      size: string;
      url: string;
      width: string;
    };
  };
  user: {
    avatar_url: string;
    banner_image: string;
    banner_url: string;
    profile_url: string;
    username: string;
    display_name: string;
    description: string;
    is_verified: boolean;
    website_url: string;
    instagram_url: string;
  }
  analytics_response_payload: string;
  analytics: {
    onload: {
      url: string;
    };
    onclick: {
      url: string;
    };
    onsent: {
      url: string;
    };
  };
}
