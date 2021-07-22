module "web_app" {
  source                   = "./tf-ecs-services"
  cluster_name             = var.clusters[var.env]
  container_port           = var.web_app_container_port
  host_port                = var.web_app_host_port
  service_name             = local.service_name
  desired_count            = var.api_desired_count[var.env]
  autoscaling_min_capacity = var.api_autoscaling_min_capacity[var.env]
  autoscaling_max_capacity = var.api_autoscaling_max_capacity[var.env]
  container_definition     = data.template_file.web_app_container.rendered
  internal                 = "false"
  alb_subnets              = data.terraform_remote_state.vpc.outputs.apps_public_subnets
  alb_idle_timeout         = var.api_alb_idle_timeout
  vpc_id                   = data.terraform_remote_state.vpc.outputs.apps_vpc_id
  ssl_certificate_id       = data.aws_acm_certificate.splat_gaia_com.arn
  health_check_path        = "/server-status"

  #Target group health hosts CloudWatch configurations.

  metric_name         = var.web_app_monitor_metric_name
  period              = var.web_app_monitor_period
  evaluation_periods  = var.web_app_monitor_evaluation_periods
  threshold           = var.web_app_monitor_threshold
  comparison_operator = var.web_app_monitor_comparison_operator
  statistic           = var.web_app_monitor_statistic
  notification        = var.web_app_monitor_notification
  env                 = var.env

  gaia_authorization_header = var.gaia_authorization_header

  nat_gateway_ips = concat(
    data.terraform_remote_state.vpc.outputs.apps_nat_gateway_public_ip,
    data.terraform_remote_state.pci.outputs.ecs_nat_gateway_public_ip,
  )
}

