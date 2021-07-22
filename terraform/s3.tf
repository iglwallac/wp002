resource "aws_s3_bucket" "web_app_bucket" {
  bucket = "gaia-web-app-${var.region}-${var.env}"
  acl    = "public-read"

  tags = {
    Service     = var.service_name
    Environment = "production"
  }
}

data "aws_iam_policy_document" "web_app_bucket_s3_policy" {
  statement {
    sid    = "OBJECTS"
    effect = "Allow"
    principals {
      type = "AWS"
      identifiers = [
        module.web_app.task_role_arn,
        "arn:aws:iam::464947630906:role/QblServiceRole",
        "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/SAML-Engineer",
      ]
    }
    actions = [
      "s3:Get*",
      "s3:Put*",
      "s3:Delete*",
    ]
    resources = ["arn:aws:s3:::${aws_s3_bucket.web_app_bucket.id}/*"]
  }

  statement {
    sid    = "BUCKET"
    effect = "Allow"
    principals {
      type = "AWS"
      identifiers = [
        module.web_app.task_role_arn,
        "arn:aws:iam::464947630906:role/QblServiceRole",
        "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/SAML-Engineer",
      ]
    }
    actions = [
      "s3:ListBucket",
    ]
    resources = ["arn:aws:s3:::${aws_s3_bucket.web_app_bucket.id}"]
  }
}

resource "aws_s3_bucket_policy" "web_app_bucket_s3_policy" {
  bucket = aws_s3_bucket.web_app_bucket.id
  policy = data.aws_iam_policy_document.web_app_bucket_s3_policy.json
}

