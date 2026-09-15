// The app serves the Blockly Games static site that is embedded as the
// frontend (`frontendDist` points at `../site`) and bundled offline.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