data "template_file" "web_app_container" {
  template = file("${path.module}/container-definition.json")

  vars = {
    env                = var.env
    service_name       = local.service_name
    docker_image       = "${var.docker_repo_url}/webapp:${var.service_version}"
    cpu_units          = var.web_app_cpu_units[var.env]
    memory_reservation = var.web_app_memory_reservation[var.env]
    host_port          = var.web_app_host_port
    container_port     = var.web_app_container_port
    region             = var.region
    // Server must not close keepalive connections before load balancer is ready.
    // Set to 5 seconds longer than load balancer timeout.
    server_keepalive_timeout = 1000 * var.api_alb_idle_timeout + 5000
    // web app variables
    node_path                                               = var.web_app_node_path
    web_app_new_relic_license_key                           = var.web_app_new_relic_license_key[var.env]
    web_app_new_relic_app_name                              = var.web_app_new_relic_app_name[var.env]
    web_app_admin_cms_url                                   = var.web_app_admin_cms_url[var.env]
    web_app_admin_app_url                                   = var.web_app_admin_app_url[var.env]
    web_app_admin_app_cms_enabled                           = var.web_app_admin_app_cms_enabled[var.env]
    web_app_billing_iframe_origin                           = var.web_app_billing_iframe_origin[var.env]
    web_app_zuora_iframe_credit_card_page_id                = var.web_app_zuora_iframe_credit_card_page_id[var.env]
    web_app_zuora_iframe_url                                = var.web_app_zuora_iframe_url[var.env]
    web_app_share_content_id_missing_links                  = var.web_app_share_content_id_missing_links[var.env]
    web_app_share_content_id_nuevo                          = var.web_app_share_content_id_nuevo[var.env]
    web_app_share_content_id_transcendence                  = var.web_app_share_content_id_transcendence[var.env]
    web_app_share_content_id_gods_were_astronauts           = var.web_app_share_content_id_gods_were_astronauts[var.env]
    web_app_share_content_id_leclosion_du_coeur             = var.web_app_share_content_id_leclosion_du_coeur[var.env]
    web_app_share_content_id_emotion                        = var.web_app_share_content_id_emotion[var.env]
    web_app_share_content_id_ancient_civ                    = var.web_app_share_content_id_ancient_civ[var.env]
    web_app_plan_id_fourteen_day_99_cent                    = var.web_app_plan_id_fourteen_day_99_cent[var.env]
    web_app_plan_id_annual                                  = var.web_app_plan_id_annual[var.env]
    web_app_plan_id_live                                    = var.web_app_plan_id_live[var.env]
    web_app_plan_id_live_discounted                         = var.web_app_plan_id_live_discounted[var.env]
    web_app_plan_id_monthly                                 = var.web_app_plan_id_monthly[var.env]
    web_app_plan_id_three_month                             = var.web_app_plan_id_three_month[var.env]
    web_app_plan_id_one_week_free_trial_to_monthly          = var.web_app_plan_id_one_week_free_trial_to_monthly[var.env]
    web_app_plan_id_one_week_free_trial_to_annual           = var.web_app_plan_id_one_week_free_trial_to_annual[var.env]
    web_app_plan_id_comp                                    = var.web_app_plan_id_comp[var.env]
    web_app_plan_id_legacy_monthly                          = var.web_app_plan_id_legacy_monthly[var.env]
    web_app_plan_id_legacy_annual                           = var.web_app_plan_id_legacy_annual[var.env]
    web_app_plan_id_buy_one_get_one_free                    = var.web_app_plan_id_buy_one_get_one_free[var.env]
    web_app_plan_id_buy_two_get_two_free                    = var.web_app_plan_id_buy_two_get_two_free[var.env]
    web_app_plan_id_free_trial                              = var.web_app_plan_id_free_trial[var.env]
    web_app_plan_id_one_dollar_thirty_day_to_monthly        = var.web_app_plan_id_one_dollar_thirty_day_to_monthly[var.env]
    web_app_plan_id_one_month_trial_to_annual               = var.web_app_plan_id_one_month_trial_to_annual[var.env]
    web_app_plan_id_four_month_gift                         = var.web_app_plan_id_four_month_gift[var.env]
    web_app_plan_id_annual_gift                             = var.web_app_plan_id_annual_gift[var.env]
    web_app_plan_id_live_gift                               = var.web_app_plan_id_live_gift[var.env]
    web_app_plan_id_summit_monthly                          = var.web_app_plan_id_summit_monthly[var.env]
    web_app_plan_id_summit_annual                           = var.web_app_plan_id_summit_annual[var.env]
    web_app_render_concurrency                              = var.web_app_render_concurrency[var.env]
    web_app_robots_can_index                                = var.web_app_robots_can_index[var.env]
    web_app_robots_no_index_header                          = var.web_app_robots_no_index_header[var.env]
    web_app_servers_brooklyn                                = var.web_app_servers_brooklyn[var.env]
    web_app_servers_brooklyn_internal                       = var.web_app_servers_brooklyn_internal[var.env]
    web_app_servers_video_analytics                         = var.web_app_servers_video_analytics[var.env]
    web_app_servers_auth                                    = var.web_app_servers_auth[var.env]
    web_app_servers_testarossa                              = var.web_app_servers_testarossa[var.env]
    web_app_logger_name                                     = var.web_app_logger_name[var.env]
    web_app_logger_stream_name                              = var.web_app_logger_stream_name[var.env]
    web_app_logger_group                                    = var.web_app_logger_group[var.env]
    web_app_origin                                          = var.web_app_origin[var.env]
    web_app_user_account_hostname                           = var.web_app_user_account_hostname[var.env]
    web_app_youbora_account_code                            = var.web_app_youbora_account_code[var.env]
    web_app_services_member_home_path                       = var.web_app_services_member_home_path[var.env]
    web_app_features_comments                               = var.web_app_features_comments[var.env]
    web_app_features_community_v2                           = var.web_app_features_community_v2[var.env]
    web_app_features_disable_impression_cap                 = var.web_app_features_disable_impression_cap[var.env]
    web_app_features_filters_fitness                        = var.web_app_features_filters_fitness[var.env]
    web_app_features_filters_original                       = var.web_app_features_filters_original[var.env]
    web_app_features_filters_conscious                      = var.web_app_features_filters_conscious[var.env]
    web_app_features_gift_checkout                          = var.web_app_features_gift_checkout[var.env]
    web_app_features_marketing_proxy_anonymous_home         = var.web_app_features_marketing_proxy_anonymous_home[var.env]
    web_app_features_marketing_special_offer_promo_popup    = var.web_app_features_marketing_special_offer_promo_popup[var.env]
    web_app_features_multiple_playlists                     = var.web_app_features_multiple_playlists[var.env]
    web_app_features_share_view                             = var.web_app_features_share_view[var.env]
    web_app_features_share_v3                               = var.web_app_features_share_v3[var.env]
    web_app_features_profit_well_retain                     = var.web_app_features_profit_well_retain[var.env]
    web_app_features_checkout_paypal                        = var.web_app_features_checkout_paypal[var.env]
    web_app_features_checkout_paypal_currencies             = var.web_app_features_checkout_paypal_currencies[var.env]
    web_app_features_detail_page_v2                         = var.web_app_features_detail_page_v2[var.env]
    web_app_features_development_kitchen_sink               = var.web_app_features_development_kitchen_sink[var.env]
    web_app_features_email_capture                          = var.web_app_features_email_capture[var.env]
    web_app_features_amp_articles                           = var.web_app_features_amp_articles[var.env]
    web_app_features_hapyak                                 = var.web_app_features_hapyak[var.env]
    web_app_features_smartling                              = var.web_app_features_smartling[var.env]
    web_app_features_player_detect_lang                     = var.web_app_features_player_detect_lang[var.env]
    web_app_features_player_gated_previews                  = var.web_app_features_player_gated_previews[var.env]
    web_app_features_language_select_dialog                 = var.web_app_features_language_select_dialog[var.env]
    web_app_features_language_select_globe_anonymous        = var.web_app_features_language_select_globe_anonymous[var.env]
    web_app_features_language_select                        = var.web_app_features_language_select[var.env]
    web_app_features_language_select_anonymous              = var.web_app_features_language_select_anonymous[var.env]
    web_app_features_language_select_fr                     = var.web_app_features_language_select_fr[var.env]
    web_app_features_language_select_de                     = var.web_app_features_language_select_de[var.env]
    web_app_features_apiclient_omit_language                = var.web_app_features_apiclient_omit_language[var.env]
    web_app_features_zendesk_chat                           = var.web_app_features_zendesk_chat[var.env]
    web_app_features_user_language_es_zendesk_help_link     = var.web_app_features_user_language_es_zendesk_help_link[var.env]
    web_app_features_anonymous_user_data_privacy_compliance = var.web_app_features_anonymous_user_data_privacy_compliance[var.env]
    web_app_user_account_fmtv_migration_date                = var.web_app_user_account_fmtv_migration_date[var.env]
    web_app_features_user_account_account_pause             = var.web_app_features_user_account_account_pause[var.env]
    web_app_features_user_account_cancel_offer              = var.web_app_features_user_account_cancel_offer[var.env]
    web_app_features_user_account_decline_plan_303          = var.web_app_features_user_account_decline_plan_303[var.env]
    web_app_features_user_account_cancel_v2                 = var.web_app_features_user_account_cancel_v2[var.env]
    web_app_features_user_account_change_plan_v2            = var.web_app_features_user_account_change_plan_v2[var.env]
    web_app_features_skunk_150_related_series_nids          = var.web_app_features_skunk_150_related_series_nids[var.env]
    web_app_gtm_id                                          = var.web_app_gtm_id[var.env]
    web_app_emarsys_testmode                                = var.web_app_emarsys_testmode[var.env]
    web_app_emarsys_testmode_user_id                        = var.web_app_emarsys_testmode_user_id[var.env]
    web_app_emarsys_testmode_user_email                     = var.web_app_emarsys_testmode_user_email[var.env]
    web_app_amp_gtm_id                                      = var.web_app_amp_gtm_id[var.env]
    web_app_app_cache_max_age                               = var.web_app_app_cache_max_age[var.env]
    web_app_google_recaptcha_site_key                       = var.web_app_google_recaptcha_site_key[var.env]
    web_app_google_recaptcha_secret_key                     = var.web_app_google_recaptcha_secret_key[var.env]
    web_app_google_recaptcha_api_url                        = var.web_app_google_recaptcha_api_url[var.env]
    web_app_google_recaptcha_threshold                      = var.web_app_google_recaptcha_threshold[var.env]
    web_app_profitwell_api_key                              = var.web_app_profitwell_api_key[var.env]
    web_app_redirect_https                                  = var.web_app_redirect_https[var.env]
    web_app_redirect_hostname                               = var.web_app_redirect_hostname[var.env]
    web_app_app_maintenance_enabled                         = var.web_app_app_maintenance_enabled[var.env]
    web_app_app_maintenance_max_age                         = var.web_app_app_maintenance_max_age[var.env]
    web_app_brightcove_player                               = var.web_app_brightcove_player[var.env]
    web_app_log_level                                       = var.web_app_log_level[var.env]
    web_app_log_level_server                                = var.web_app_log_level_server[var.env]
    web_app_log_std_out_enabled                             = var.web_app_log_std_out_enabled[var.env]
    web_app_features_show_user_portal_search_results        = var.web_app_features_show_user_portal_search_results[var.env]
    web_app_log_std_out_server_enabled                      = var.web_app_log_std_out_server_enabled[var.env]
    web_app_marketing_layer_url                             = var.web_app_marketing_layer_url[var.env]
    web_app_facebook_login_app_id                           = var.web_app_facebook_login_app_id[var.env]
    debug_show_username                                     = var.debug_show_username[var.env]
    cloudfront_distribution_id                              = aws_cloudfront_distribution.web_app.id
    web_app_live_access_video_player                        = var.web_app_live_access_video_player[var.env]
    recipes_category_term_id                                = var.recipes_category_term_id[var.env]
    web_app_recommended_practices_term_blacklist            = var.web_app_recommended_practices_term_blacklist[var.env]
    web_app_film_filters_enabled                            = var.web_app_film_filters_enabled[var.env]
    web_app_guides_enabled                                  = var.web_app_guides_enabled[var.env]
    web_app_zendesk_chat_on_checkout_enabled                = var.web_app_zendesk_chat_on_checkout_enabled[var.env]
    web_app_service_unavailable                             = var.web_app_service_unavailable[var.env]
    web_app_anonymous_uuid_secret                           = var.web_app_anonymous_uuid_secret[var.env]
  }
}

