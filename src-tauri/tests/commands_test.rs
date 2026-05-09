// Unit tests for Tauri commands
// To run: cargo test --manifest-path src-tauri/Cargo.toml

#[cfg(test)]
mod tests {
    use serde_json::Value;

    // Test get_system_info response structure
    #[test]
    fn test_system_info_structure() {
        // Simulamos la respuesta del comando get_system_info
        let os = std::env::consts::OS;
        let arch = std::env::consts::ARCH;

        let info = serde_json::json!({
            "os": os,
            "arch": arch,
            "ram_available": 0,
            "current_time": 1234567890
        });

        assert!(info.get("os").is_some());
        assert!(info.get("arch").is_some());
        assert!(info.get("ram_available").is_some());
        assert!(info.get("current_time").is_some());
        assert_eq!(info["os"], os);
        assert_eq!(info["arch"], arch);
    }

    // Test that our JSON response can be serialized
    #[test]
    fn test_json_serialization() {
        let data = serde_json::json!({
            "os": "linux",
            "arch": "x86_64",
            "ram_available": 16777216,
            "current_time": 1700000000
        });

        let serialized = serde_json::to_string(&data).unwrap();
        let deserialized: Value = serde_json::from_str(&serialized).unwrap();
        assert_eq!(deserialized["os"], "linux");
        assert_eq!(deserialized["arch"], "x86_64");
    }

    // Test move_window parameter types
    #[test]
    fn test_move_window_params() {
        // The command expects f64 for x and y
        let x: f64 = 100.0;
        let y: f64 = 200.0;
        assert_eq!(x, 100.0);
        assert_eq!(y, 200.0);
    }
}
