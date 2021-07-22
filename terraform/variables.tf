variable "env" {
  type        = string
  description = "environment name"
}

variable "region" {
  type        = string
  description = "AWS region"
}

variable "service_version" {
  type        = string
  description = "service version to deploy"
}

variable "service_name" {
  default = "gaia-web-app"
}

locals {
  service_name = var.service_names[var.env]
}

variable "service_names" {
  type = map(string)

  default = {
    production = "gaia-web-app"
    stage      = "gaia-web-app"
    dev        = "gaia-web-app"
    qa         = "gaia-web-app-qa"
  }
}

// waf web_acl_id
variable "web_acl_id" {
  type = map(string)

  default = {
    production = "9277154d-6136-401d-a1e6-45e77ce6ab05"
    stage      = "ff47d745-c62b-4f8a-9edf-2d2e0f046ac2"
    dev        = ""
    qa         = ""
  }
}

// web-app
variable "web_app_hostnames" {
  type = map(string)

  default = {
    production = "www.gaia.com,gaia.com,account.gaia.com"
    stage      = "www-stg-4b2c19.gaia.com,account-stg-4b2c19.gaia.com"
    dev        = "www-dev-ced749.gaia.com,account-dev-ced749.gaia.com"
    qa         = "webapp-design-4b2c19.gaia.com"
  }
}

variable "web_app_host_port" {
  default = 8080
}

variable "web_app_container_port" {
  default = 3000
}

variable "web_app_cpu_units" {
  type = map(string)

  default = {
    production = 256
    stage      = 64
    dev        = 64
    qa         = 64
  }

  description = "number of api containers to run in ecs service"
}

variable "web_app_memory_reservation" {
  type = map(string)

  default = {
    production = 320
    stage      = 192
    dev        = 192
    qa         = 192
  }
}

variable "web_app_node_path" {
  default = "./lib"
}

variable "web_app_new_relic_license_key" {
  type = map(string)

  default = {
    production = "c4f0618975f79f1063ce7d1fad6f6c2ac32960f7"
    stage      = "6576d7bf38013298f4e310e1f202c3da671de026"
    dev        = "9d8fc24342e5b57c97551ef8e8b256f10af3081b"
    qa         = "6576d7bf38013298f4e310e1f202c3da671de026"
  }
}

variable "web_app_new_relic_app_name" {
  type = map(string)

  default = {
    production = "web-app"
    stage      = "web-app-stage"
    dev        = "web-app-dev"
    qa         = "web-app-qa"
  }
}

variable "web_app_admin_cms_url" {
  type = map(string)

  default = {
    production = "https://d6cms.gaia.com/"
    stage      = "https://d6cms-stg-4b2c19.gaia.com/"
    dev        = "https://d6cms-dev-ced749.gaia.com/"
    qa         = "https://d6cms-stg-4b2c19.gaia.com/"
  }
}

variable "web_app_admin_app_url" {
  type = map(string)

  default = {
    production = "https://admin.gaia.com/"
    stage      = "https://admin-stage-a178d7.gaia.com/"
    dev        = ""
    qa         = ""
  }
}

variable "web_app_admin_app_cms_enabled" {
  type = map(string)

  default = {
    production = "0"
    stage      = "0"
    dev        = "0"
    qa         = "0"
  }
}

variable "web_app_servers_testarossa" {
  type = map(string)

  default = {
    production = "https://testarossa.gaia.com/"
    stage      = "https://testarossa-stage-3jd84j.gaia.com/"
    dev        = "https://testarossa-dev-3jd84j.gaia.com/"
    qa         = "https://testarossa-stage-3jd84j.gaia.com/"
  }
}

// ###VATest
variable "web_app_servers_video_analytics" {
  type = map(string)

  default = {
    production = "https://video-analytics.gaia.com/"
    stage      = "https://video-analytics-stage-3jd84j.gaia.com/"
    dev        = "https://video-analytics-dev-3jd84j.gaia.com/"
    qa         = "https://video-analytics-stage-3jd84j.gaia.com/"
  }
}

variable "web_app_servers_auth" {
  type = map(string)

  default = {
    production = "https://auth.gaia.com/"
    stage      = "https://auth-stage-ce6270.gaia.com/"
    dev        = "https://auth-dev-ce6270.gaia.com/"
    qa         = "https://auth-stage-ce6270.gaia.com/"
  }
}

