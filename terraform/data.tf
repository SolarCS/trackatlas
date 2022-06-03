data "google_projects" "project_list" {
  filter = "parent.id:${local.settings.parent_folder_id} name:${local.settings.env}-${local.settings.project_id_base}*"
}

data "google_project" "project" {
  project_id = data.google_projects.project_list.projects[0].project_id
}

data "google_compute_network" "network" {
  project = local.settings.network_project_id
  name    = local.settings.network_name 
}

data "google_compute_subnetwork" "shared-vpc-subnet" {
  project = local.settings.network_project_id
  region  = local.settings.primary_region
  name    = local.settings.shared_vpc_subnet_name
}

data "google_compute_address" "vm-mongo-client-internal-static-ip-address" {
  project  = data.google_project.project.project_id
  region   = local.settings.primary_region
  name     = "vm-mongo-client-internal-ip-address"
}

data "google_secret_manager_secret_version" "dd-api-key" {
  provider = google-beta
  project  = data.google_project.project.project_id
  secret   = "dd-api-key"
}
