resource "aws_ssm_parameter" "gaia_authorization_header" {
  name  = "/${var.service_name}/${var.env}/gaia_authorization_header"
  type  = "SecureString"
  value = var.gaia_authorization_header
}