variable "web_app_billing_iframe_origin" {
  type = map(string)

  default = {
    production = "https://billingapi.gaia.com"
    stage      = "https://billingapi-stage-2ks83m.gaia.com"
    dev        = "https://billingapi-dev-2ks83m.gaia.com"
    qa         = "https://billingapi-stage-2ks83m.gaia.com"
  }
}

variable "web_app_zuora_iframe_credit_card_page_id" {
  type = map(string)

  default = {
    production = "2c92a00e7129cfc30171322a84d579cc"
    stage      = "2c92c0f9712998a4017132188bc40ec7"
    dev        = ""
    qa         = "2c92c0f8712986230171322064041665"
  }
}

variable "web_app_zuora_iframe_url" {
  type = map(string)

  default = {
    production = "https://www.zuora.com/apps/PublicHostedPageLite.do"
    stage      = "https://apisandbox.zuora.com/apps/PublicHostedPageLite.do"
    dev        = ""
    qa         = "https://apisandbox.zuora.com/apps/PublicHostedPageLite.do"
  }
}

variable "web_app_share_content_id_missing_links" {
  type = map(string)

  default = {
    production = 135476
    stage      = 128571
    dev        = 128571
    qa         = 128571
  }
}

variable "web_app_share_content_id_nuevo" {
  type = map(string)

  default = {
    production = 162266
    stage      = 122681
    dev        = 122681
    qa         = 122681
  }
}

variable "web_app_share_content_id_transcendence" {
  type = map(string)

  default = {
    production = 182688
    stage      = 122681
    dev        = 122681
    qa         = 122681
  }
}

variable "web_app_share_content_id_gods_were_astronauts" {
  type = map(string)

  default = {
    production = 161456
    stage      = 138461
    dev        = 138461
    qa         = 138461
  }
}

variable "web_app_share_content_id_leclosion_du_coeur" {
  type = map(string)

  default = {
    production = 173126
    stage      = 4048
    dev        = 4048
    qa         = 4048
  }
}

variable "web_app_share_content_id_emotion" {
  type = map(string)

  default = {
    production = 117241
    stage      = 39326
    dev        = 39326
    qa         = 39326
  }
}

variable "web_app_share_content_id_ancient_civ" {
  type = map(string)

  default = {
    production = 152721
    stage      = 42496
    dev        = 42496
    qa         = 42496
  }
}

variable "web_app_plan_id_three_month" {
  type = map(string)

  default = {
    production = "2c92a00768760ab9016882b3dddf2032"
    stage      = "2c92c0f867cae0610167f0be079501c0"
    dev        = "2c92c0f867cae0610167f0be079501c0"
    qa         = "2c92c0f867cae0610167f0be079501c0"
  }
}

variable "web_app_plan_id_monthly" {
  type = map(string)

  default = {
    production = "2c92a00768760ab9016882b3ddef2037"
    stage      = "2c92c0f867cae0610167f0be07a201c5"
    dev        = "2c92c0f867cae0610167f0be07a201c5"
    qa         = "2c92c0f867cae0610167f0be07a201c5"
  }
}

variable "web_app_plan_id_annual" {
  type = map(string)

  default = {
    production = "2c92a00768760ab9016882b3ddcd202d"
    stage      = "2c92c0f867cae0610167f0be07bb01cf"
    dev        = "2c92c0f867cae0610167f0be07bb01cf"
    qa         = "2c92c0f867cae0610167f0be07bb01cf"
  }
}

variable "web_app_plan_id_live" {
  type = map(string)

  default = {
    production = "2c92a0086999aa6b0169a23232a81256"
    stage      = "2c92c0f869946bce01699d2178b1131b"
    dev        = "2c92c0f869946bce01699d2178b1131b"
    qa         = "2c92c0f869946bce01699d2178b1131b"
  }
}

variable "web_app_plan_id_live_discounted" {
  type = map(string)

  default = {
    production = "2c92a0086999aa6b0169a23389c62007"
    stage      = "2c92c0f869946bd501699d2a80305ff6"
    dev        = "2c92c0f869946bd501699d2a80305ff6"
    qa         = "2c92c0f869946bd501699d2a80305ff6"
  }
}

