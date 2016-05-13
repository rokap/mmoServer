var config = {
    appName: "mmoServer",
    port: 3000,
    db: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'databse'
    }
};

process.title = config.appName;
process.stdout.write('\033c');

module.exports = config;