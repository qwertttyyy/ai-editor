mod hardware;
mod model_storage;
mod runtime;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            hardware::get_hardware_profile,
            model_storage::get_model_storage_info,
            runtime::check_llama_cpp_runtime_health,
            runtime::get_llama_cpp_sidecar_status
        ])
        .run(tauri::generate_context!())
        .expect("failed to run ai-editor");
}