variable "web_app_plan_id_fourteen_day_99_cent" {
  type = map(string)

  default = {
    production = "2c92a00768760ab9016882b3dd922019"
    stage      = "2c92c0f867cae0610167f0be07ae01ca"
    dev        = "2c92c0f867cae0610167f0be07ae01ca"
    qa         = "2c92c0f867cae0610167f0be07ae01ca"
  }
}

variable "web_app_plan_id_one_week_free_trial_to_monthly" {
  type = map(string)

  default = {
    production = "2c92a0086e88115e016ea3b5b4fb1bc7"
    stage      = "2c92c0f86e875ace016e9548821c7ec3"
    dev        = "2c92c0f86e875ace016e9548821c7ec3"
    qa         = "2c92c0f86e875ace016e9548821c7ec3"
  }
}

variable "web_app_plan_id_one_week_free_trial_to_annual" {
  type = map(string)

  default = {
    production = "2c92a0076e88003e016ea3b7be973f1e"
    stage      = "2c92c0f96e876a1a016e954f530675a9"
    dev        = "2c92c0f96e876a1a016e954f530675a9"
    qa         = "2c92c0f96e876a1a016e954f530675a9"
  }
}

variable "web_app_plan_id_summit_monthly" {
  type = map(string)

  default = {
    production = "2c92a00e71c95be20171e0441d2c6ae4"
    stage      = "2c92c0f971c65e010171c778475b123f"
    dev        = "2c92c0f971c65e010171c778475b123f"
    qa         = "2c92c0f971c65e010171c778475b123f"
  }
}

variable "web_app_plan_id_summit_annual" {
  type = map(string)

  default = {
    production = "2c92a00d71c96bac0171e04476b22f7f"
    stage      = "2c92c0f971c65dfe0171c788a91609f8"
    dev        = "2c92c0f971c65dfe0171c788a91609f8"
    qa         = "2c92c0f971c65dfe0171c788a91609f8"
  }
}

variable "web_app_plan_id_comp" {
  type = map(string)

  default = {
    production = "2c92a00768760ab9016882b3de04203c"
    stage      = "2c92c0f867cae0610167f0be07ed01dd"
    dev        = "2c92c0f867cae0610167f0be07ed01dd"
    qa         = "2c92c0f867cae0610167f0be07ed01dd"
  }
}

variable "web_app_plan_id_legacy_monthly" {
  type = map(string)

  default = {
    production = "2c92a00768760ab9016882b3ddb22023"
    stage      = "2c92c0f9682c376c01682fede7405c6d"
    dev        = "2c92c0f9682c376c01682fede7405c6d"
    qa         = "2c92c0f9682c376c01682fede7405c6d"
  }
}

variable "web_app_plan_id_legacy_annual" {
  type = map(string)

  default = {
    production = "2c92a00768760ab9016882b3ddbf2028"
    stage      = "2c92c0f9682c376c01682ff06e7768f4"
    dev        = "2c92c0f9682c376c01682ff06e7768f4"
    qa         = "2c92c0f9682c376c01682ff06e7768f4"
  }
}

variable "web_app_plan_id_buy_one_get_one_free" {
  type = map(string)

  default = {
    production = "2c92a0fc6aba0719016abc86220d6eaa"
    stage      = "2c92c0f86a8dd422016aa27dafb455bb"
    dev        = "2c92c0f86a8dd422016aa27dafb455bb"
    qa         = "2c92c0f86a8dd422016aa27dafb455bb"
  }
}

variable "web_app_plan_id_buy_two_get_two_free" {
  type = map(string)

  default = {
    production = "2c92a00d6aba1434016abc8b773435ea"
    stage      = "2c92c0f96a8ddb4b016a999bc2a85398"
    dev        = "2c92c0f96a8ddb4b016a999bc2a85398"
    qa         = "2c92c0f96a8ddb4b016a999bc2a85398"
  }
}

variable "web_app_plan_id_free_trial" {
  type = map(string)

  default = {
    production = "2c92a00c6c755253016c8d2a29526522"
    stage      = "2c92c0f96bf5143e016c07629f550d4c"
    dev        = "2c92c0f96bf5143e016c07629f550d4c"
    qa         = "2c92c0f96bf5143e016c07629f550d4c"
  }
}

