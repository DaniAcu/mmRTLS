#![allow(dead_code)]
use serde::{Deserialize, Serialize};
use std::{env, fs, io::Write};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct Config {
    pub sqlserver: SqlServer,
    pub database: DataBase,
    pub mqtt: Mqtt,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct SqlServer {
    pub connection_type: ConnectionType,
    pub address: String,
    pub port: u16,
    pub pool_size: u32,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct DataBase {
    pub user: String,
    pub passwd: String,
    pub db: String,
}
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
pub struct Mqtt {
    pub address: String,
    pub port: u16,
    pub user: String,
    pub passwd: String,
}
#[derive(Debug, Copy, Clone, Deserialize, Serialize, PartialEq)]
pub enum ConnectionType {
    PosgreSQL,
    MariaDB,
    MySQL,
}

impl Config {
    pub fn default() -> Config {
        Config {
            sqlserver: SqlServer::default(),
            database: DataBase::default(),
            mqtt: Mqtt::default(),
        }
    }

    pub fn init() -> Config {
        let args: Vec<String> = env::args().collect();

        let path = if args.len() > 1 {
            args[1].as_str()
        } else {
            "Config.toml"
        };

        if let Ok(config) = Config::read(path) {
            println!("Succesfully loaded {}", path);
            if config.sqlserver.connection_type != ConnectionType::MariaDB {
                panic!("Only connection type available for the momment MariaDB");
            }
            config
        } else {
            println!("Unable to load {}, using default config", path);
            Config::default()
        }
    }

    pub fn read(path: &str) -> Result<Config, toml::de::Error> {
        let file = fs::read_to_string(path).unwrap_or(String::from(""));
        let config = toml::from_str(file.as_str());
        config
    }

    pub fn write(self: &Self, path: &'static str) {
        let toml = toml::to_string(&self).unwrap();
        let mut file = std::fs::File::create(path).expect("create failed");
        write!(&mut file, "{}", toml).unwrap();
    }
}

impl SqlServer {
    fn default() -> SqlServer {
        SqlServer {
            connection_type: ConnectionType::MariaDB,
            address: "localhost".to_string(),
            port: 1660,
            pool_size: 15,
        }
    }
}
impl DataBase {
    fn default() -> DataBase {
        DataBase {
            user: "default".to_string(),
            passwd: "default".to_string(),
            db: "mmRTLS".to_string(),
        }
    }
}

impl Mqtt {
    fn default() -> Mqtt {
        Mqtt {
            address: "localhost".to_string(),
            port: 1883,
            user: "".to_string(),
            passwd: "".to_string(),
        }
    }
}

#[test]
fn config_test() {
    let default = Config::default();
    default.write("default.toml");
    let test = Config::read("default.toml").unwrap();

    assert_eq!(default, test);
}
