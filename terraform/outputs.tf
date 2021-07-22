output "cloudfront_hosted_zone_id" {
  value = aws_cloudfront_distribution.web_app.hosted_zone_id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.web_app.domain_name
}

