resource "aws_cloudwatch_metric_alarm" "ecs_services_healthy_cloudwatch" {
  alarm_name          = "${aws_alb_target_group.tf-alb-http.name} ${var.metric_name}"
  comparison_operator = var.comparison_operator
  evaluation_periods  = var.evaluation_periods
  metric_name         = var.metric_name
  namespace           = "AWS/ApplicationELB"
  period              = var.period
  statistic           = var.statistic
  threshold           = var.threshold

  alarm_description = "CloudWatch metric alarm: ${aws_alb_target_group.tf-alb-http.name} ${var.metric_name} ${var.comparison_operator}"

  dimensions = {
    LoadBalancer = aws_alb.container-alb.arn_suffix
    TargetGroup  = aws_alb_target_group.tf-alb-http.arn_suffix
  }

  alarm_actions = var.notification
}

resource "aws_cloudwatch_metric_alarm" "alb_cloudwatch" {
  count               = var.alarm_count
  alarm_name          = "${aws_alb.container-alb.arn_suffix}-${var.metric_names[count.index]}"
  comparison_operator = var.comparison_operators[count.index]
  evaluation_periods  = var.num_cycles[count.index]
  metric_name         = var.metric_names[count.index]
  namespace           = var.namespace
  period              = var.periods[count.index]
  statistic           = var.statistics[count.index]
  threshold           = var.thresholds[count.index]
  alarm_actions       = var.notification
  treat_missing_data  = "missing"

  alarm_description = "CloudWatch metric alarm: ${aws_alb.container-alb.arn_suffix} ${var.metric_names[count.index]} ${var.comparison_operators[count.index]}"

  dimensions = {
    LoadBalancer = aws_alb.container-alb.arn_suffix
  }

  insufficient_data_actions = []
}

resource "aws_cloudwatch_metric_alarm" "service_highcpu_scaleup" {
  alarm_name          = "${var.service_name}-scaleup"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "5"
  datapoints_to_alarm = "3"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "70"

  alarm_description = "CPU Autoscaling alarm to scale up"

  dimensions = {
    ServiceName = aws_ecs_service.ecs_service.name
    ClusterName = var.cluster_name
  }

  alarm_actions = [
    aws_appautoscaling_policy.scale_up_policy.arn,
  ]
}

resource "aws_cloudwatch_metric_alarm" "service_highcpu_scaledown" {
  alarm_name          = "${var.service_name}-scaledown"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "10"
  datapoints_to_alarm = "6"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "40"

  alarm_description = "CPU Autoscaling alarm to scale down"

  dimensions = {
    ServiceName = aws_ecs_service.ecs_service.name
    ClusterName = var.cluster_name
  }

  alarm_actions = [
    aws_appautoscaling_policy.scale_down_policy.arn,
  ]
}

