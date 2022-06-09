## Get the variables from the workspace yaml file and add them to the scope of the main.tf
locals {
  # Fetches the environment/workspace
  workspace_path = "./config/${terraform.workspace}.yaml" 
  defaults       = file("./config/${path.module}/default.yaml")
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
  region  = local.settings.primary_region
}

module "base-vm" {
  source = "git@github.com:SolarCS/terraform-common-modules.git//google-compute-instance?ref=v0.4.2"

  project_id             = data.google_project.project.project_id
  project_number         = data.google_project.project.number
  zone                   = local.settings.primary_zone
  env                    = local.settings.env
  tenant                 = local.settings.tenant
  purpose                = "mongo-client"
  delete_protection_flag = local.settings.delete_protection_flag

  machine_type       = local.settings.machine_type
  machine_disk_size  = local.settings.root_disk_size_gb

  subnetwork  = data.google_compute_subnetwork.shared-vpc-subnet.self_link
  internal_ip = data.google_compute_address.vm-mongo-client-internal-static-ip-address.address

  tags = ["mongo-client-vm"]
}

resource "null_resource" "setup-mongo-client-vm" {
  depends_on = [module.base-vm]

  provisioner "local-exec" {
    command = <<-EOT
      gcloud beta compute ssh --zone ${local.settings.primary_zone} deploy@${module.base-vm.name} --tunnel-through-iap --project ${data.google_project.project.project_id} --command '
        wget -qO - https://www.mongodb.org/static/pgp/server-${local.settings.mongo_major_version}.asc | sudo apt-key add - &&
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/${local.settings.mongo_major_version} multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org.list &&
        sudo apt update &&
        sudo apt install -y mongodb-org-shell mongodb-org-tools
      '
    EOT
  }

  triggers = {
    always_run = local.settings.mongo_major_version 
  }
}
