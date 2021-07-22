data "aws_caller_identity" "current" {
}

data "terraform_remote_state" "ops" {
  backend = "atlas"

  config = {
    name = "gaia-technology/ops-us-west-2"
  }
}

data "terraform_remote_state" "logger" {
  backend = "atlas"

  config = {
    name = "gaia-technology/${var.accounts[data.aws_caller_identity.current.account_id]}-${var.region}-logger"
  }
}

resource "aws_cloudwatch_log_group" "task-log" {
  name              = "ECS-${var.service_name}"
  retention_in_days = "400"

  tags = {
    Application = var.service_name
  }
}

resource "aws_cloudwatch_log_subscription_filter" "cloudwatch_lambda_filter" {
  name            = "lambda-filter-${var.service_name}"
  log_group_name  = "ECS-${var.service_name}"
  filter_pattern  = ""
  destination_arn = data.terraform_remote_state.logger.outputs.lambda_to_es_arn

  lifecycle {
    create_before_destroy = true
  }
}

resource "random_pet" "name" {
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id   = random_pet.name.id
  action         = "lambda:InvokeFunction"
  function_name  = data.terraform_remote_state.logger.outputs.lambda_to_es_name
  principal      = "logs.${var.region}.amazonaws.com"
  source_account = data.aws_caller_identity.current.account_id
  source_arn     = "arn:aws:logs:${var.region}:${data.aws_caller_identity.current.account_id}:log-group:ECS-${var.service_name}:*"
  //qualifier      = "${aws_lambda_alias.loggly_alias.name}"
}

resource "aws_iam_policy" "ecs-service" {
  name   = "ecs-service-${var.service_name}"
  policy = file("${path.module}/ecsService.json")
}

data "template_file" "task_policy" {
  template = file("${path.module}/taskPolicy.json")
}

resource "aws_iam_policy" "task-policy" {
  name   = "ecs-task-${var.service_name}"
  policy = data.template_file.task_policy.rendered
}

resource "aws_iam_role" "ecs-role" {
  name = "tf_ecs_role-${var.service_name}"

  assume_role_policy = file("${path.module}/ecsRole.json")
}

resource "aws_iam_role" "task-role" {
  name               = "tf_task_${var.service_name}"
  assume_role_policy = file("${path.module}/taskRole.json")
}

resource "aws_iam_policy_attachment" "ecs-attachment" {
  name       = "tf-ecs-attachment-${var.service_name}"
  policy_arn = aws_iam_policy.ecs-service.arn
  roles      = [aws_iam_role.ecs-role.name]
}

resource "aws_iam_policy_attachment" "task-attachment" {
  name       = "tf-ecs-attachment-${var.service_name}-task"
  policy_arn = aws_iam_policy.task-policy.arn
  roles      = [aws_iam_role.task-role.name]
}

#Will only attach a policy if set to true
resource "aws_iam_policy_attachment" "extra-task-attachment" {
  count      = var.create_task_policy ? 1 : 0
  name       = "tf-ecs-attachment-${var.service_name}-extra-task"
  policy_arn = var.task_policy_arn
  roles      = [aws_iam_role.task-role.name]
}

resource "aws_security_group" "allow-http" {
  name        = "tf-sg-${var.service_name}"
  description = "Allow inbound 80 and 443"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "tf-${var.service_name}"
  }
}

resource "aws_alb_target_group" "tf-alb-http" {
  name     = var.service_name
  port     = var.container_port
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    interval            = var.health_check_interval
    path                = var.health_check_path
    port                = var.health_check_port
    protocol            = var.health_check_protocol
    timeout             = var.health_check_timeout
    healthy_threshold   = var.health_check_healthy_threshold
    unhealthy_threshold = var.health_check_unhealthy_threshold
    matcher             = var.health_check_matcher
  }
}

resource "aws_alb" "container-alb" {
  name            = var.service_name
  internal        = var.internal
  security_groups = [aws_security_group.allow-http.id]
  subnets         = var.alb_subnets
  idle_timeout    = var.alb_idle_timeout

  tags = {
    Name        = "tf-alb-${var.service_name}"
    Environment = "dev"
  }
}

resource "aws_alb_listener" "front_end_https" {
  load_balancer_arn = aws_alb.container-alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.ssl_certificate_id

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "application/json"
      message_body = file("${path.module}/albRuleMessageBody.json")
      status_code  = "401"
    }
  }
}

# Listener rule to forward requests with Cloudfront-Authorization header.
resource "aws_lb_listener_rule" "cloudfront_authorization_https_rule" {
  listener_arn = aws_alb_listener.front_end_https.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.tf-alb-http.arn
  }

  condition {
    http_header {
      http_header_name = "Cloudfront-Authorization"
      values           = [var.gaia_authorization_header]
    }
  }
}

