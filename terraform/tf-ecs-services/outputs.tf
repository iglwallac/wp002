output "dns_name" {
  value = "${aws_alb.container-alb.dns_name}"
}

output "zone_id" {
  value = "${aws_alb.container-alb.zone_id}"
}

output "task_role_id" {
  value = "${aws_iam_role.task-role.id}"
}

output "task_role_arn" {
  value = "${aws_iam_role.task-role.arn}"
}

