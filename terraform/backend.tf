terraform {
  backend "gcs" {
    bucket = "service-tf-state-ch"
    prefix = "track-atlas-ch/state"
  }
}
