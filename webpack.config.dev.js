const path = require("path");
module.exports = {
	entry: "./src/main.ts",
	mode: "development",
	output: {
		path: path.resolve(__dirname, "dist/dev"),
		filename: "dev.js"
	},
	devtool: "source-map",
	resolve: {
		extensions: [".ts", ".tsx", ".js"]
	},
	watch: true,
	watchOptions: {
		ignored: /node_modules/,
		aggregateTimeout: 200,
		poll: 1000
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /(node_modules|bower_components)/,
				options: {
					transpileOnly: true // 只做语言转换，而不做类型检查
				}
			},
			{
				test: /\.ts$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							[
								"@babel/preset-env",
								{
									targets: {
										"chrome": "104"
									}
								}
							],
							["@babel/preset-typescript"]
						],
						plugins: ["@babel/transform-runtime"]
					}
				},
				exclude: /(node_modules|bower_components)/
			},
			{
				test: /\.js$/,
				loader: "source-map-loader",
				exclude: /(node_modules|bower_components)/
			}
		]
	}
};