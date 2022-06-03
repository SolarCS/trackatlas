locals {
  # Fetches the environment/workspace
  workspace_path = "./config/${terraform.workspace}.yaml" 
  defaults       = file("./config/default.yaml")
  workspace = fileexists(local.workspace_path) ? file(local.workspace_path) : yamlencode({})
  only_in_production_mapping = {
    sandbox     = 0
    develop     = 0
    qaload      = 0
    staging     = 0
    production  = 1
  }
  settings = merge(
    yamldecode(local.defaults),
    yamldecode(local.workspace),
    {
      # Use this variable as count = local.settings.only_in_production to add features to prod only
      only_in_production = local.only_in_production_mapping[terraform.workspace]
    }
  )
}

output "config" {
  value = local.settings
}

provider "google-beta" {
  project = data.google_project.project.project_id
  zone    = local.settings.primary_zone
}

resource "google_compute_address" "vm-mongo-client-internal-static-ip-address" {
  project      = data.google_project.project.project_id
  region       = local.settings.primary_region
  subnetwork   = data.google_compute_subnetwork.shared-vpc-subnet.id
  name         = "vm-mongo-client-internal-ip-address"
  address_type = "INTERNAL"
}