variable "web_app_plan_id_one_dollar_thirty_day_to_monthly" {
  type = map(string)

  default = {
    production = "2c92a00870a43e9f0170c09ad7ae7388"
    stage      = "2c92c0f8703d7c1201704039660e7ef9"
    dev        = "2c92c0f8703d7c1201704039660e7ef9"
    qa         = "2c92c0f8703d7c1201704039660e7ef9"
  }
}

variable "web_app_plan_id_one_month_trial_to_annual" {
  type = map(string)

  default = {
    production = "2c92a00871c96ba00171e044e3e34bc5"
    stage      = "2c92c0f871c64ceb0171cc0456363c35"
    dev        = "2c92c0f871c64ceb0171cc0456363c35"
    qa         = "2c92c0f871c64ceb0171cc0456363c35"
  }
}

variable "web_app_plan_id_four_month_gift" {
  type = map(string)

  default = {
    production = ""
    stage      = "2c92c0f96d1ae22b016d1cfcce9d47eb"
    dev        = "2c92c0f96d1ae22b016d1cfcce9d47eb"
    qa         = "2c92c0f96d1ae22b016d1cfcce9d47eb"
  }
}

variable "web_app_plan_id_annual_gift" {
  type = map(string)

  default = {
    production = ""
    stage      = "2c92c0f96ce30c39016cf9236d993ef6"
    dev        = "2c92c0f96ce30c39016cf9236d993ef6"
    qa         = "2c92c0f96ce30c39016cf9236d993ef6"
  }
}

variable "web_app_plan_id_live_gift" {
  type = map(string)

  default = {
    production = ""
    stage      = "2c92c0f96d1ae226016d1cff8d834376"
    dev        = "2c92c0f96d1ae226016d1cff8d834376"
    qa         = "2c92c0f96d1ae226016d1cff8d834376"
  }
}

variable "web_app_user_account_fmtv_migration_date" {
  type = map(string)

  default = {
    production = "1578614401000"
    stage      = "1578614401000"
    dev        = "1578614401000"
    qa         = "1576173536000"
  }
}

variable "web_app_render_concurrency" {
  type = map(string)

  default = {
    production = "2"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_robots_can_index" {
  type = map(string)

  default = {
    production = "1"
    stage      = "0"
    dev        = "0"
    qa         = "0"
  }
}

variable "web_app_robots_no_index_header" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_servers_brooklyn" {
  type = map(string)

  default = {
    production = "https://brooklyn.gaia.com/"
    stage      = "https://brooklyn-stage-f7ydas.gaia.com/"
    dev        = "https://brooklyn-dev-f7ydas.gaia.com/"
    qa         = "https://brooklyn-stage-f7ydas.gaia.com/"
  }
}

variable "web_app_servers_brooklyn_internal" {
  type = map(string)

  default = {
    production = "http://brooklyn-2098701765.us-west-2.elb.amazonaws.com/"
    stage      = "http://brooklyn-1557738542.us-west-2.elb.amazonaws.com/"
    dev        = "http://brooklyn-227475451.us-west-2.elb.amazonaws.com/"
    qa         = "http://brooklyn-1557738542.us-west-2.elb.amazonaws.com/"
  }
}

variable "web_app_logger_name" {
  type = map(string)

  default = {
    production = "web-app-production"
    stage      = "web-app-stage"
    dev        = "web-app-dev"
    qa         = "web-app-design"
  }
}

variable "web_app_logger_stream_name" {
  type = map(string)

  default = {
    production = "production"
    stage      = "stage"
    dev        = "dev"
    qa         = "design"
  }
}

variable "web_app_logger_group" {
  type = map(string)

  default = {
    production = "web-app"
    stage      = "web-app"
    dev        = "web-app"
    qa         = "web-app"
  }
}

variable "web_app_origin" {
  type = map(string)

  default = {
    production = "https://www.gaia.com"
    stage      = "https://www-stg-4b2c19.gaia.com"
    dev        = "https://www-dev-ced749.gaia.com"
    qa         = "https://webapp-design-4b2c19.gaia.com"
  }
}

