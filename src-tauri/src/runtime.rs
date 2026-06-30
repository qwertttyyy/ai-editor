use serde::Serialize;
use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::time::Duration;

const DEFAULT_LLAMA_CPP_PORT: u16 = 11435;
const HEALTH_CHECK_TIMEOUT_MS: u64 = 250;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeSidecarStatus {
    runtime: String,
    is_bundled: bool,
    is_installed: bool,
    expected_binary_name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeHealthStatus {
    runtime: String,
    readiness: String,
    status: String,
    reason: Option<String>,
    endpoint: String,
    message: String,
}

#[tauri::command]
pub fn get_llama_cpp_sidecar_status() -> RuntimeSidecarStatus {
    RuntimeSidecarStatus {
        runtime: "llama-cpp".to_string(),
        is_bundled: false,
        is_installed: false,
        expected_binary_name: expected_sidecar_binary_name(),
    }
}

#[tauri::command]
pub fn check_llama_cpp_runtime_health(port: Option<u16>) -> RuntimeHealthStatus {
    let port = port.unwrap_or(DEFAULT_LLAMA_CPP_PORT);
    let endpoint = format!("http://127.0.0.1:{port}/health");

    if port != DEFAULT_LLAMA_CPP_PORT {
        return RuntimeHealthStatus {
            runtime: "llama-cpp".to_string(),
            readiness: "not-ready".to_string(),
            status: "failed".to_string(),
            reason: Some("health-check-failed".to_string()),
            endpoint,
            message: "Unsupported llama.cpp health-check port.".to_string(),
        };
    }

    match check_local_health_endpoint(port) {
        Ok(HealthCheckResult::Ready) => RuntimeHealthStatus {
            runtime: "llama-cpp".to_string(),
            readiness: "ready".to_string(),
            status: "running".to_string(),
            reason: None,
            endpoint,
            message: "llama.cpp health endpoint is ready.".to_string(),
        },
        Ok(HealthCheckResult::Unhealthy) => RuntimeHealthStatus {
            runtime: "llama-cpp".to_string(),
            readiness: "not-ready".to_string(),
            status: "failed".to_string(),
            reason: Some("health-check-failed".to_string()),
            endpoint,
            message: "llama.cpp health endpoint responded but is not ready.".to_string(),
        },
        Err(error) => RuntimeHealthStatus {
            runtime: "llama-cpp".to_string(),
            readiness: "not-ready".to_string(),
            status: "stopped".to_string(),
            reason: Some("process-stopped".to_string()),
            endpoint,
            message: format!("llama.cpp health endpoint is not reachable: {error}"),
        },
    }
}

fn expected_sidecar_binary_name() -> String {
    let extension = if cfg!(target_os = "windows") {
        ".exe"
    } else {
        ""
    };

    format!("llama-server{extension}")
}

enum HealthCheckResult {
    Ready,
    Unhealthy,
}

fn check_local_health_endpoint(port: u16) -> Result<HealthCheckResult, String> {
    let address = ("127.0.0.1", port)
        .to_socket_addrs()
        .map_err(|error| error.to_string())?
        .next()
        .ok_or_else(|| "No localhost socket address resolved.".to_string())?;
    let timeout = Duration::from_millis(HEALTH_CHECK_TIMEOUT_MS);
    let mut stream = TcpStream::connect_timeout(&address, timeout)
        .map_err(|error| format!("connect failed: {error}"))?;

    stream
        .set_read_timeout(Some(timeout))
        .map_err(|error| error.to_string())?;
    stream
        .set_write_timeout(Some(timeout))
        .map_err(|error| error.to_string())?;
    stream
        .write_all(build_health_request().as_bytes())
        .map_err(|error| format!("write failed: {error}"))?;

    let mut buffer = [0_u8; 256];
    let bytes_read = stream
        .read(&mut buffer)
        .map_err(|error| format!("read failed: {error}"))?;
    let response = String::from_utf8_lossy(&buffer[..bytes_read]);

    if is_http_ok(&response) {
        Ok(HealthCheckResult::Ready)
    } else {
        Ok(HealthCheckResult::Unhealthy)
    }
}

fn build_health_request() -> &'static str {
    "GET /health HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"
}

fn is_http_ok(response: &str) -> bool {
    response.starts_with("HTTP/1.1 200") || response.starts_with("HTTP/1.0 200")
}

#[cfg(test)]
mod tests {
    use super::{
        build_health_request, check_llama_cpp_runtime_health, expected_sidecar_binary_name,
        is_http_ok,
    };

    #[test]
    fn health_request_targets_local_health_only() {
        let request = build_health_request();

        assert!(request.starts_with("GET /health HTTP/1.1"));
        assert!(request.contains("Host: 127.0.0.1"));
    }

    #[test]
    fn parses_http_ok_status() {
        assert!(is_http_ok("HTTP/1.1 200 OK\r\n\r\n"));
        assert!(!is_http_ok("HTTP/1.1 503 Service Unavailable\r\n\r\n"));
    }

    #[test]
    fn sidecar_name_is_llama_server() {
        assert!(expected_sidecar_binary_name().starts_with("llama-server"));
    }

    #[test]
    fn rejects_non_default_health_check_ports() {
        let status = check_llama_cpp_runtime_health(Some(12345));

        assert_eq!(status.readiness, "not-ready");
        assert_eq!(status.status, "failed");
        assert_eq!(status.reason.as_deref(), Some("health-check-failed"));
    }
}
