use serde::Serialize;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelStorageInfo {
    app_data_directory: String,
    models_directory: String,
}

#[tauri::command]
pub fn get_model_storage_info(app: AppHandle) -> Result<ModelStorageInfo, String> {
    let app_data_directory = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Failed to resolve app data directory: {error}"))?;
    let models_directory = app_data_directory.join("models");

    std::fs::create_dir_all(&models_directory)
        .map_err(|error| format!("Failed to create model storage directory: {error}"))?;

    Ok(ModelStorageInfo {
        app_data_directory: app_data_directory.to_string_lossy().into_owned(),
        models_directory: models_directory.to_string_lossy().into_owned(),
    })
}
