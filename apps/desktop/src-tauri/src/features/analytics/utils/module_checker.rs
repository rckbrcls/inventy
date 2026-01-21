use serde_json::Value;

/// Verifica se um módulo está habilitado baseado no features_config
pub fn is_module_enabled(features_config: Option<&str>, module_code: &str) -> bool {
    let config_str = match features_config {
        Some(s) => s,
        None => return true, // Sem configuração = todos habilitados (compatibilidade)
    };

    let config: Value = match serde_json::from_str(config_str) {
        Ok(c) => c,
        Err(_) => return true, // JSON inválido = todos habilitados (safe default)
    };

    let config_obj = match config.as_object() {
        Some(obj) => obj,
        None => return true,
    };

    match config_obj.get(module_code) {
        Some(val) => val.as_bool().unwrap_or(true),
        None => true, // Módulo não definido = habilitado (compatibilidade retroativa)
    }
}

/// Módulos core sempre habilitados
pub const CORE_MODULES: &[&str] = &["products", "customers", "transactions", "orders", "payments"];

/// Verifica se um módulo é core (sempre habilitado)
pub fn is_core_module(module_code: &str) -> bool {
    CORE_MODULES.contains(&module_code)
}

/// Verifica módulo com fallback para core
pub fn is_module_enabled_or_core(features_config: Option<&str>, module_code: &str) -> bool {
    if is_core_module(module_code) {
        return true;
    }
    is_module_enabled(features_config, module_code)
}
