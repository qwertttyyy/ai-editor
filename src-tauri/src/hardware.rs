use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CpuInfo {
    architecture: String,
    logical_cores: Option<usize>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HardwareProfile {
    platform: String,
    cpu: CpuInfo,
    gpus: Vec<GpuInfo>,
    preferred_backend: String,
    safe_fallback: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GpuInfo {
    id: String,
    vendor: String,
    backend: String,
    name: Option<String>,
    vram_bytes: Option<u64>,
}

#[tauri::command]
pub fn get_hardware_profile() -> HardwareProfile {
    HardwareProfile {
        platform: normalize_platform(std::env::consts::OS).to_string(),
        cpu: CpuInfo {
            architecture: normalize_architecture(std::env::consts::ARCH).to_string(),
            logical_cores: std::thread::available_parallelism()
                .ok()
                .map(|threads| threads.get()),
        },
        gpus: Vec::new(),
        preferred_backend: "cpu".to_string(),
        safe_fallback: true,
    }
}

fn normalize_platform(platform: &str) -> &str {
    match platform {
        "linux" => "linux",
        "macos" => "macos",
        "windows" => "windows",
        _ => "unknown",
    }
}

fn normalize_architecture(architecture: &str) -> &str {
    match architecture {
        "x86_64" => "x64",
        "aarch64" => "arm64",
        "x86" | "i686" => "x86",
        _ => "unknown",
    }
}

#[cfg(test)]
mod tests {
    use super::{normalize_architecture, normalize_platform};

    #[test]
    fn normalizes_known_platforms() {
        assert_eq!(normalize_platform("linux"), "linux");
        assert_eq!(normalize_platform("macos"), "macos");
        assert_eq!(normalize_platform("windows"), "windows");
        assert_eq!(normalize_platform("freebsd"), "unknown");
    }

    #[test]
    fn normalizes_known_architectures() {
        assert_eq!(normalize_architecture("x86_64"), "x64");
        assert_eq!(normalize_architecture("aarch64"), "arm64");
        assert_eq!(normalize_architecture("i686"), "x86");
        assert_eq!(normalize_architecture("mips"), "unknown");
    }
}
