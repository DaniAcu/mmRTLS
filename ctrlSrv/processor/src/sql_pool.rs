extern crate mysql;
extern crate r2d2;
extern crate r2d2_mysql;
use crate::config::Config;
use crate::config::ConnectionType;

use mysql::{Opts, OptsBuilder};
use r2d2_mysql::MysqlConnectionManager;
use std::sync::Arc;

impl Config {
    pub fn connection_string(&self) -> String {
        let mut conn = String::new();
        match self.sqlserver.connection_type {
            ConnectionType::MariaDB => conn.push_str("mysql"),
            _ => panic!("Unimplemented sql connection type"),
        }

        let usr = if self.database.passwd.is_empty() {
            format!("{}", self.database.user)
        } else {
            format!("{}:{}", self.database.user, self.database.passwd)
        };

        let url = format!("{}:{}", self.sqlserver.address, self.sqlserver.port);
        let database = self.database.db.clone();

        format!(
            "{conn}://{usr}@{url}/{db}",
            conn = conn,
            usr = usr,
            url = url,
            db = database
        )
    }
}

pub fn new(url: String, size: u32) -> Arc<r2d2::Pool<MysqlConnectionManager>> {
    let opts = Opts::from_url(&url).unwrap();
    let builder = OptsBuilder::from_opts(opts);
    let manager = MysqlConnectionManager::new(builder);
    let pool = Arc::new(r2d2::Pool::builder().max_size(size).build(manager).unwrap());

    pool
}
