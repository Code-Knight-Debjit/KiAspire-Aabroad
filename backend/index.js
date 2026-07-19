const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const port = process.env.PORT || 5000;

if (require.main === module) {
	app.listen(port, () => {
		console.log(`Backend server running on http://localhost:${port}`);
	});
}

module.exports = app;
