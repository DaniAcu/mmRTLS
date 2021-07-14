import mysql       from 'mysql'
import { appLog }  from '../helpers/logger.js'


class Watchable {
    constructor(condition, checksum, callbacks) {
        this.condition = condition
        this.checksum = checksum
        this.callbacks = callbacks
    }
}

class DbController {
    constructor(ip, port, user, pass, database, watcherRefreshMs) {
        this.mySQLConnectionOptions = {
            host: ip,
            user: user,
            password: pass,
            port: port,
            database: database
        }
        this.onConnectedListeners = []
        this.dbWatcherListeners = new Map()
        this.watcherRefreshMs = watcherRefreshMs

        appLog("Connecting MySQL to " + JSON.stringify(this.mySQLConnectionOptions))
        this.mysqlConn = mysql.createConnection(this.mySQLConnectionOptions)

        let self = this;
        this.mysqlConn.connect(function(err) {
            if (err) {
                appLog("Could not connect to MySQL DB: " + err)
                process.exit() //@TODO: See how to manage error and disconnection scenarios
            }
            appLog("Connected to MySQL DB")
            if (self.onConnectedListeners.length > 0) {
                self.onConnectedListeners.forEach(listener => {
                    listener()
                });                
            }
            //@TODO: On disconnection this timer is destroyed
            appLog("MySQL watcher every " + self.watcherRefreshMs + " ms")
            this.queryChecksumTimer = setInterval(() => {
                self.queryChecksums() 
            }, self.watcherRefreshMs);    
          })

        this.watchedConditions = new Map()        
    }

    listenOnConnected(callback) {
        this.onConnectedListeners.push(callback)
    }

    close() {
        this.mysqlConn.stop()
    }
    
    queryPromise(query, params) {
        return new Promise((resolve, reject) => {
            this.mysqlConn.query(query, params, function (error, results, fields) {
                if (error) {
                    return reject(error)
                } else {
                    return resolve(results)
                }
            })
        })
    }

    async queryChecksums() {
        this.dbWatcherListeners.forEach((watchable, condition) => {
            watchable.callbacks.forEach(callback => {
                let self = this
                new Promise(function(resolve, reject) {
                    resolve(self.queryChecksum(condition))
                }).then(newChecksum => {
                    if (newChecksum != watchable.checksum) {
                        watchable.checksum = newChecksum
                        callback()
                    }
                })
            })
        })
    }

    async queryChecksum(condition) {
        try {
            let result = await this.queryPromise("checksum table " + condition)
            
            if (result[0] === undefined) {
                return -1
            } else {
                return result[0].Checksum
            }
        } catch (error) {
            appLog("MySQL query failed " + error)
            return -1
        }
    }
    
    async addWatcher(condition, callback) {
        let watchable = null
        if (this.dbWatcherListeners.has(condition)) {
            watchable = this.dbWatcherListeners.get(condition)
        } else {
            watchable = new Watchable(condition, await this.queryChecksum(condition), [])
        }
        watchable.callbacks.push(callback)
        this.dbWatcherListeners.set(condition, watchable)
        appLog("Added condition \"" + condition + "\" to watched")       
    }

    removeWatcher(condition) {
        if (this.dbWatcherListeners.has(condition)) {
            appLog("Removed condition " + condition + " from watched")
            this.dbWatcherListeners.delete(condition)
        }
    }
}

export { DbController } 