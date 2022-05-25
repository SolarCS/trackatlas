locals {
  secrets = toset([
    "dd-api-key",
  ])
}

resource "google_secret_manager_secret" "gsm-secrets" {
  provider = google-beta
  project  = data.google_project.project.project_id
  for_each = local.secrets
  
  secret_id = each.value
  replication {
    automatic = true
  }
}
