mod point;
mod positionSolver;
mod config;
mod sql_pool;
mod mqtt_cli;

use config::Config;

fn main() {
    println!("Hello, world!");
    let config = Config::init();

    let _sql_pool = sql_pool::new(config.connection_string(), config.sqlserver.pool_size );

}
