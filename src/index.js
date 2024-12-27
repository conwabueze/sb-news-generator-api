import app from './server.js';
import config from './config/index.js';

app.listen(config.port, () => {
    console.log(`App running on port ${config.port}...`);
});