variable "web_app_user_account_hostname" {
  type = map(string)

  default = {
    production = "account.gaia.com"
    stage      = "account-stg-4b2c19.gaia.com"
    dev        = "account-dev-ced749.gaia.com"
    qa         = "account-stg-4b2c19.gaia.com"
  }
}

variable "web_app_youbora_account_code" {
  type = map(string)

  default = {
    production = "gaiam"
    stage      = "gaiamdev"
    dev        = "gaiamdev"
    qa         = "gaiamdev"
  }
}

variable "web_app_services_member_home_path" {
  type = map(string)

  default = {
    production = "v7/memberhome"
    stage      = "v7/memberhome"
    dev        = "v7/memberhome"
    qa         = "v7/memberhome"
  }
}

variable "web_app_features_comments" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_community_v2" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "0"
  }
}

variable "web_app_features_disable_impression_cap" {
  type = map(string)

  default = {
    production = "0"
    stage      = "0"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_filters_fitness" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_filters_original" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_filters_conscious" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_gift_checkout" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_marketing_proxy_anonymous_home" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_marketing_special_offer_promo_popup" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_multiple_playlists" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "0"
  }
}

variable "web_app_features_share_view" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_share_v3" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_profit_well_retain" {
  type = map(string)

  default = {
    production = "0"
    stage      = "0"
    dev        = "0"
    qa         = "0"
  }
}

variable "web_app_features_checkout_paypal" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_checkout_paypal_currencies" {
  type = map(string)

  default = {
    production = "USD,MXN,CAD,EUR,GBP,AUD,NZD,COP,ARS"
    stage      = "USD,MXN,CAD,EUR,GBP,AUD,NZD,COP,ARS"
    dev        = "USD,MXN,CAD,EUR,GBP,AUD,NZD,COP,ARS"
    qa         = "USD,MXN,CAD,EUR,GBP,AUD,NZD,COP,ARS"
  }
}

variable "web_app_features_disable_impresssion_cap" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "0"
  }
}



variable "web_app_features_development_kitchen_sink" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_email_capture" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_amp_articles" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_hapyak" {
  type = map(string)

  default = {
    production = "0"
    stage      = "0"
    dev        = "0"
    qa         = "0"
  }
}

variable "web_app_features_smartling" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "0"
    qa         = "1"
  }
}

variable "web_app_features_player_detect_lang" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_player_gated_previews" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_language_select_dialog" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_language_select_globe_anonymous" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_language_select" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_language_select_anonymous" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_language_select_fr" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_language_select_de" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_apiclient_omit_language" {
  type = map(string)

  default = {
    production = "0"
    stage      = "0"
    dev        = "0"
    qa         = "0"
  }
}

variable "web_app_features_zendesk_chat" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_user_language_es_zendesk_help_link" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_anonymous_user_data_privacy_compliance" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_user_account_account_pause" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_user_account_decline_plan_303" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_user_account_cancel_v2" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_user_account_change_plan_v2" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_user_account_cancel_offer" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_show_user_portal_search_results" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_features_skunk_150_related_series_nids" {
  type = map(string)

  default = {
    production = "147321,151151,167116,167186"
    stage      = "32126,33611,123091,128961"
    dev        = "32126,33611,123091,128961"
    qa         = "32126,33611,123091,128961"
  }
}

variable "web_app_gtm_id" {
  type = map(string)

  default = {
    production = "GTM-56R2PJ"
    stage      = "GTM-T2Q9Q9"
    dev        = "GTM-TLQ5QP"
    qa         = "GTM-T2Q9Q9"
  }
}

variable "web_app_amp_gtm_id" {
  type = map(string)

  default = {
    production = "GTM-59SGZZR"
    stage      = "GTM-PR2645C"
    dev        = "GTM-T5N3D6D"
    qa         = "GTM-PR2645C"
  }
}

variable "web_app_emarsys_testmode" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_emarsys_testmode_user_id" {
  type = map(string)

  default = {
    production = ""
    stage      = "82696"
    dev        = "82696"
    qa         = "82696"
  }
}

variable "web_app_emarsys_testmode_user_email" {
  type = map(string)

  default = {
    production = ""
    stage      = "gaiamtesting@gmail.com"
    dev        = "gaiamtesting@gmail.com"
    qa         = "gaiamtesting@gmail.com"
  }
}

