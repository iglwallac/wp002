variable "cluster_name" {
}

variable "container_port" {
}

variable "host_port" {
}

variable "container_definition" {
}

variable "service_name" {
}

variable "desired_count" {
}

variable "autoscaling_min_capacity" {
}

variable "autoscaling_max_capacity" {
}

/**
 * ECS api specific tuning
 */
variable "deployment_minimum_healthy_percent" {
  default = 50
}

variable "deployment_maximum_percent" {
  default = 200
}

variable "alb_idle_timeout" {
  default = 60
}

variable "alb_subnets" {
  default = []
}

variable "vpc_id" {
}

variable "internal" {
  default = true
}

variable "ssl_certificate_id" {
}

variable "task_policy_arn" {
  default = ""
}

variable "create_task_policy" {
  default = false
}

variable "health_check_interval" {
  default = 5
}

variable "health_check_path" {
  default = "/"
}

variable "health_check_port" {
  default = "traffic-port"
}

variable "health_check_protocol" {
  default = "HTTP"
}

variable "health_check_timeout" {
  default = 3
}

variable "health_check_healthy_threshold" {
  default = 5
}

variable "health_check_unhealthy_threshold" {
  default = 2
}

variable "health_check_matcher" {
  default = 200
}

variable "metric_name" {
  default = "HealthyHostCount"
}

variable "period" {
  default = 60
}

variable "evaluation_periods" {
  default = 5
}

variable "threshold" {
  default = 1
}

variable "comparison_operator" {
  default = "LessThanOrEqualToThreshold"
}

variable "statistic" {
  default = "Minimum"
}

variable "notification" {
  default = ["arn:aws:sns:us-west-2:1234567890:no-alarm"]
}

/*
CloudWatch general configurations.
*/

variable "alarm_count" {
  default = "1"
}

variable "metric_names" {
  default = ["UnHealthyHostCount"]
}

variable "periods" {
  default = ["60"]
}

variable "num_cycles" {
  default = ["5"]
}

variable "thresholds" {
  default = ["1"]
}

variable "namespace" {
  default = "AWS/ApplicationELB"
}

variable "comparison_operators" {
  default = ["GreaterThanOrEqualToThreshold", "GreaterThanOrEqualToThreshold", "GreaterThanOrEqualToThreshold"]
}

variable "statistics" {
  default = ["Sum", "Sum", "Maximum"]
}

variable "region" {
  default = "us-west-2"
}

variable "accounts" {
  type = map(string)

  default = {
    "247926314232" = "dev"
    "233814217631" = "dev-v1"
    "486204669126" = "stage"
    "529102669868" = "production"
    "585221583245" = "ops"
  }
}

variable "env" {
}

variable "gaia_authorization_header" {
}

variable "nat_gateway_ips" {
  default = []
}

variable "gaia_source_ips" {
  default = [
    "8.8.226.5/32",
  ]
}