# Listener rule to forward requests from Source IPs.
resource "aws_lb_listener_rule" "source_ip_whitelist_https_rule" {
  listener_arn = aws_alb_listener.front_end_https.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.tf-alb-http.arn
  }

  condition {
    source_ip {
      values = concat(formatlist("%s/32", var.nat_gateway_ips), var.gaia_source_ips)
    }
  }
}

resource "aws_alb_listener" "front_end_http" {
  load_balancer_arn = aws_alb.container-alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "application/json"
      message_body = file("${path.module}/albRuleMessageBody.json")
      status_code  = "401"
    }
  }
}

# Listener rule to forward requests with Cloudfront-Authorization header.
resource "aws_lb_listener_rule" "cloudfront_authorization_http_rule" {
  listener_arn = aws_alb_listener.front_end_http.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.tf-alb-http.arn
  }

  condition {
    http_header {
      http_header_name = "Cloudfront-Authorization"
      values           = [var.gaia_authorization_header]
    }
  }
}

# Listener rule to forward requests from Source IPs.
resource "aws_lb_listener_rule" "source_ip_whitelist_http_rule" {
  listener_arn = aws_alb_listener.front_end_http.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.tf-alb-http.arn
  }

  condition {
    source_ip {
      values = concat(formatlist("%s/32", var.nat_gateway_ips), var.gaia_source_ips)
    }
  }
}

resource "aws_ecs_task_definition" "task-definition" {
  family                = var.service_name
  container_definitions = var.container_definition
  task_role_arn         = aws_iam_role.task-role.arn
}

resource "aws_ecs_service" "ecs_service" {
  name                               = var.service_name
  cluster                            = var.cluster_name
  task_definition                    = aws_ecs_task_definition.task-definition.arn
  desired_count                      = var.desired_count
  iam_role                           = aws_iam_role.ecs-role.arn
  deployment_minimum_healthy_percent = var.deployment_minimum_healthy_percent
  deployment_maximum_percent         = var.deployment_maximum_percent

  load_balancer {
    target_group_arn = aws_alb_target_group.tf-alb-http.arn
    container_name   = var.service_name
    container_port   = var.container_port
  }

  lifecycle {
    ignore_changes = [desired_count]
  }
}

data "aws_iam_role" "autoscaling_role" {
  // See http://docs.aws.amazon.com/ApplicationAutoScaling/latest/APIReference/application-autoscaling-service-linked-roles.html
  name = "AWSServiceRoleForApplicationAutoScaling_ECSService"
}

resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = var.autoscaling_max_capacity
  min_capacity       = var.autoscaling_min_capacity
  resource_id        = "service/${var.cluster_name}/${var.service_name}"
  role_arn           = data.aws_iam_role.autoscaling_role.arn
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  //  depends_on = ["aws_ecs_service.ecs_service"]
}

resource "aws_appautoscaling_policy" "scale_down_policy" {
  // Include target id in policy name as workaround for
  // https://github.com/terraform-providers/terraform-provider-aws/issues/240
  name = "scale-down-${aws_appautoscaling_target.ecs_target.id}"

  resource_id        = "service/${var.cluster_name}/${var.service_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 300
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_upper_bound = -15
      scaling_adjustment          = -4
    }
    step_adjustment {
      metric_interval_lower_bound = -15
      metric_interval_upper_bound = -10
      scaling_adjustment          = -3
    }
    step_adjustment {
      metric_interval_lower_bound = -10
      metric_interval_upper_bound = -5
      scaling_adjustment          = -2
    }
    step_adjustment {
      metric_interval_lower_bound = -5
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }
}

resource "aws_appautoscaling_policy" "scale_up_policy" {
  // Include target id in policy name as workaround for
  // https://github.com/terraform-providers/terraform-provider-aws/issues/240
  name = "scale-up-${aws_appautoscaling_target.ecs_target.id}"

  resource_id        = "service/${var.cluster_name}/${var.service_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 180
    metric_aggregation_type = "Average"

    step_adjustment {
      metric_interval_lower_bound = 0
      metric_interval_upper_bound = 10
      scaling_adjustment          = 1
    }
    step_adjustment {
      metric_interval_lower_bound = 10
      metric_interval_upper_bound = 20
      scaling_adjustment          = 2
    }
    step_adjustment {
      metric_interval_lower_bound = 20
      metric_interval_upper_bound = 30
      scaling_adjustment          = 3
    }
    step_adjustment {
      metric_interval_lower_bound = 30
      scaling_adjustment          = 4
    }
  }
}