variable "web_app_app_cache_max_age" {
  type = map(string)

  default = {
    production = "3600"
    stage      = "60"
    dev        = "60"
    qa         = "60"
  }
}

variable "web_app_google_recaptcha_site_key" {
  type = map(string)

  default = {
    production = "6LdiM74UAAAAAOW1SNiPwghXSo23P2kvdmOJcoVb"
    stage      = "6Le6LL4UAAAAADvi5hvmbgWmwqOp53Q8BlVkMogr"
    dev        = "6Le6LL4UAAAAADvi5hvmbgWmwqOp53Q8BlVkMogr"
    qa         = "6Le6LL4UAAAAADvi5hvmbgWmwqOp53Q8BlVkMogr"
  }
}

variable "web_app_google_recaptcha_secret_key" {
  type = map(string)

  default = {
    production = "6LdiM74UAAAAAD-ZxBWVZTRUDxL_QzeyvPQV-mW9"
    stage      = "6Le6LL4UAAAAAKZW4Finv24jSTkC718YmayGa6EN"
    dev        = "6Le6LL4UAAAAAKZW4Finv24jSTkC718YmayGa6EN"
    qa         = "6Le6LL4UAAAAAKZW4Finv24jSTkC718YmayGa6EN"
  }
}

variable "web_app_google_recaptcha_api_url" {
  type = map(string)

  default = {
    production = "https://www.google.com/recaptcha/api/"
    stage      = "https://www.google.com/recaptcha/api/"
    dev        = "https://www.google.com/recaptcha/api/"
    qa         = "https://www.google.com/recaptcha/api/"
  }
}

variable "web_app_google_recaptcha_threshold" {
  type = map(string)

  default = {
    production = 0.5
    stage      = 0.1
    dev        = 0.1
    qa         = 0.1
  }
}

variable "web_app_profitwell_api_key" {
  type = map(string)

  default = {
    production = "d9478ec7d852dc43e6ed1d66446a71f6"
    stage      = "8c5cbf10d05478d435d63c338c924517"
    dev        = "8c5cbf10d05478d435d63c338c924517"
    qa         = "8c5cbf10d05478d435d63c338c924517"
  }
}

variable "web_app_redirect_https" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_redirect_hostname" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_app_maintenance_enabled" {
  type = map(string)

  default = {
    production = "0"
    stage      = "0"
    dev        = "0"
    qa         = "0"
  }
}

variable "web_app_app_maintenance_max_age" {
  type = map(string)

  default = {
    production = "3600"
    stage      = "3600"
    dev        = "3600"
    qa         = "3600"
  }
}

variable "web_app_live_access_video_player" {
  type = map(string)

  default = {
    production = "nJT90Ih1DD"
    stage      = "3Q5QeiCD1"
    dev        = "3Q5QeiCD1"
    qa         = "3Q5QeiCD1"
  }
}

variable "web_app_brightcove_player" {
  type = map(string)

  default = {
    production = "yYBDCeuuH"
    stage      = "YPXFvrHOv"
    dev        = "YPXFvrHOv"
    qa         = "YPXFvrHOv"
  }
}

variable "web_app_log_level" {
  type = map(string)

  default = {
    production = "warn"
    stage      = "debug"
    dev        = "debug"
    qa         = "debug"
  }
}

variable "web_app_log_level_server" {
  type = map(string)

  default = {
    production = "info"
    stage      = "debug"
    dev        = "debug"
    qa         = "debug"
  }
}

variable "web_app_log_std_out_enabled" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_log_std_out_server_enabled" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_facebook_login_app_id" {
  type = map(string)

  default = {
    production = "415355325316829"
    stage      = "1826191974346856"
    dev        = "554573481551051"
    qa         = "161531197799478"
  }
}

variable "web_app_marketing_layer_domain_name" {
  type = map(string)

  default = {
    production = "internal-gaia-wordpress-2138620146.us-west-2.elb.amazonaws.com"
    stage      = "internal-gaia-wordpress-840842152.us-west-2.elb.amazonaws.com"
    dev        = "internal-gaia-wordpress-840842152.us-west-2.elb.amazonaws.com"
    qa         = "internal-gaia-wordpress-840842152.us-west-2.elb.amazonaws.com"
  }
}