resource "aws_cloudfront_distribution" "web_app" {
  origin {
    domain_name = module.web_app.dns_name
    origin_id   = "${local.service_name}-${var.clusters[var.env]}"

    custom_header {
      name  = "Cloudfront-Authorization"
      value = var.gaia_authorization_header
    }

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "match-viewer"
      origin_ssl_protocols     = ["TLSv1.2", "TLSv1.1", "TLSv1"]
      origin_keepalive_timeout = var.api_alb_idle_timeout - 5
    }
  }

  // Assets S3 Bucket
  origin {
    domain_name = var.web_app_assets_s3_bucket_domain_name
    origin_id   = "${local.service_name}-${var.clusters[var.env]}-assets"
  }

  origin {
    domain_name = aws_s3_bucket.web_app_bucket.bucket_regional_domain_name
    origin_id   = "${local.service_name}-${var.clusters[var.env]}-s3"
  }

  // Marketing Layer Wordpress instance
  origin {
    domain_name = var.web_app_marketing_layer_domain_name[var.env]
    origin_id   = "${local.service_name}-${var.clusters[var.env]}-marketing-layer"

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "match-viewer"
      origin_ssl_protocols     = ["TLSv1.2", "TLSv1.1", "TLSv1"]
      origin_keepalive_timeout = var.api_alb_idle_timeout - 5
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  web_acl_id      = var.web_acl_id[var.env]
  comment         = "For ${local.service_name}-${var.env}"

  // Enable logging for WAF
  logging_config {
    include_cookies = false
    bucket          = data.terraform_remote_state.apps.outputs.waf_bucket_domain_name
  }

  // The nested template helps to return a list
  aliases = split(",", var.web_app_hostnames[var.env])

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "${local.service_name}-${var.clusters[var.env]}"
    compress         = true

    forwarded_values {
      query_string = true

      headers = [
        "Accept",
        "Authorization",
        "Cloudfront-Forwarded-Proto",
        "Origin",
        "Host",
        "Range",
        "X-XSRF-Token",
      ]

      cookies {
        forward           = "whitelist"
        whitelisted_names = ["auth", "_csrf", "wordpress_logged_in_*", "wordpress_test_cookie", "wp-settings-*", "wordpress_sec_*"]
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = "0"
    default_ttl            = "86400"
    max_ttl                = "31536000"
  }

  ordered_cache_behavior {
    path_pattern     = "/v1/billing/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "${local.service_name}-${var.clusters[var.env]}"
    compress         = true

    forwarded_values {
      query_string = true

      headers = [
        "Accept",
        "Accept-Language",
        "Authorization",
        "Cloudfront-Forwarded-Proto",
        "CloudFront-Viewer-Country",
        "Host",
        "Origin",
        "Referer",
        "User-Agent",
        "X-XSRF-Token",
      ]

      cookies {
        forward           = "whitelist"
        whitelisted_names = ["idToken", "_csrf"]
      }
    }

    viewer_protocol_policy = "https-only"
    min_ttl                = "0"
    default_ttl            = "86400"
    max_ttl                = "31536000"
  }

  # Cache behavior with precedence 0 for statis assets i.e. js, css, images
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "${local.service_name}-${var.clusters[var.env]}-assets"
    compress         = true

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = "31536000"
    default_ttl            = "31536000"
    max_ttl                = "31536000"
  }

  ordered_cache_behavior {
    path_pattern     = "/files/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "${local.service_name}-${var.clusters[var.env]}-s3"
    compress         = true

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = "31536000"
    default_ttl            = "31536000"
    max_ttl                = "31536000"
  }

  ordered_cache_behavior {
    path_pattern     = "/v1/anonymous"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "${local.service_name}-${var.clusters[var.env]}"
    compress         = true

    forwarded_values {
      query_string = false

      headers = [
        "Accept",
        "Authorization",
        "Cloudfront-Forwarded-Proto",
        "X-XSRF-Token",
        "Origin",
        "Range",
        "Host",
      ]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = "0"
    default_ttl            = "86400"
    max_ttl                = "31536000"
  }

  custom_error_response {
    error_caching_min_ttl = "0"
    error_code            = "400"
  }

  custom_error_response {
    error_caching_min_ttl = "0"
    error_code            = "403"
  }

  custom_error_response {
    error_caching_min_ttl = "0"
    error_code            = "404"
  }

  custom_error_response {
    error_caching_min_ttl = "0"
    error_code            = "500"
  }

  custom_error_response {
    error_caching_min_ttl = "0"
    error_code            = "501"
  }

  price_class = var.env == "production" ? "PriceClass_All" : "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Service     = local.service_name
    Environment = var.env
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = data.aws_acm_certificate.us_east_1_splat_gaia_com.arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.1_2016"
  }
}

resource "aws_iam_role_policy_attachment" "web_app_api" {
  role       = module.web_app.task_role_id
  policy_arn = aws_iam_policy.web_app.arn
}

resource "aws_iam_policy" "web_app" {
  name   = "${local.service_name}-${var.region}"
  policy = data.aws_iam_policy_document.web_app.json
}

data "aws_iam_policy_document" "web_app" {
  statement {
    actions = [
      "cloudfront:CreateInvalidation",
    ]

    effect    = "Allow"
    resources = ["*"]
  }
}

resource "aws_iam_role_policy_attachment" "web_app" {
  role       = module.web_app.task_role_id
  policy_arn = aws_iam_policy.web_app.arn
}

