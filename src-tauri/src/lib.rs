// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
async fn get_system_info() -> Result<serde_json::Value, String> {
    let os = env::consts::OS;
    let arch = env::consts::ARCH;
    let current_time = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| e.to_string())?.as_secs();
    let ram_available = if cfg!(target_os = "linux") {
        std::fs::read_to_string("/proc/meminfo")
            .ok()
            .and_then(|content| {
                content.lines()
                    .find(|l| l.starts_with("MemAvailable:"))
                    .and_then(|l| l.split_whitespace().nth(1))
                    .and_then(|s| s.parse::<u64>().ok())
                    .map(|kb| kb * 1024)
            })
            .unwrap_or(0)
    } else { 0 };

    Ok(serde_json::json!({
        "os": os,
        "arch": arch,
        "ram_available": ram_available,
        "current_time": current_time
    }))
}

#[tauri::command]
async fn move_window(window: tauri::Window, x: f64, y: f64) -> Result<(), String> {
    window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x: x as i32, y: y as i32 }))
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_system_info, move_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