variable "web_app_marketing_layer_url" {
  type = map(string)

  default = {
    production = "http://internal-gaia-wordpress-2138620146.us-west-2.elb.amazonaws.com/"
    stage      = "http://internal-gaia-wordpress-840842152.us-west-2.elb.amazonaws.com/"
    dev        = "http://internal-gaia-wordpress-840842152.us-west-2.elb.amazonaws.com/"
    qa         = "http://internal-gaia-wordpress-840842152.us-west-2.elb.amazonaws.com/"
  }
}

variable "web_app_assets_s3_bucket_domain_name" {
  default = "gaia-web-app-assets-us-west-2.s3-us-west-2.amazonaws.com"
}

// web-app monitoring
variable "web_app_monitor_metric_name" {
  default = "HealthyHostCount"
}

variable "web_app_monitor_period" {
  default = 60
}

variable "web_app_monitor_evaluation_periods" {
  default = 5
}

variable "web_app_monitor_threshold" {
  default = 1
}

variable "web_app_monitor_comparison_operator" {
  default = "LessThanOrEqualToThreshold"
}

variable "web_app_monitor_statistic" {
  default = "Minimum"
}

variable "web_app_monitor_notification" {
  default = []
}

variable "debug_show_username" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

// api
variable "api_desired_count" {
  type = map(string)

  default = {
    production = 3
    stage      = 2
    dev        = 1
    qa         = 2
  }

  description = "autoscaling mininmum number of api containers to run in ecs service"
}

variable "api_autoscaling_min_capacity" {
  type = map(string)

  default = {
    production = 3
    stage      = 2
    dev        = 1
    qa         = 2
  }

  description = "autoscaling mininmum number of api containers to run in ecs service"
}

variable "api_autoscaling_max_capacity" {
  type = map(string)

  default = {
    production = 20
    stage      = 6
    dev        = 2
    qa         = 3
  }

  description = "autoscaling maximum number of api containers to run in ecs service"
}

variable "api_alb_idle_timeout" {
  default = 30
}

variable "api_alb_ssl_certificate_arn" {
  type = map(string)

  default = {
    production = "arn:aws:acm:us-west-2:529102669868:certificate/6165fd91-ec07-4885-a2de-c834b4be6bd2"
    stage      = "arn:aws:acm:us-west-2:486204669126:certificate/1c74c2ca-7dc1-4147-a8c1-ad3f55edf999"
    dev        = "arn:aws:acm:us-west-2:247926314232:certificate/3b081028-5a1f-429d-9a8e-61492ed7a464"
    qa         = "arn:aws:acm:us-west-2:486204669126:certificate/1c74c2ca-7dc1-4147-a8c1-ad3f55edf999"
  }
}

variable "recipes_category_term_id" {
  type = map(string)

  default = {
    dev        = "121945"
    stage      = "121945"
    production = "122335"
    qa         = "121945"
  }
}

variable "web_app_film_filters_enabled" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_guides_enabled" {
  type = map(string)

  default = {
    production = "0"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_service_unavailable" {
  type = map(string)

  default = {
    production = "0"
    stage      = "0"
    dev        = "0"
    qa         = "0"
  }
}

variable "web_app_recommended_practices_term_blacklist" {
  type = map(string)

  default = {
    production = "122199, 122200"
    stage      = "121876, 121877"
    dev        = "121876, 121877"
    qa         = "121876, 121877"
  }
}

variable "web_app_features_detail_page_v2" {
  type = map(string)

  default = {
    production = "0"
    stage      = "0"
    dev        = "0"
    qa         = "0"
  }
}

variable "web_app_zendesk_chat_on_checkout_enabled" {
  type = map(string)

  default = {
    production = "1"
    stage      = "1"
    dev        = "1"
    qa         = "1"
  }
}

variable "web_app_anonymous_uuid_secret" {
  type = map(string)

  default = {
    production = "LqtMS77lxur9gvDMofpx"
    stage      = "KRmrRfKwSlyQQsyU7BIS"
    dev        = "nE4hYyujLohHaRxQ7rRd"
    qa         = "apOLdCK92eEQjx9rVjNp"
  }
}

variable "gaia_authorization_header" {
}

