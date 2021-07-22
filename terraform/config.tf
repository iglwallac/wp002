provider "aws" {
  region  = var.region
  version = "2.42.0"
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_caller_identity" "current" {
}

data "aws_kms_alias" "ssm" {
  name = "alias/aws/ssm"
}

data "aws_iam_role" "jenkins" {
  name = "jenkins-role"
}

data "aws_acm_certificate" "splat_gaia_com" {
  domain      = "*.gaia.com"
  statuses    = ["ISSUED"]
  most_recent = true
}

// Get certificate ARNs for cloudfront from us-east-1 region
data "aws_acm_certificate" "us_east_1_splat_gaia_com" {
  provider    = aws.us_east_1
  domain      = "*.gaia.com"
  statuses    = ["ISSUED"]
  most_recent = true
}

data "aws_security_group" "ecs_instance_sg" {
  name = "${var.clusters[var.env]}-instance-sg"
}

data "terraform_remote_state" "ops" {
  backend = "atlas"

  config = {
    name = "gaia-technology/ops-us-west-2"
  }
}

data "terraform_remote_state" "vpc" {
  backend = "atlas"

  config = {
    name = "gaia-technology/${var.env_alias[var.env]}-${var.region}-vpc"
  }
}

data "terraform_remote_state" "apps" {
  backend = "atlas"

  config = {
    name = "gaia-technology/${var.apps_alias[var.env]}-${var.region}"
  }
}

data "terraform_remote_state" "pci" {
  backend = "atlas"

  config = {
    name = "gaia-technology/${var.env_alias[var.env]}-${var.region}-pci"
  }
}

# apps_alias var maps 'production' to 'prod'.  This is to avoid conflict with env_alias.
variable "apps_alias" {
  type = map(string)

  default = {
    dev        = "dev"
    stage      = "stage"
    production = "prod"
    qa         = "stage"
  }
}

variable "docker_repo_url" {
  default = "585221583245.dkr.ecr.us-west-2.amazonaws.com"
}

variable "env_alias" {
  type = map(string)

  default = {
    dev        = "dev"
    stage      = "stage"
    production = "production"
    qa         = "stage"
  }
}

variable "clusters" {
  type = map(string)

  default = {
    dev        = "ecs-dev"
    stage      = "ecs-stage"
    production = "ecs-prod"
    qa         = "ecs-stage"
  }
}

